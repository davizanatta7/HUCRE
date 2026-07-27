import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// DIAGNÓSTICO
console.log("Testando URL:", supabaseUrl);
console.log("Testando Key:", supabaseAnonKey);

// 1. Cliente Padrão (para buscas públicas de produtos no site)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. Cliente com Autenticação (usado no Admin.jsx e rotas protegidas)
export const getSupabaseClient = (clerkToken = null) => {
  if (clerkToken) {
    console.log("Testando Token:", clerkToken);
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${clerkToken}`,
        },
      },
    });
  }

  return supabase;
};

// 3. Mantido para compatibilidade se você usou esse nome em outro lugar do projeto
export const getSupabaseClientWithAuth = getSupabaseClient;