import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://obtahwmcoqrcauscpksv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9idGFod21jb3FyY2F1c2Nwa3N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MDQ3OTQsImV4cCI6MjEwMzI4MDc5NH0.TyDAdy9XWFAtOHBLH9-9z6K-SSwSDTkaa3cJsLVQxro';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
