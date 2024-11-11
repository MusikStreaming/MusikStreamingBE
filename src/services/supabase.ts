import { createClient } from "@supabase/supabase-js";
import { Database } from "@/models/types";
import env from "@/env";

const supabase = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_KEY);

export default supabase;
