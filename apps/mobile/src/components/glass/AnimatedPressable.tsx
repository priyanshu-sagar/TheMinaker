import { ReactNode } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
    createAnimatedComponent,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

/**
 * Shared V3 spring-press wrapper with light haptic feedback on tap-down.
 * Any interactive glass card, list row, or button in the mobile app uses
 * this to get the fluid, tactile feel required by the V3 UI polish.
 */
export function AnimatedPressable({
    children,
    onPress,
    style,
    haptic = 'light',
    disabled,
    hitSlop,
    ...rest
}: Omit<PressableProps, 'onPressIn' | 'onPressOut' | 'style' | 'children'> & {
    children: ReactNode;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    haptic?: 'light' | 'medium' | 'heavy' | 'selection' | 'none';
}) {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    function fireHaptic() {
        if (haptic === 'none' || disabled) return;
        if (haptic === 'selection') {
            Haptics.selectionAsync().catch(() => undefined);
            return;
        }
        const style = haptic === 'heavy'
            ? Haptics.ImpactFeedbackStyle.Heavy
            : haptic === 'medium'
            ? Haptics.ImpactFeedbackStyle.Medium
            : Haptics.ImpactFeedbackStyle.Light;
        Haptics.impactAsync(style).catch(() => undefined);
    }

    return (
        <AnimatedPressableBase
            {...rest}
            disabled={disabled}
            hitSlop={hitSlop}
            onPressIn={() => {
                scale.value = withSpring(0.97, { damping: 14, stiffness: 260, mass: 0.6 });
                fireHaptic();
            }}
            onPressOut={() => {
                scale.value = withSpring(1, { damping: 14, stiffness: 260, mass: 0.6 });
            }}
            onPress={onPress}
            style={[animatedStyle, style as ViewStyle]}
        >
            {children}
        </AnimatedPressableBase>
    );
}

const AnimatedPressableBase = createAnimatedComponent(Pressable);
