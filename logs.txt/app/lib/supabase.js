// app/src/lib/supabase.js
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fdxasjaqmgifknblfetl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkeGFzamFxbWdpZmtuYmxmZXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxMDA4NzgsImV4cCI6MjA1NDY3Njg3OH0.a72gAMB015tlm8pdFBDWcj2xuZt9wqaojgseGDJXQoQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})