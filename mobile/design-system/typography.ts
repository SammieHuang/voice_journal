/** @format */

import { fonts } from "./fonts";

export const typography = {
  screenTitle: {
    fontFamily: fonts.heading,
    fontSize: 32,
    lineHeight: 38,
  },

  cardTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700" as const,
  },

  body: {
    fontSize: 16,
    lineHeight: 22,
  },

  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },

  caption: {
    fontSize: 14,
    lineHeight: 20,
  },

  journal: {
    fontFamily: fonts.journal,
    fontSize: 22,
    lineHeight: 32,
  },

  button: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700" as const,
  },
};
