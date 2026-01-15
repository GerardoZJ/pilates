import "react-native-url-polyfill/auto";
import React from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { StripeProvider } from "@stripe/stripe-react-native";

export default function App() {
  const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!;

  return (
    <StripeProvider
      publishableKey={publishableKey}
      merchantIdentifier="merchant.com.grtech.pilatessupabase"
      urlScheme="pilatessupabase"
    >
      <AppNavigator />
    </StripeProvider>
  );
}
