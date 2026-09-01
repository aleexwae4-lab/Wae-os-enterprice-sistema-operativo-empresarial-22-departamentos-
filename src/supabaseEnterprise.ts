import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url=(import.meta.env.VITE_SUPABASE_URL as string|undefined)?.trim()
const publishableKey=(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string|undefined)?.trim()
  ||(import.meta.env.VITE_SUPABASE_ANON_KEY as string|undefined)?.trim()

export const enterpriseSupabaseConfigured=Boolean(url&&publishableKey)

export const enterpriseSupabase:SupabaseClient|null=enterpriseSupabaseConfigured
  ? createClient(url!,publishableKey!,{
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true},
      global:{headers:{'x-wae-product':'enterprise22'}},
    })
  : null
