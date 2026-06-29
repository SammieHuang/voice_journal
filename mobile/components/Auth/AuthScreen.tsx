import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";

type AuthScreenProps = {
  title: string;
  subtitle?: string;
  buttonText: string;
  submittingText: string;
  footerText?: string;
  footerLinkText?: string;
  onFooterPress?: () => void;
  onSubmit: (email: string, password: string) => Promise<void>;
};

export function AuthScreen({
  title,
  subtitle,
  buttonText,
  submittingText,
  footerText,
  footerLinkText,
  onFooterPress,
  onSubmit,
}: AuthScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing Information", "Please enter email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(email.trim(), password);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>

        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        <TextInput
          placeholder="Email"
          placeholderTextColor="#9A8F85"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#9A8F85"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <Pressable
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? submittingText : buttonText}
          </Text>
        </Pressable>

        {footerText && footerLinkText && onFooterPress ? (
          <Pressable onPress={onFooterPress}>
            <Text style={styles.footer}>
              {footerText}{" "}
              <Text style={styles.footerLink}>{footerLinkText}</Text>
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F1EB",
    justifyContent: "center",
    padding: 24,
  },

  card: {
    backgroundColor: "#FFFDF8",
    borderRadius: 28,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#3A2F27",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: "#7A6A5D",
    marginBottom: 28,
    lineHeight: 22,
  },

  input: {
    backgroundColor: "#F3E8DA",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 14,
    color: "#3A2F27",
  },

  button: {
    backgroundColor: "#A66A43",
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonText: {
    color: "#FFFDF8",
    fontSize: 16,
    fontWeight: "700",
  },

  footer: {
    textAlign: "center",
    marginTop: 22,
    color: "#7A6A5D",
  },

  footerLink: {
    color: "#A66A43",
    fontWeight: "700",
  },
});
