/** @format */

import { useEffect, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";

import { supabase } from "@/services/supabase";
import { Button, Typography, Surface } from "@/components/ui";
import { theme } from "@/design-system";
import { logOut } from "@/services/auth-service";

export default function ProfileScreen() {
  const [email, setEmail] = useState<string | null>(null);

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

  const isLoggedIn = Boolean(email);

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

            <Button variant="danger" onPress={handleLogout}>
              Log Out
            </Button>
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
