import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
  danger: "#B54B4B",
};

export default function AuthScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailOk = useMemo(() => email.trim().includes("@"), [email]);
  const passOk = useMemo(() => password.trim().length >= 4, [password]);
  const canSubmit = emailOk && passOk && !loading;

  const login = async () => {
    if (!emailOk || !passOk) {
      Alert.alert("Error", "Revisa tu correo y contraseña.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    // ✅ NUEVO: manda a Home al instante (sin actualizar)
    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }],
    });
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>Bienvenido</Text>
            <Text style={styles.title}>Pilates MVP</Text>
            <Text style={styles.subtitle}>
              Inicia sesión para reservar tus sesiones y gestionar tu suscripción.
            </Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Acceso</Text>
            <Text style={styles.cardHint}>
              Ingresa con tu cuenta para continuar.
            </Text>

            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.label}>Correo</Text>
              <View
                style={[
                  styles.inputWrapper,
                  !emailOk && email.length > 0 ? styles.inputError : null,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={colors.textTertiary}
                  style={styles.leftIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="tu@correo.com"
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
              {!emailOk && email.length > 0 ? (
                <Text style={styles.helperError}>Escribe un correo válido.</Text>
              ) : (
                <Text style={styles.helper}>Ej: nombre@dominio.com</Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.field}>
              <Text style={styles.label}>Contraseña</Text>
              <View
                style={[
                  styles.inputWrapper,
                  !passOk && password.length > 0 ? styles.inputError : null,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={colors.textTertiary}
                  style={styles.leftIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="••••"
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry={!showPass}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPass((v) => !v)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPass ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {!passOk && password.length > 0 ? (
                <Text style={styles.helperError}>
                  La contraseña debe tener mínimo 4 caracteres.
                </Text>
              ) : (
                <Text style={styles.helper}>Tu contraseña de acceso.</Text>
              )}
            </View>

            {/* Primary Button */}
            <TouchableOpacity
              style={[styles.btnPrimary, !canSubmit ? styles.btnDisabled : null]}
              onPress={login}
              activeOpacity={0.85}
              disabled={!canSubmit}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color={colors.card} />
                  <Text style={styles.btnPrimaryText}>Ingresando...</Text>
                </View>
              ) : (
                <Text style={styles.btnPrimaryText}>Iniciar sesión</Text>
              )}
            </TouchableOpacity>

            {/* Secondary / Link */}
            <TouchableOpacity
              style={styles.btnOutline}
              onPress={() => navigation.navigate("Register")}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={styles.btnOutlineText}>Crear cuenta</Text>
            </TouchableOpacity>

            {/* Small helper */}
            <Text style={styles.footerMini}>
              ¿Problemas para entrar? Verifica tu correo y contraseña.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    padding: 20,
    paddingTop: 28,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: "center",
  },

  header: { marginBottom: 18 },
  greeting: { fontSize: 16, color: colors.textSecondary, marginBottom: 4 },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  subtitle: { fontSize: 15, color: colors.textSecondary, lineHeight: 22 },

  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  cardHint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 14,
    lineHeight: 18,
  },

  field: { marginBottom: 12 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputError: { borderColor: colors.danger },

  leftIcon: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: 2,
  },

  eyeBtn: { paddingLeft: 10, paddingVertical: 4 },

  helper: { fontSize: 12, color: colors.textTertiary, marginTop: 6 },
  helperError: { fontSize: 12, color: colors.danger, marginTop: 6 },

  btnPrimary: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
  },
  btnDisabled: { opacity: 0.55 },
  btnPrimaryText: {
    color: colors.card,
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.2,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  btnOutline: {
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  btnOutlineText: {
    color: colors.textSecondary,
    fontWeight: "800",
    fontSize: 16,
  },

  footerMini: {
    marginTop: 12,
    textAlign: "center",
    color: colors.textTertiary,
    fontSize: 12,
    lineHeight: 18,
  },
});
