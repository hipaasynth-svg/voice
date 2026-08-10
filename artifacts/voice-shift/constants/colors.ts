/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const palette = {
  text: '#edf5ff',
  tint: '#64e5ff',
  background: '#09101f',
  foreground: '#edf5ff',
  card: '#111d31',
  cardForeground: '#edf5ff',
  primary: '#64e5ff',
  primaryForeground: '#07111e',
  secondary: '#17263d',
  secondaryForeground: '#d8e7f5',
  muted: '#142238',
  mutedForeground: '#8fa6bc',
  accent: '#253453',
  accentForeground: '#f3f8ff',
  destructive: '#ff6f7e',
  destructiveForeground: '#220c16',
  border: '#263b56',
  input: '#1d3048',
  surface: '#0d1729',
  surfaceElevated: '#14233a',
  cyan: '#64e5ff',
  coral: '#ff897a',
  lilac: '#a4a5ff',
  success: '#78e3b0',
  warning: '#ffd18a',
  waveform: '#69d9f7',
};

const colors = {
  light: palette,
  dark: {
    ...palette,
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 18,
};

export default colors;
