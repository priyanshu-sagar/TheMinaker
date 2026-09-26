import { LucideIcon } from 'lucide-react-native';
import { ColorValue, Text, View } from 'react-native';

/**
 * V3 tab bar icon — accepts a lucide SVG icon (preferred) or a legacy
 * emoji `glyph` for tabs that have not yet migrated. Focused tabs render
 * at full opacity with a slightly thicker stroke.
 */
export function TabBarIcon({
    icon: Icon,
    glyph,
    color,
    focused,
    size = 22,
}: {
    icon?: LucideIcon;
    glyph?: string;
    color?: ColorValue;
    focused: boolean;
    size?: number;
}) {
    if (Icon) {
        return (
            <View style={{ opacity: focused ? 1 : 0.7 }}>
                <Icon color={typeof color === 'string' ? color : '#111827'} size={size} strokeWidth={focused ? 2.4 : 2} />
            </View>
        );
    }
    return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>{glyph ?? ''}</Text>;
}
