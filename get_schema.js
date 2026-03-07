const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: o } = await supabase.from('orders').select('deleted_at').limit(1);
  const { data: e } = await supabase.from('enquiries').select('deleted_at').limit(1);
  console.log("Orders error if missing column:", o);
  console.log("Enquiries error if missing column:", e);
}
check();
