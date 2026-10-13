// Re-export from unified token system for backwards compatibility
import { colors, palette } from './tokens';

export { colors, spacing, radius, shadows, glass, typography, portalAccents } from './tokens';

// Keep statusColors as a semantic alias
export const statusColors = {
  ...colors,
  amber: colors.warning,
  amberBg: colors.warningBg,
  neutral: colors.textMuted,
  neutralBg: colors.primarySurface,
} as const;
