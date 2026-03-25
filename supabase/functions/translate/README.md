# translate — Supabase Edge Function

Translates text via DeepL Free, falls back to LibreTranslate.

## Deploy

```bash
# 1. Install Supabase CLI if needed
npm install -g supabase

# 2. Link to your project
supabase link --project-ref bnkwtlbtnvoitmjvefvw

# 3. Set your DeepL Free API key (get one free at https://www.deepl.com/pro#developer)
supabase secrets set DEEPL_API_KEY=your-deepl-free-key-here

# 4. Deploy the function
supabase functions deploy translate
```

## Without DeepL

If `DEEPL_API_KEY` is not set, the function automatically falls back to LibreTranslate (no key needed, lower quality).

## Request format

```json
{ "texts": ["Hello world"], "sourceLang": "en" }
```

## Response format

```json
{ "translations": [{ "en": "Hello world", "pt": "Olá mundo" }] }
```
