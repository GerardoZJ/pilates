import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

export async function hardResetAuth() {
  // 1) signOut normal
  try {
    await supabase.auth.signOut();
  } catch {}

  // 2) borra TODOS los tokens viejos guardados en el device
  // Supabase guarda algo como: sb-<projectRef>-auth-token
  const keys = await AsyncStorage.getAllKeys();
  const sbKeys = keys.filter((k) => k.startsWith("sb-") && k.includes("auth-token"));
  if (sbKeys.length) {
    await AsyncStorage.multiRemove(sbKeys);
  }

  // 3) extra: limpia sesión en memoria
  try {
    await supabase.auth.setSession({
      access_token: "",
      refresh_token: "",
    } as any);
  } catch {}
}
