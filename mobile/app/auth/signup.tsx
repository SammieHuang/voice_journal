/** @format */

import { Alert } from "react-native";
import { router } from "expo-router";
import { AuthScreen } from "@/components/Auth/AuthScreen";
import { signUp } from "@/services/auth-service";

export default function SignUpScreen() {
  const handleSignUp = async (email: string, password: string) => {
    try {
      const res = await signUp({ email, password });

      console.log(JSON.stringify(res, null, 2));

      Alert.alert("Success", "Account created successfully.");

      router.replace("/(tabs)");
    } catch (err) {
      console.error(err);

      Alert.alert(
        "Sign Up Failed",
        err instanceof Error ? err.message : "Unknown error",
      );

      throw err;
    }
  };

  return (
    <AuthScreen
      title="Create Account"
      subtitle="Start saving your thoughts in one quiet place."
      buttonText="Sign Up"
      submittingText="Creating..."
      footerText="Already have an account?"
      footerLinkText="Log In"
      onFooterPress={() => router.push("/auth/login")}
      onSubmit={handleSignUp}
    />
  );
}
