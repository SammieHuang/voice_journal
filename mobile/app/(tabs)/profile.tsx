/** @format */

import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";

import { supabase } from "@/services/supabase";

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
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert("Log Out Failed", error.message);
      return;
    }

    setEmail(null);
  };

  const isLoggedIn = Boolean(email);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.card}>
        {isLoggedIn ? (
          <>
            <Text style={styles.cardTitle}>Account</Text>
            <Text style={styles.subtitle}>Signed in as</Text>
            <Text style={styles.email}>{email}</Text>

            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.cardTitle}>You’re not logged in</Text>
            <Text style={styles.subtitle}>
              Log in or create an account to sync your voice journals.
            </Text>

            <Pressable
              style={styles.primaryButton}
              onPress={() => router.push("/auth/login")}
            >
              <Text style={styles.primaryButtonText}>Log In</Text>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={() => router.push("/auth/signup")}
            >
              <Text style={styles.secondaryButtonText}>Create Account</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F1EB",
    paddingHorizontal: 24,
    paddingTop: 72,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#3A2F27",
    marginBottom: 24,
  },

  card: {
    backgroundColor: "#FFFDF8",
    borderRadius: 28,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  cardTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3A2F27",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: "#7A6A5D",
    lineHeight: 22,
    marginBottom: 8,
  },

  email: {
    fontSize: 16,
    color: "#3A2F27",
    fontWeight: "600",
    marginBottom: 24,
  },

  primaryButton: {
    backgroundColor: "#A66A43",
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
  },

  primaryButtonText: {
    color: "#FFFDF8",
    fontSize: 16,
    fontWeight: "700",
  },

  secondaryButton: {
    backgroundColor: "#F3E8DA",
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#A66A43",
    fontSize: 16,
    fontWeight: "700",
  },

  logoutButton: {
    backgroundColor: "#B75C4A",
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
  },

  logoutButtonText: {
    color: "#FFFDF8",
    fontSize: 16,
    fontWeight: "700",
  },
});
