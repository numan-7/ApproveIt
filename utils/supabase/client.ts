'use client'

import { createBrowserClient } from '@supabase/ssr'

const createClientForBrowser = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  )

export default createClientForBrowser