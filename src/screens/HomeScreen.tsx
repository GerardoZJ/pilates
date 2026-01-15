import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { supabase } from "../services/supabase";

const colors = {
  primary: "#8B9D83",
  primaryDark: "#6B7D63",
  primaryLight: "#A8B9A0",
  background: "#F5F1E8",
  card: "#FFFFFF",
  textPrimary: "#2C3E2E",
  textSecondary: "#6B7D63",
  textTertiary: "#9AA99E",
  border: "#E0DDD6",
};

const { width } = Dimensions.get("window");
const H_PADDING = 20;
const CARD_WIDTH = width - H_PADDING * 2; // ocupa casi toda la pantalla
const CARD_SPACING = 12;

export default function HomeScreen({ navigation }: any) {
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const menuItems = useMemo(
    () => [
      {
        title: "Agenda de Sesiones",
        subtitle: "Reserva tu próxima clase",
        icon: "📅",
        route: "Agenda",
        color: colors.primary,
      },
      {
        title: "Mi Suscripción",
        subtitle: "Gestiona tu plan mensual",
        icon: "💳",
        route: "Subscription",
        color: colors.primaryDark,
      },
      {
        title: "Historial",
        subtitle: "Revisa tus actividades",
        icon: "📋",
        route: "History",
        color: colors.primaryLight,
      },
    ],
    []
  );

  const onLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    const { error } = await supabase.auth.signOut();
    setLoggingOut(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    navigation.reset({
      index: 0,
      routes: [{ name: "Auth" }],
    });
  };

  const onCarouselEnd = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / (CARD_WIDTH + CARD_SPACING));
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>Pilates</Text>
            </View>
            <View style={styles.heroMiniPill}>
              <Text style={styles.heroMiniPillText}>Hoy</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>Tu Espacio Pilates</Text>
          <Text style={styles.heroSubtitle}>
            Encuentra equilibrio y bienestar en cada sesión
          </Text>
        </View>

        {/* Section title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Acciones rápidas</Text>
          <Text style={styles.sectionHint}>Desliza para ver más</Text>
        </View>

        {/* Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
          snapToInterval={CARD_WIDTH + CARD_SPACING}
          decelerationRate="fast"
          onMomentumScrollEnd={onCarouselEnd}
        >
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.9}
              onPress={() => navigation.navigate(item.route)}
              style={[
                styles.carouselCard,
                { width: CARD_WIDTH, marginRight: index === menuItems.length - 1 ? 0 : CARD_SPACING },
              ]}
            >
              <View style={styles.carouselCardInner}>
                <View style={[styles.bigIconCircle, { backgroundColor: item.color }]}>
                  <Text style={styles.bigIcon}>{item.icon}</Text>
                </View>

                <View style={styles.carouselTextBlock}>
                  <Text style={styles.carouselTitle}>{item.title}</Text>
                  <Text style={styles.carouselSubtitle}>{item.subtitle}</Text>

                  <View style={styles.ctaRow}>
                    <View style={[styles.ctaPill, { backgroundColor: item.color }]}>
                      <Text style={styles.ctaText}>Abrir</Text>
                    </View>
                    <Text style={styles.ctaArrow}>›</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Dots */}
        <View style={styles.dotsRow}>
          {menuItems.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Info Section (misma idea, diferente look) */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoTitle}>Consejo del día</Text>
            <View style={styles.infoChip}>
              <Text style={styles.infoChipText}>💡</Text>
            </View>
          </View>
          <Text style={styles.infoText}>
            La respiración consciente es fundamental en Pilates. Recuerda inhalar
            por la nariz y exhalar por la boca durante cada ejercicio.
          </Text>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutButton, loggingOut ? styles.logoutDisabled : null]}
          onPress={onLogout}
          activeOpacity={0.8}
          disabled={loggingOut}
        >
          <Text style={styles.logoutText}>
            {loggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    paddingHorizontal: H_PADDING,
    paddingTop: 18,
    paddingBottom: 44,
  },

  // Hero
  hero: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
    marginBottom: 18,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  heroBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  heroBadgeText: {
    color: colors.card,
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.4,
  },
  heroMiniPill: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  heroMiniPillText: {
    color: colors.textSecondary,
    fontWeight: "800",
    fontSize: 12,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  sectionHint: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: "700",
  },

  // Carousel
  carouselContent: {
    paddingRight: H_PADDING, // para que el último no quede pegado
  },
  carouselCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 4,
  },
  carouselCardInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  bigIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  bigIcon: { fontSize: 28 },

  carouselTextBlock: { flex: 1 },
  carouselTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  carouselSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ctaPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  ctaText: {
    color: colors.card,
    fontWeight: "900",
    fontSize: 13,
  },
  ctaArrow: {
    fontSize: 30,
    color: colors.textTertiary,
    marginTop: -2,
  },

  // Dots
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 18,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 999,
  },
  dotActive: {
    width: 22,
    backgroundColor: colors.primaryDark,
  },
  dotInactive: {
    width: 8,
    backgroundColor: colors.border,
  },

  // Info
  infoCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 22,
    padding: 16,
    marginBottom: 18,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.card,
  },
  infoChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoChipText: { fontSize: 16 },
  infoText: {
    fontSize: 14,
    color: colors.card,
    lineHeight: 20,
  },

  // Logout
  logoutButton: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  logoutDisabled: { opacity: 0.7 },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textSecondary,
  },
});
