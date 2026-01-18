import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as Linking from "expo-linking";
import { supabase } from "../services/supabase";
import { useStripe } from "@stripe/stripe-react-native";
import { createPaymentIntent } from "../services/stripe";
import { hardResetAuth } from "../services/authReset";

const colors = {
  primary: "#8B9D83",
  primaryDark: "#6B7D63",
  background: "#F5F1E8",
  card: "#FFFFFF",
  textPrimary: "#2C3E2E",
  textSecondary: "#6B7D63",
  textTertiary: "#9AA99E",
  border: "#E0DDD6",
  success: "#7FA570",
};

const PLANS = ["Semanal", "Mensual", "Anual"] as const;
type Plan = (typeof PLANS)[number];

type PlanDetails = {
  name: Plan;
  price: string;
  amount: number; // centavos
  sessions: string;
  benefits: string[];
  recommended?: boolean;
};

const PLAN_DATA: PlanDetails[] = [
  {
    name: "Semanal",
    price: "$299",
    amount: 29900,
    sessions: "2 sesiones",
    benefits: [
      "Acceso a clases grupales",
      "Reserva con 24h de anticipación",
      "Flexibilidad semanal",
    ],
  },
  {
    name: "Mensual",
    price: "$999",
    amount: 99900,
    sessions: "8 sesiones",
    benefits: [
      "Acceso a clases grupales",
      "Reserva prioritaria",
      "1 clase de evaluación gratis",
      "Cancelación flexible",
    ],
    recommended: true,
  },
  {
    name: "Anual",
    price: "$9,999",
    amount: 999900,
    sessions: "100 sesiones",
    benefits: [
      "Acceso ilimitado a clases",
      "Reserva prioritaria",
      "Evaluaciones mensuales incluidas",
      "Descuento en talleres especiales",
      "Plan nutricional básico",
    ],
  },
];

