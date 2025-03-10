import { createClient } from '@supabase/supabase-js';

// These environment variables will need to be set in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xuehdmslktlsgpoexilo.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1ZWhkbXNsa3Rsc2dwb2V4aWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNDA4ODIsImV4cCI6MjA1MTkxNjg4Mn0.YRsqqW8G-S3UvIrfXblDSqAlTE6fk7QCy1BSNVIgIe0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);