import { colors as baseColors, radius, spacing } from '@/design/theme';
import { actionColors } from '@/design/glass-theme';

/** Teacher portal action palette — same hex values as the shared V2 palette, renamed to their teacher-facing meaning. */
export const statusColors = {
  present: actionColors.success,
  presentBg: actionColors.successBg,
  absent: actionColors.error,
  absentBg: actionColors.errorBg,
  late: actionColors.warning,
  lateBg: actionColors.warningBg,
  info: actionColors.boarded,
  infoBg: actionColors.boardedBg,
  academics: actionColors.checkedOut,
  academicsBg: actionColors.checkedOutBg,
  neutral: baseColors.textMuted,
  neutralBg: actionColors.neutralBg,
} as const;

export { baseColors as colors, radius, spacing };
