import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '@/design/tokens';

export type PillVariant =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'neutral'
  | 'boarded'
  | 'dropped'
  | 'checkedOut'
  | 'absent'
  | 'online'
  | 'offline'
  | 'primary';

export type StatusVariant = PillVariant;

export interface StatusPillProps {
  variant?: PillVariant;
  label?: string;
  showDot?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  size?: 'sm' | 'md';
}

const VARIANT_MAP: Record<PillVariant, { bg: string; text: string; label: string }> = {
  success:    { bg: colors.successBg,    text: colors.success,    label: 'Present' },
  error:      { bg: colors.errorBg,      text: colors.error,      label: 'Error' },
  warning:    { bg: colors.warningBg,    text: colors.warning,    label: 'Warning' },
  info:       { bg: colors.infoBg,       text: colors.info,       label: 'Info' },
  neutral:    { bg: 'rgba(148,163,184,0.15)', text: colors.textMuted, label: 'Neutral' },
  boarded:    { bg: colors.boardedBg,    text: colors.boarded,    label: 'Boarded' },
  dropped:    { bg: colors.droppedBg,    text: colors.dropped,    label: 'Dropped' },
  checkedOut: { bg: colors.checkedOutBg, text: colors.checkedOut, label: 'Checked Out' },
  absent:     { bg: colors.absentBg,     text: colors.absent,     label: 'Absent' },
  online:     { bg: colors.onlineBg,     text: colors.online,     label: 'Online' },
  offline:    { bg: colors.offlineBg,    text: colors.offline,    label: 'Offline' },
  primary:    { bg: colors.primarySurface, text: colors.primary,  label: 'Active' },
};

export function StatusPill({
  variant = 'info',
  label,
  showDot = false,
  icon,
  style,
  textStyle,
  size = 'sm',
}: StatusPillProps) {
  const config = VARIANT_MAP[variant] ?? VARIANT_MAP.info;
  const displayLabel = label ?? config.label;

  return (
    <View
      style={[
        styles.pill,
        size === 'md' ? styles.pillMd : styles.pillSm,
        { backgroundColor: config.bg },
        style,
      ]}
    >
      {icon ? (
        icon
      ) : showDot ? (
        <View style={[styles.dot, { backgroundColor: config.text }]} />
      ) : null}
      <Text
        style={[
          styles.text,
          size === 'md' ? styles.textMd : styles.textSm,
          { color: config.text },
          textStyle,
        ]}
      >
        {displayLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.full,
  },
  pillSm: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    gap: spacing.xs,
  },
  pillMd: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
  },
  textSm: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
  textMd: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
});
