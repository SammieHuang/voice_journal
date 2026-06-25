import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useState, useEffect } from 'react'
import { router } from 'expo-router';
import type { User } from "@supabase/supabase-js";
import {logOut, getCurrentUser } from '@/services/auth-service'

export default function ProfileScreen() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogOut = async () => {
    try {
      await logOut()
      setCurrentUser(null)
    } catch (err) {
      console.log('Failed to log out', err)
      throw err
    }
  }

  useEffect(() => {
    async function loadUsers() {
      try {
          const user = await getCurrentUser();
        
        setCurrentUser(user);

        console.log(user);
      } catch (err) {
        throw err;
      }
    }

    loadUsers();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      {currentUser ? (
        <View>
          <Text>Logged in as:</Text>
          <Text>{currentUser.email}</Text>
          <Pressable onPress={handleLogOut}>
            <Text >Log Out</Text>
          </Pressable>
        </View>
      ) : (
        <View>
          <Text>You are not logged in.</Text>

          <Pressable onPress={() => router.push("/auth/login")}>
            <Text>Log In</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/auth/signup")}>
            <Text>Sign Up</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
  },
});