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

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailOk = useMemo(() => email.trim().includes("@"), [email]);
  const passOk = useMemo(() => password.trim().length >= 6, [password]);
  const canSubmit = emailOk && passOk && !loading;

  const goToAuth = () => {
    // Si hay historial, vuelve; si no, navega al Auth (Login)
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate("Auth");
  };

  const register = async () => {
    if (!emailOk) {
      Alert.alert("Error", "Escribe un correo válido.");
      return;
    }
    if (!passOk) {
      Alert.alert("Error", "Contraseña mínima 6 caracteres.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Listo", "Cuenta creada, inicia sesión", [
      { text: "OK", onPress: goToAuth },
    ]);
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
            <Text style={styles.greeting}>Crear cuenta</Text>
            <Text style={styles.title}>Registro</Text>
            <Text style={styles.subtitle}>
              Completa tus datos para empezar con Pilates.
            </Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tus datos</Text>
            <Text style={styles.cardHint}>
              Usa un correo real para confirmar y recuperar acceso.
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
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry={!showPass}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPass((v) => !v)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
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
                  Debe tener mínimo 6 caracteres.
                </Text>
              ) : (
                <Text style={styles.helper}>
                  Usa algo seguro (mínimo 6 caracteres).
                </Text>
              )}
            </View>

            {/* Primary Button */}
            <TouchableOpacity
              style={[styles.btnPrimary, !canSubmit ? styles.btnDisabled : null]}
              onPress={register}
              activeOpacity={0.85}
              disabled={!canSubmit}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator />
                  <Text style={styles.btnPrimaryText}>Creando...</Text>
                </View>
              ) : (
                <Text style={styles.btnPrimaryText}>Crear cuenta</Text>
              )}
            </TouchableOpacity>

            {/* Link back to Auth */}
            <TouchableOpacity
              style={styles.linkBtn}
              onPress={goToAuth}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={styles.linkText}>
                Ya tengo cuenta · Iniciar sesión
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerMini}>
            Al crear tu cuenta regresas al login (AuthScreen).
          </Text>
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
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 10 },

  linkBtn: { alignItems: "center", paddingVertical: 12 },
  linkText: {
    color: colors.primaryDark,
    fontWeight: "800",
    textDecorationLine: "underline",
  },

  footerMini: {
    marginTop: 14,
    textAlign: "center",
    color: colors.textTertiary,
    fontSize: 12,
    lineHeight: 18,
  },
});
