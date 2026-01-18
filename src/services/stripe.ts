import { supabase } from "./supabase";

type CreateIntentResponse = {
  clientSecret: string;
  customerId?: string | null;
};

export async function createPaymentIntent(params: {
  amount: number;
  currency: string;
  plan: string;
}) {
  const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
  const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

  // Asegura sesión fresca
  await supabase.auth.refreshSession();

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  // DEBUG: si esto no empieza con eyJ, NO es JWT válido
  console.log("SUPABASE_URL:", SUPABASE_URL);
  console.log("ANON starts:", (SUPABASE_ANON_KEY ?? "").slice(0, 10));
  console.log("JWT starts:", (accessToken ?? "").slice(0, 10));
  console.log("JWT length:", accessToken?.length);

  if (!accessToken) {
    throw new Error("No hay sesión activa. Haz logout/login.");
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/create-payment-intent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(params),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`Edge ${res.status}: ${text}`);

  const data = JSON.parse(text) as CreateIntentResponse;
  if (!data.clientSecret) throw new Error("No llegó clientSecret.");

  return data;
}
