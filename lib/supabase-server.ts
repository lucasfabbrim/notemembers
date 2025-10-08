import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Supabase environment variables are missing. Please add SUPABASE_URL and SUPABASE_KEY (or NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY) in the Vars section of the sidebar.",
  )
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})
