import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ADICIONE ESTAS DUAS LINHAS PARA DIAGNÓSTICO:
console.log("Testando URL:", supabaseUrl);
console.log("Testando Key:", supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getSupabaseClientWithAuth = (clerkToken) => {
  console.log("Testando Token:", clerkToken);
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
  });
};