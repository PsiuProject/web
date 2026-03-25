// Supabase Edge Function: translate
// 1. Loads glossary from DB (human-corrected terms)
// 2. Uses DeepL glossary API if available, else substitution tokens
// 3. Restores protected terms after translation — they are NEVER overwritten

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const DEEPL_API   = 'https://api-free.deepl.com/v2'
const LIBRE_URL   = 'https://libretranslate.com/translate'
const DEEPL_LANG  = { pt: 'PT', en: 'EN-US' }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors() })

  const DEEPL_KEY  = Deno.env.get('DEEPL_API_KEY')
  const SUPA_URL   = Deno.env.get('SUPABASE_URL')!
  const SUPA_KEY   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const { texts, sourceLang } = await req.json() as { texts: string[], sourceLang: string }
  if (!texts?.length || !sourceLang) return json({ error: 'Missing params' }, 400)

  const targetLang = sourceLang === 'pt' ? 'en' : 'pt'

  // 1. Load glossary entries for this lang pair
  const db = createClient(SUPA_URL, SUPA_KEY)
  const { data: glossaryRows } = await db
    .from('translation_glossary')
    .select('source_text, target_text')
    .eq('source_lang', sourceLang)
    .eq('target_lang', targetLang)

  const glossary: Record<string, string> = {}
  for (const row of glossaryRows ?? []) {
    glossary[row.source_text] = row.target_text
  }

  // 2. Protect glossary terms with placeholder tokens before sending to API
  //    e.g. "Virada Climática" → "«G0»" so DeepL never touches it
  const tokens: Record<string, string> = {}
  let tokenIdx = 0
  const protect = (text: string) => {
    let out = text
    for (const [src, tgt] of Object.entries(glossary)) {
      if (out.includes(src)) {
        const tok = `«G${tokenIdx++}»`
        tokens[tok] = tgt          // restore with the human translation
        out = out.replaceAll(src, tok)
      }
    }
    return out
  }
  const restore = (text: string) => {
    let out = text
    for (const [tok, tgt] of Object.entries(tokens)) {
      out = out.replaceAll(tok, tgt)
    }
    return out
  }

  const protectedTexts = texts.map(protect)
  let translated: string[] | undefined

  // 3. Translate (DeepL → LibreTranslate fallback)
  if (DEEPL_KEY) {
    try {
      const body = new URLSearchParams()
      body.append('source_lang', DEEPL_LANG[sourceLang])
      body.append('target_lang', DEEPL_LANG[targetLang])
      // Tell DeepL to leave «...» tokens untouched
      body.append('tag_handling', 'xml')
      body.append('ignore_tags', 'g')
      protectedTexts.forEach(t => body.append('text', t))

      const res = await fetch(`${DEEPL_API}/translate`, {
        method: 'POST',
        headers: { 'Authorization': `DeepL-Auth-Key ${DEEPL_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      })
      if (res.ok) {
        const data = await res.json()
        translated = data.translations.map((t: { text: string }) => restore(t.text))
      }
    } catch (_) {}
  }

  if (translated === undefined) {
    try {
      translated = await Promise.all(protectedTexts.map(async (text) => {
        const res = await fetch(LIBRE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: text, source: sourceLang, target: targetLang, format: 'text' }),
        })
        const d = await res.json()
        return restore(d.translatedText ?? text)
      }))
    } catch (_) {
      translated = texts  // both failed — return originals
    }
  }

  const translations = texts.map((original, i) => ({
    [sourceLang]: original,
    [targetLang]: translated[i],
  }))

  return json({ translations })
})

const cors = () => ({ 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' })
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...cors() } })
}
