/** @format */

import { useEffect, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import Purchases from "react-native-purchases";
import RevenueCatUI, {PAYWALL_RESULT} from 'react-native-purchases-ui'
import { supabase } from "@/services/supabase";
import { Button, Typography, Surface } from "@/components/ui";
import { theme } from "@/design-system";
import { logOut } from "@/services/auth-service";
import { useProfileQuery } from "@/hooks/use-profile-query";

const ENTITLEMENT_ID = 'my_private_mind_pro'

export default function ProfileScreen() {
  const [email, setEmail] = useState<string | null>(null);
  const queryClient = useQueryClient()
  const {data : profile} = useProfileQuery()

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setEmail(user?.email ?? null);
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logOut()
    } catch (err) {
      Alert.alert("Log Out Failed", (err as Error).message)
    }
  };

  const handleUpgrade = async () => {
    const result = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: ENTITLEMENT_ID,
    })

    if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
      const customerInfo = await Purchases.getCustomerInfo()
      const isActive = !!customerInfo.entitlements.active[ENTITLEMENT_ID]

      if (isActive) {
        Alert.alert('Welcome to Pro!', 'Cloud transcription is now unlocked')
      }

      queryClient.invalidateQueries({queryKey: ['profile']})
    }
  }

  const handleRestore = async () => {
    try {
      const customerInfo = await Purchases.restorePurchases()
      const isActive = !!customerInfo.entitlements.active[ENTITLEMENT_ID]

      queryClient.invalidateQueries({ queryKey: ['profile'] })
      
      Alert.alert(
        isActive ? 'Restored' : 'Nothing to Restore', 
        isActive
          ? 'Your Pro subscription has been restored.'
          : 'No active subscription was found for this account',
      )
    } catch (err) {
      Alert.alert('Restore Failed', (err as Error).message)
    }
  }

  const isLoggedIn = Boolean(email);
  const isPremium = profile?.tier === 'premium'

  return (
    <View style={styles.container}>
      <Typography variant="screenTitle" style={styles.title}>
        Profile
      </Typography>

      <Surface style={styles.card}>
        {isLoggedIn ? (
          <>
            <Typography variant="cardTitle" style={styles.cardTitle}>
              Account
            </Typography>

            <Typography variant="subtitle" style={styles.subtitle}>
              Signed In as
            </Typography>

            <Typography variant="body" style={styles.email}>
              {email}
            </Typography>

            <Typography variant="subtitle" style={styles.subtitle}>
              Plan
            </Typography>

            <Typography variant="body" style={styles.email}>
              {isPremium ? 'Pro' : 'Free'}
            </Typography>

            <View style={styles.buttonGroup}>
              {!isPremium && (
                <Button onPress={handleUpgrade}>
                  Upgrade to Pro
                </Button>
              )}
              <Button variant='secondary' onPress={handleRestore}>
                Restore Purchases
              </Button>
              <Button variant='danger' onPress={handleLogout}>
                Log Out
              </Button>
            </View>
          </>
        ) : (
          <>
            <Typography variant="cardTitle" style={styles.cardTitle}>
              You are not logged in.
            </Typography>

            <Typography variant="subtitle" style={styles.subtitle}>
              Log in or create an account to sync your voice journals.
            </Typography>

            <View style={styles.buttonGroup}>
              <Button onPress={() => router.push("/auth/login")}>Log In</Button>
              <Button
                variant="secondary"
                onPress={() => router.push("/auth/signup")}
              >
                Create Account
              </Button>
            </View>
          </>
        )}
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.screenHorizontal,
    paddingTop: theme.spacing.screenTop,
  },

  title: {
    marginBottom: theme.spacing.xxl,
  },

  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xxl,
    padding: theme.spacing.xxl,
    ...theme.shadows.card,
  },

  cardTitle: {
    marginBottom: theme.spacing.sm,
  },

  subtitle: {
    marginBottom: theme.spacing.sm,
  },

  email: {
    fontWeight: "600",
    marginBottom: theme.spacing.xxl,
  },

  buttonGroup: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
});
