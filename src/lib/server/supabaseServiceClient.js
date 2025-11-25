import { createClient } from "@supabase/supabase-js";

import { SUPABASE_SERVICE_ROLE_KEY } from "$env/static/private"
import { PUBLIC_SUPABASE_URL } from "$env/static/public"

const supabaseUrl = PUBLIC_SUPABASE_URL;
const supabaseKey = SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
