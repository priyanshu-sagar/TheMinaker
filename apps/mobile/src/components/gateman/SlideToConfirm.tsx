import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { palette, spacing } from '@/design/tokens';

export interface SlideToConfirmProps {
  label: string;
  onConfirm: () => void;
  accentColor?: string; // default: palette.emerald
  disabled?: boolean;
  resetOnConfirm?: boolean; // default true
}

const DEFAULT_TRACK_W = Dimensions.get('window').width - spacing.xl * 2 - spacing.xl * 2;
const THUMB_SIZE = 48;
const DEFAULT_MAX_DRAG = Math.max(1, DEFAULT_TRACK_W - THUMB_SIZE - 8);

export function SlideToConfirm({
  label,
  onConfirm,
  accentColor = palette.emerald,
  disabled = false,
  resetOnConfirm = true,
}: SlideToConfirmProps) {
  const dragX = useRef(new Animated.Value(0)).current;
  const fillWidth = useRef(new Animated.Value(THUMB_SIZE + 8)).current;
  const confirmed = useRef(false);
  const trackWidthRef = useRef(DEFAULT_TRACK_W);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled && !confirmed.current,
      onPanResponderGrant: () => {
        if (disabled || confirmed.current) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      },
      onPanResponderMove: (_, gesture) => {
        if (disabled || confirmed.current) return;
        const maxDrag = Math.max(1, trackWidthRef.current - THUMB_SIZE - 8);
        const clamped = Math.max(0, Math.min(gesture.dx, maxDrag));
        dragX.setValue(clamped);
        fillWidth.setValue(THUMB_SIZE + 8 + clamped);
      },
      onPanResponderRelease: (_, gesture) => {
        if (disabled || confirmed.current) return;
        const maxDrag = Math.max(1, trackWidthRef.current - THUMB_SIZE - 8);
        if (gesture.dx >= maxDrag * 0.85) {
          // Confirmed!
          confirmed.current = true;
          setIsConfirmed(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

          Animated.timing(dragX, {
            toValue: maxDrag,
            duration: 100,
            useNativeDriver: false,
          }).start(() => {
            onConfirm();
            if (resetOnConfirm) {
              setTimeout(() => {
                Animated.spring(dragX, {
                  toValue: 0,
                  useNativeDriver: false,
                }).start();
                Animated.spring(fillWidth, {
                  toValue: THUMB_SIZE + 8,
                  useNativeDriver: false,
                }).start();
                confirmed.current = false;
                setIsConfirmed(false);
              }, 600);
            }
          });
        } else {
          // Snap back
          Animated.spring(dragX, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
          Animated.spring(fillWidth, {
            toValue: THUMB_SIZE + 8,
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  ).current;

  const labelOpacity = dragX.interpolate({
    inputRange: [0, DEFAULT_MAX_DRAG * 0.5],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[styles.track, { opacity: disabled ? 0.5 : 1 }]}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0) {
          trackWidthRef.current = w;
        }
      }}
    >
      {/* Fill */}
      <Animated.View style={[styles.fill, { width: fillWidth }]}>
        <LinearGradient
          colors={[accentColor, accentColor]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </Animated.View>

      {/* Centered Track Label */}
      <Animated.Text
        numberOfLines={1}
        style={[styles.label, { opacity: labelOpacity }]}
      >
        {label}
      </Animated.Text>

      {/* Thumb */}
      <Animated.View
        style={[styles.thumb, { transform: [{ translateX: dragX }] }]}
        {...panResponder.panHandlers}
      >
        {isConfirmed ? (
          <Svg width={22} height={22} viewBox="0 0 24 24">
            <Path
              d="M20 6L9 17L4 12"
              stroke={accentColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        ) : (
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path
              d="M5 12H19M19 12L12 5M19 12L12 19"
              stroke={accentColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
    justifyContent: 'center',
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 28,
    overflow: 'hidden',
  },
  label: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 15,
    color: '#334155',
    backgroundColor: 'transparent',
    paddingHorizontal: THUMB_SIZE + 12,
  },
  thumb: {
    position: 'absolute',
    left: 4,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#ffffff',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    alignItems: 'center',
    justifyContent: 'center',
  },
});
