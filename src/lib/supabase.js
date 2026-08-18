/**
 * Supabase Client — Frontend (anon key only)
 *
 * Uses VITE_ prefixed env vars from .env (gitignored).
 * The anon key is safe for browser use; all access control
 * is enforced by Row Level Security policies in the database.
 *
 * ❌ NEVER import or use the service_role key here.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] Missing env vars.\n' +
    'Copy .env.example → .env and fill in your project URL and anon key.\n' +
    'Get them from: Supabase Dashboard → Settings → API'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