export default function SubscriptionScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [fixingSession, setFixingSession] = useState(false);

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const fixSession = async () => {
    try {
      setFixingSession(true);
      await hardResetAuth();
      Alert.alert(
        "Sesión limpiada ✅",
        "Ahora vuelve a INICIAR SESIÓN de nuevo y luego intenta pagar."
      );
      // Opcional: te manda a la pantalla de Auth si existe
      // navigation.navigate("Auth");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo limpiar la sesión.");
    } finally {
      setFixingSession(false);
    }
  };

  const subscribe = async (plan: Plan) => {
    setLoading(true);
    setSelectedPlan(plan);

    try {
      // ✅ Validar sesión REAL (más confiable que getUser para este caso)
      const { data: sessionData, error: sessionErr } =
        await supabase.auth.getSession();
      if (sessionErr) throw sessionErr;

      const userId = sessionData.session?.user?.id;
      const accessToken = sessionData.session?.access_token;

      if (!userId || !accessToken) {
        throw new Error("No hay sesión activa. Inicia sesión otra vez.");
      }

      // DEBUG rápido
      console.log("USER_ID:", userId);
      console.log("JWT starts:", accessToken.slice(0, 10), "len:", accessToken.length);

      const planData = PLAN_DATA.find((p) => p.name === plan);
      if (!planData) throw new Error("Plan inválido.");

      // 1) Crear PaymentIntent (Edge Function)
      const intent = await createPaymentIntent({
        amount: planData.amount,
        currency: "mxn",
        plan: planData.name,
      });

      // 2) Init PaymentSheet
      const returnURL = Linking.createURL("stripe-redirect"); // tu scheme

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "Pilates Studio SLRC",
        paymentIntentClientSecret: intent.clientSecret,
        allowsDelayedPaymentMethods: true,
        returnURL,
      });

      if (initError) throw new Error(initError.message);

      // 3) Present PaymentSheet
      const { error: payError } = await presentPaymentSheet();
      if (payError) throw new Error(payError.message);

      // 4) Activar suscripción en tabla (porque pago OK)
      const ins = await supabase.from("subscriptions").insert({
        user_id: userId,
        plan,
        status: "active",
      });

      if (ins.error) throw ins.error;

      Alert.alert(
        "¡Pago y Suscripción Activados! ✨",
        `Tu plan ${plan} se activó correctamente (Stripe TEST).`,
        [
          { text: "Ver Historial", onPress: () => navigation.navigate("History") },
          { text: "Ir a Agenda", onPress: () => navigation.navigate("Agenda"), style: "cancel" },
        ]
      );
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo completar el pago.");
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Planes de Suscripción</Text>
          <Text style={styles.subtitle}>Elige el plan que mejor se adapte a tu ritmo</Text>
        </View>

        {/* 🔧 Botón para limpiar JWT */}
        <TouchableOpacity
          style={[styles.fixButton, fixingSession && styles.loadingButton]}
          onPress={fixSession}
          disabled={fixingSession || loading}
          activeOpacity={0.8}
        >
          {fixingSession ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <Text style={styles.fixButtonText}>🔧 Arreglar sesión (Reset JWT)</Text>
          )}
        </TouchableOpacity>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeText}>
            💡 <Text style={styles.noticeBold}>Modo Prueba:</Text> Usa tarjeta 4242 4242 4242 4242
          </Text>
        </View>

        <View style={styles.plansContainer}>
          {PLAN_DATA.map((planData) => {
            const isLoading = loading && selectedPlan === planData.name;

            return (
              <View
                key={planData.name}
                style={[styles.planCard, planData.recommended && styles.recommendedCard]}
              >
                {planData.recommended && (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>⭐ Más Popular</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <Text style={styles.planName}>{planData.name}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>{planData.price}</Text>
                    <Text style={styles.pricePeriod}>
                      /{planData.name === "Anual" ? "año" : planData.name === "Mensual" ? "mes" : "semana"}
                    </Text>
                  </View>
                </View>

                <View style={styles.sessionsContainer}>
                  <Text style={styles.sessionsText}>{planData.sessions}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.benefitsContainer}>
                  <Text style={styles.benefitsTitle}>Incluye:</Text>
                  {planData.benefits.map((benefit, index) => (
                    <View key={index} style={styles.benefitRow}>
                      <Text style={styles.checkmark}>✓</Text>
                      <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[
                    styles.subscribeButton,
                    planData.recommended && styles.recommendedButton,
                    isLoading && styles.loadingButton,
                  ]}
                  onPress={() => subscribe(planData.name)}
                  disabled={loading || fixingSession}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.card} />
                  ) : (
                    <Text style={styles.subscribeButtonText}>Pagar y Activar</Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>💳 Pago dentro de la app (requiere build)</Text>
          <Text style={styles.footerText}>🔄 Puedes cancelar en cualquier momento</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { marginTop: 24, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "700", color: colors.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: 15, color: colors.textSecondary, lineHeight: 22 },

  fixButton: {
    backgroundColor: "#3D4B3E",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 14,
  },
  fixButtonText: { color: colors.card, fontSize: 14, fontWeight: "700" },

  noticeCard: { backgroundColor: colors.primary, borderRadius: 12, padding: 16, marginBottom: 24 },
  noticeText: { fontSize: 14, color: colors.card, lineHeight: 20 },
  noticeBold: { fontWeight: "700" },

  plansContainer: { gap: 16, marginBottom: 24 },
  planCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  recommendedCard: { borderWidth: 2, borderColor: colors.success },
  recommendedBadge: {
    position: "absolute",
    top: -12,
    right: 20,
    backgroundColor: colors.success,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recommendedText: { color: colors.card, fontSize: 13, fontWeight: "700" },

  planHeader: { marginBottom: 12 },
  planName: { fontSize: 22, fontWeight: "700", color: colors.textPrimary, marginBottom: 8 },
  priceContainer: { flexDirection: "row", alignItems: "baseline" },
  price: { fontSize: 36, fontWeight: "700", color: colors.primaryDark },
  pricePeriod: { fontSize: 16, color: colors.textSecondary, marginLeft: 4 },

  sessionsContainer: {
    backgroundColor: colors.background,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  sessionsText: { fontSize: 14, fontWeight: "600", color: colors.textSecondary },

  divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },

  benefitsContainer: { marginBottom: 20 },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  benefitRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
  checkmark: { fontSize: 16, color: colors.success, marginRight: 10, marginTop: 2 },
  benefitText: { fontSize: 15, color: colors.textSecondary, flex: 1, lineHeight: 22 },

  subscribeButton: {
    backgroundColor: colors.primaryDark,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  recommendedButton: { backgroundColor: colors.success },
  loadingButton: { opacity: 0.7 },
  subscribeButtonText: { color: colors.card, fontSize: 16, fontWeight: "700" },

  footerInfo: { gap: 8 },
  footerText: { fontSize: 13, color: colors.textTertiary, lineHeight: 20 },
});
