// Translation service
// Batches all pending translatable fields into a single DeepL call per project.
// Triggers only when text looks like a complete sentence/phrase.
// Handles: title, description, kpi_label, kpi_detail, meta[].value, content_blocks.content
import { supabase } from '../lib/supabase'

const BATCH_DELAY_MS = 4000
// Complete if: ends with punctuation OR is 30+ chars (a real phrase, not a single word)
const COMPLETE_RE = /[.!?…]\s*$|.{30,}/

// pending: Map<projectId, Map<fieldKey, {text, lang}>>
const pending = new Map()
let timer = null

function isComplete(text) {
  return COMPLETE_RE.test(text?.trim() ?? '')
}

function schedule() {
  clearTimeout(timer)
  timer = setTimeout(flush, BATCH_DELAY_MS)
}

async function flush() {
  if (!pending.size) return
  const snapshot = new Map(pending)
  pending.clear()

  for (const [projectId, fields] of snapshot) {
    const keys = [...fields.keys()]
    const texts = keys.map(k => fields.get(k).text)
    const sourceLang = fields.values().next().value.lang

    try {
      const { data, error } = await supabase.functions.invoke('translate', {
        body: { texts, sourceLang }
      })
      if (error || !data?.translations) continue

      // Build DB update — each field becomes full JSONB {pt, en}
      const updates = {}
      keys.forEach((key, i) => {
        const t = data.translations[i]
        // key may be a dot-path for nested fields e.g. "meta.2.value"
        if (!key.startsWith('meta.')) {
          updates[key] = t
        }
      })

      // Handle meta separately — need to patch the array
      const metaKeys = keys.filter(k => k.startsWith('meta.'))
      if (metaKeys.length) {
        const { data: row } = await supabase.from('projects').select('meta').eq('id', projectId).single()
        if (row?.meta) {
          const meta = [...row.meta]
          metaKeys.forEach(key => {
            const idx = parseInt(key.split('.')[1])
            const t = data.translations[keys.indexOf(key)]
            if (meta[idx]) meta[idx] = { ...meta[idx], value: t }
          })
          updates.meta = meta
        }
      }

      if (Object.keys(updates).length) {
        await supabase.from('projects').update(updates).eq('id', projectId)
      }
    } catch (e) {
      console.warn('[translate] flush failed', projectId, e)
    }
  }
}

/**
 * Save a manually-corrected translation to the glossary.
 * Called automatically when user edits a translation via InlineEdit.
 * @param {string} sourceText  - original text in sourceLang
 * @param {string} sourceLang  - 'pt'|'en'
 * @param {string} targetText  - human translation
 * @param {string} targetLang  - 'pt'|'en'
 */
export async function saveToGlossary(sourceText, sourceLang, targetText, targetLang) {
  if (!sourceText?.trim() || !targetText?.trim()) return
  await supabase.from('translation_glossary').upsert(
    { source_text: sourceText.trim(), source_lang: sourceLang, target_text: targetText.trim(), target_lang: targetLang },
    { onConflict: 'source_lang,source_text,target_lang' }
  )
}

/**
 * Queue a project field for translation.
 * @param {string} projectId
 * @param {string} field  - 'title'|'description'|'kpi_label'|'kpi_detail'|'meta.0.value' etc.
 * @param {string} text   - raw text typed by user
 * @param {string} lang   - 'pt'|'en'
 */
export function queueTranslation(projectId, field, text, lang) {
  if (!text || !isComplete(text)) return
  if (!pending.has(projectId)) pending.set(projectId, new Map())
  pending.get(projectId).set(field, { text, lang })
  schedule()
}

/**
 * Queue a content block for translation (stored in project_content_blocks table).
 * @param {string} blockId
 * @param {string} text
 * @param {string} lang
 */
export async function translateBlock(blockId, content, lang) {
  // content may be JSONB {pt,en} or raw string — extract source text
  const text = typeof content === 'object' ? content[lang] : content
  if (!text || !isComplete(text)) return
  try {
    const { data, error } = await supabase.functions.invoke('translate', {
      body: { texts: [text], sourceLang: lang }
    })
    if (error || !data?.translations?.[0]) return
    await supabase.from('project_content_blocks')
      .update({ content: data.translations[0] })
      .eq('id', blockId)
  } catch (e) {
    console.warn('[translate] block failed', blockId, e)
  }
}
