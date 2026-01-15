import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { supabase } from "../services/supabase";

type SessionRow = {
  id: string;
  title: string;
  date: string;
  time: string;
  spots: number;
};

type ReservationRow = {
  id: string;
  session_id: string;
};

const colors = {
  primary: '#8B9D83',
  primaryDark: '#6B7D63',
  background: '#F5F1E8',
  card: '#FFFFFF',
  textPrimary: '#2C3E2E',
  textSecondary: '#6B7D63',
  textTertiary: '#9AA99E',
  border: '#E0DDD6',
  success: '#7FA570',
  warning: '#D4A574',
  error: '#C17A6F',
};

export default function AgendaScreen({ navigation }: any) {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [reservedIds, setReservedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!userData.user) throw new Error("No hay sesión de usuario.");

      const s = await supabase
        .from("sessions")
        .select("id,title,date,time,spots")
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      if (s.error) throw s.error;
      setSessions((s.data as SessionRow[]) ?? []);

      const r = await supabase
        .from("reservations")
        .select("id, session_id")
        .eq("user_id", userData.user.id);

      if (r.error) throw r.error;

      const ids = ((r.data as ReservationRow[]) ?? []).map((x) => x.session_id);
      setReservedIds(ids);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo cargar la agenda.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const hasActiveSubscription = async (userId: string) => {
    const sub = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (sub.error) throw sub.error;
    return !!sub.data;
  };

  const reserve = async (sessionId: string) => {
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userData.user;
      if (!user) throw new Error("No hay usuario.");

      if (reservedIds.includes(sessionId)) {
        Alert.alert("Info", "Ya reservaste esta sesión.");
        return;
      }

      const ok = await hasActiveSubscription(user.id);
      if (!ok) {
        Alert.alert(
          "Necesitas suscripción",
          "Para reservar una sesión debes tener una suscripción activa.",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Ir a Suscripción",
              onPress: () => navigation.navigate("Subscription"),
            },
          ]
        );
        return;
      }

      const ins = await supabase.from("reservations").insert({
        user_id: user.id,
        session_id: sessionId,
      });

      if (ins.error) throw ins.error;

      setReservedIds((prev) => [...prev, sessionId]);
      Alert.alert("Listo", "Reserva confirmada.");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo reservar.");
    }
  };

  const cancelReservation = async (sessionId: string) => {
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userData.user;
      if (!user) throw new Error("No hay usuario.");

      const del = await supabase
        .from("reservations")
        .delete()
        .eq("user_id", user.id)
        .eq("session_id", sessionId);

      if (del.error) throw del.error;

      setReservedIds((prev) => prev.filter((id) => id !== sessionId));
      Alert.alert("Ok", "Reserva cancelada.");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo cancelar.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Agenda de Sesiones</Text>
        <Text style={styles.subtitle}>Reserva tu próxima clase de Pilates</Text>
      </View>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={loadAll}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const isReserved = reservedIds.includes(item.id);

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {isReserved && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Reservada</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Fecha</Text>
                  <Text style={styles.infoValue}>{item.date}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Hora</Text>
                  <Text style={styles.infoValue}>{item.time}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Cupos</Text>
                  <Text style={styles.infoValue}>{item.spots}</Text>
                </View>
              </View>

              {!isReserved ? (
                <TouchableOpacity 
                  style={styles.btnPrimary} 
                  onPress={() => reserve(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnPrimaryText}>Reservar sesión</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.btnSecondary}
                  onPress={() => cancelReservation(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnSecondaryText}>Cancelar reserva</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay sesiones disponibles</Text>
            <Text style={styles.emptySubtext}>
              Las nuevas sesiones aparecerán aquí
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: { 
    fontSize: 28, 
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16,
  },
  card: { 
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  badge: {
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  btnPrimary: { 
    backgroundColor: colors.primaryDark,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnPrimaryText: { 
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  btnSecondary: { 
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.primaryDark,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnSecondaryText: { 
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: { 
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textTertiary,
  },
});