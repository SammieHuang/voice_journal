/** @format */

import { ReactNode } from "react";
import { Text, TextProps, StyleSheet } from "react-native";
import { theme } from "@/design-system";

type TypographyVariant =
  | "screenTitle"
  | "cardTitle"
  | "body"
  | "subtitle"
  | "caption"
  | "journal"
  | "button";

type TypographyProps = TextProps & {
  variant?: TypographyVariant;
  children: ReactNode;
};

export function Typography({
  variant = "body",
  style,
  children,
  ...props
}: TypographyProps) {
  return (
    <Text style={[styles.base, styles[variant], style]} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: theme.colors.text,
  },

  screenTitle: {
    ...theme.typography.screenTitle,
    color: theme.colors.textWarm,
  },

  cardTitle: {
    ...theme.typography.cardTitle,
    color: theme.colors.text,
  },

  body: {
    ...theme.typography.body,
    color: theme.colors.text,
  },

  subtitle: {
    ...theme.typography.subtitle,
    color: theme.colors.textSecondary,
  },

  caption: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },

  journal: {
    ...theme.typography.journal,
    color: theme.colors.textWarm,
  },

  button: {
    ...theme.typography.button,
  },
});
