// Check Supabase connection and table status
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../.env')
const envContent = readFileSync(envPath, 'utf-8')

const env = {}
envContent.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) env[key.trim()] = rest.join('=').trim()
})

const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY
const YOUR_UUID = 'bff69471-dca3-41cf-ac3d-4124053c940a'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkStatus() {
  console.log('═══════════════════════════════════════════════════')
  console.log('   SUPABASE CONNECTION CHECK')
  console.log('═══════════════════════════════════════════════════')
  console.log(`\n🔗 URL: ${supabaseUrl}`)
  console.log(`👤 Your UUID: ${YOUR_UUID}\n`)

  // Test 1: Can we connect?
  console.log('1️⃣ Testing connection...')
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) {
    console.log(`   ⚠️  No active session (expected for anon key)`);
  } else {
    console.log(`   ✅ Connection OK`)
  }

  // Test 2: Do tables exist?
  console.log('\n2️⃣ Checking if projects table exists...')
  const { error: projectsError } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
  
  if (projectsError) {
    console.log(`   ❌ Projects table NOT accessible`)
    console.log(`   Error: ${projectsError.message}`)
    console.log(`\n   💡 ACTION REQUIRED:`)
    console.log(`   1. Go to: https://supabase.com/dashboard/project/bnkwtlbtnvoitmjvefvw/sql`)
    console.log(`   2. Create new query`)
    console.log(`   3. Paste entire contents of: supabase/schema.sql`)
    console.log(`   4. Click RUN`)
    return false
  }
  
  console.log(`   ✅ Projects table exists`)

  // Test 3: How many projects do you own?
  console.log('\n3️⃣ Counting your projects...')
  const { count, error: countError } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', YOUR_UUID)
  
  if (countError) {
    console.log(`   ⚠️  Could not count: ${countError.message}`)
  } else {
    console.log(`   ✅ You own ${count} project(s)`)
  }

  // Test 4: List them
  console.log('\n4️⃣ Your projects:')
  const { data: yourProjects } = await supabase
    .from('projects')
    .select('id, title, status, category')
    .eq('owner_id', YOUR_UUID)
    .limit(10)
  
  if (yourProjects && yourProjects.length > 0) {
    yourProjects.forEach(p => {
      console.log(`   - ${p.title} [${p.status}] (${p.category})`)
    })
    if (yourProjects.length === 10) {
      console.log(`   ... and more`)
    }
  } else {
    console.log(`   (no projects found)`)
  }

  // Test 5: Check total projects (any owner)
  console.log('\n5️⃣ Total projects in database (all owners):')
  const { count: totalCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
  
  console.log(`   📊 ${totalCount || 0} total project(s)`)

  return true
}

checkStatus().catch(err => {
  console.error('\n💥 Check failed:', err.message)
  process.exit(1)
})
