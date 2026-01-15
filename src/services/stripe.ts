import { supabase } from "./supabase";

type CreateIntentResponse = {
  clientSecret: string;
};

export async function createPaymentIntent(params: {
  amount: number;   // centavos: 29900
  currency: string; // "mxn"
  plan: string;     // "Semanal" | "Mensual" | "Anual"
}) {
  const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
  if (sessionErr) throw sessionErr;

  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error("No hay sesión activa. Vuelve a iniciar sesión.");

  const { data, error } = await supabase.functions.invoke<CreateIntentResponse>(
    "create-payment-intent",
    {
      body: params,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (error) throw new Error(error.message ?? "Edge Function error");
  if (!data?.clientSecret) throw new Error("No llegó clientSecret desde la Edge Function.");

  return data;
}
