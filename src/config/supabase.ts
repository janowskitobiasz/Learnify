import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cvzxaicmwcjnfuhezzpd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2enhhaWNtd2NqbmZ1aGV6enBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2OTI1NzMsImV4cCI6MjA1NDI2ODU3M30.RdLtVgcCZON9E1m3ZRWNYPh3MXZBnkPK0KfRLPr1XgY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);