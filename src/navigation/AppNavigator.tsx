import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { supabase } from "../services/supabase";

import AuthScreen from "../screens/AuthScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import AgendaScreen from "../screens/AgendaScreen";
import SubscriptionScreen from "../screens/SubscriptionScreen";
import HistoryScreen from "../screens/HistoryScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [session, setSession] = useState<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  if (!ready) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={session ? "Home" : "Auth"}>
        {/* Auth flow */}
        <Stack.Screen name="Auth" component={AuthScreen} options={{ title: "Login" }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Registro" }} />

        {/* App flow */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Agenda" component={AgendaScreen} />
        <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ title: "Suscripción" }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: "Historial" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
