import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
} from "react-native";
import { supabase } from "../services/supabase";

type SubscriptionRow = {
  id: string;
  plan: string;
  status: string;
  created_at: string;
};

type ReservationJoinRow = {
  id: string;
  created_at: string;
  sessions: {
    title: string;
    date: string;
    time: string;
  } | null;
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
  active: '#7FA570',
  inactive: '#9AA99E',
};

export default function HistoryScreen() {
  const [subs, setSubs] = useState<SubscriptionRow[]>([]);
  const [reservations, setReservations] = useState<ReservationJoinRow[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!userData.user) throw new Error("No hay usuario.");

      const s = await supabase
        .from("subscriptions")
        .select("id, plan, status, created_at")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (s.error) throw s.error;
      setSubs((s.data as SubscriptionRow[]) ?? []);

      const r = await supabase
        .from("reservations")
        .select("id, created_at, sessions(title, date, time)")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (r.error) throw r.error;
      setReservations((r.data as ReservationJoinRow[]) ?? []);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo cargar el historial.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return colors.active;
      case 'inactive':
      case 'cancelled':
        return colors.inactive;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Activa';
      case 'inactive':
        return 'Inactiva';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Historial</Text>
        <Text style={styles.subtitle}>Suscripciones y reservas anteriores</Text>
      </View>

      <FlatList
        data={[{ key: "subs" }, { key: "res" }]}
        keyExtractor={(i) => i.key}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={loadHistory}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          if (item.key === "subs") {
            return (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Suscripciones</Text>

                {subs.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>Sin suscripciones aún</Text>
                    <Text style={styles.emptySubtext}>
                      Tus suscripciones aparecerán aquí
                    </Text>
                  </View>
                ) : (
                  subs.map((x) => (
                    <View key={x.id} style={styles.card}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{x.plan}</Text>
                        <View 
                          style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(x.status) }
                          ]}
                        >
                          <Text style={styles.statusText}>
                            {getStatusText(x.status)}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Fecha de compra</Text>
                        <Text style={styles.infoValue}>
                          {formatDateTime(x.created_at)}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            );
          }

          return (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mis Reservas</Text>

              {reservations.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>Sin reservas aún</Text>
                  <Text style={styles.emptySubtext}>
                    Tus reservas aparecerán aquí
                  </Text>
                </View>
              ) : (
                reservations.map((x) => (
                  <View key={x.id} style={styles.card}>
                    <Text style={styles.cardTitle}>
                      {x.sessions?.title ?? "Sesión"}
                    </Text>
                    
                    <View style={styles.sessionInfo}>
                      <View style={styles.sessionDetail}>
                        <Text style={styles.infoLabel}>Fecha</Text>
                        <Text style={styles.infoValue}>
                          {x.sessions?.date ? formatDate(x.sessions.date) : "-"}
                        </Text>
                      </View>
                      
                      <View style={styles.sessionDetail}>
                        <Text style={styles.infoLabel}>Hora</Text>
                        <Text style={styles.infoValue}>
                          {x.sessions?.time ?? "-"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.divider} />
                    
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Reservada el</Text>
                      <Text style={[styles.infoValue, { fontSize: 13 }]}>
                        {formatDateTime(x.created_at)}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          );
        }}
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
  },
  section: { 
    marginBottom: 32,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  card: { 
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
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
    fontSize: 17, 
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  sessionInfo: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  sessionDetail: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
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
    textAlign: 'center',
  },
});