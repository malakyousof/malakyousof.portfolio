const SUPABASE_URL = 'https://rvajnsvmbrjqsdipgwdo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_4IInvxXqyEt8jxwIs2jpFg_b1pF_5Xh';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);