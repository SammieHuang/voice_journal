/** @format */

import { ReactNode } from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { theme } from "@/design-system";

type SurfaceProps = ViewProps & {
  children: ReactNode;
};

export function Surface({ children, style, ...props }: SurfaceProps) {
  return (
    <View style={[styles.base, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.colors.surfaceWarm,
    borderRadius: theme.radius.xl,
    paddingVertical: 18,
    paddingHorizontal: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
