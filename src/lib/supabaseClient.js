import { createClient } from "@supabase/supabase-js";

import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public"

const supabaseUrl = PUBLIC_SUPABASE_URL;
const supabaseKey = PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function foobar1() {
    const { data, error } = await supabase
        .from('network')
        .select()
    
    return data
}

export async function foobar3() {
    const { data, error } = await supabase
        .from('cache')
        .select()
    
    return data
}