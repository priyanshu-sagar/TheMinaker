import { ReactNode } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

/**
 * Wraps a list row so it fades and slides in on mount, staggered by index.
 * Used by every V3 list (dashboard tiles, roster, academics, comms, etc.)
 * to hit the "staggered fade-in FlatList" polish requirement.
 */
export function FadeInRow({ index, children }: { index: number; children: ReactNode }) {
    const delay = Math.min(index, 8) * 45;
    return (
        <Animated.View entering={FadeInDown.delay(delay).duration(320).springify().damping(16)}>
            {children}
        </Animated.View>
    );
}
