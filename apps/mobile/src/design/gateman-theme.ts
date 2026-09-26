import { colors as baseColors, radius, spacing } from '@/design/theme';
import { actionColors } from '@/design/glass-theme';

/**
 * Semantic status colors for the Gateman portal, per the V2 action palette:
 * emerald = online/approved, rose = offline/rejected, amber = geofence,
 * plus distinct blue/orange/purple for the boarded/dropped/checked-out
 * attendance stages.
 */
export const statusColors = {
  online: actionColors.success,
  onlineBg: actionColors.successBg,
  offline: actionColors.error,
  offlineBg: actionColors.errorBg,
  amber: actionColors.warning,
  amberBg: actionColors.warningBg,
  boarded: actionColors.boarded,
  boardedBg: actionColors.boardedBg,
  dropped: actionColors.dropped,
  droppedBg: actionColors.droppedBg,
  checkedOut: actionColors.checkedOut,
  checkedOutBg: actionColors.checkedOutBg,
  neutral: baseColors.textMuted,
  neutralBg: actionColors.neutralBg,
} as const;

export { baseColors as colors, radius, spacing };
