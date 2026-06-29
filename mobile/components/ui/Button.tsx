/** @format */

import { ReactNode } from "react";
import { Pressable, StyleProp, ViewStyle, StyleSheet } from "react-native";
import { theme } from "@/design-system";
import { Typography } from "./Typography";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = Omit<React.ComponentProps<typeof Pressable>, "style"> & {
  children: ReactNode;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  children,
  variant = "primary",
  disabled,
  style,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <Typography variant="button" style={textStyleByVariant[variant]}>
        {children}
      </Typography>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },

  primary: {
    backgroundColor: theme.colors.brand,
  },

  secondary: {
    backgroundColor: theme.colors.secondary,
  },

  secondaryText: {
    color: theme.colors.white,
  },

  danger: {
    backgroundColor: theme.colors.danger,
  },

  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: theme.colors.textMuted,
  },

  primaryText: {
    color: theme.colors.white,
  },

  dangerText: {
    color: theme.colors.white,
  },

  ghostText: {
    color: theme.colors.textMuted,
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

  disabled: {
    opacity: 0.6,
  },
});

const textStyleByVariant = {
  primary: styles.primaryText,
  secondary: styles.secondaryText,
  danger: styles.dangerText,
  ghost: styles.ghostText,
};
