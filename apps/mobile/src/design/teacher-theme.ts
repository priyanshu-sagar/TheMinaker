// Re-export from unified token system for backwards compatibility
import { colors, palette } from './tokens';

export { colors, spacing, radius, shadows, glass, typography, portalAccents } from './tokens';

// Keep statusColors as a semantic alias for teacher portal
export const statusColors = {
  ...colors,
  present: colors.success,
  presentBg: colors.successBg,
  absent: colors.error,
  absentBg: colors.errorBg,
  late: colors.warning,
  lateBg: colors.warningBg,
  info: colors.info,
  infoBg: colors.infoBg,
  academics: palette.violet,
  academicsBg: colors.checkedOutBg,
  neutral: colors.textMuted,
  neutralBg: colors.primarySurface,
} as const;
