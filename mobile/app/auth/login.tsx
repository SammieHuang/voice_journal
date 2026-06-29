/** @format */

import { Alert } from "react-native";
import { router } from "expo-router";
import { AuthScreen } from "@/components/Auth/AuthScreen";
import { logIn } from "@/services/auth-service";

export default function LogInScreen() {
  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await logIn({ email, password });

      console.log("Login Res: ", res);

      Alert.alert("Success", "Account logged in successfully.");

      router.replace("/(tabs)/profile");
    } catch (err) {
      Alert.alert(
        "Login Failed",
        err instanceof Error ? err.message : "Unknown error",
      );

      throw err;
    }
  };

  return (
    <AuthScreen
      title="Welcome Back"
      subtitle="Continue your voice journal journey."
      buttonText="Log In"
      submittingText="Logging in..."
      footerText="Don't have an account?"
      footerLinkText="Sign Up"
      onFooterPress={() => router.push("/auth/signup")}
      onSubmit={handleLogin}
    />
  );
}
