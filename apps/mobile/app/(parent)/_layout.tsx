import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { ColorValue, StyleSheet, Text, View } from 'react-native';
import { Bell, Calendar, LucideIcon, MapPin } from 'lucide-react-native';
import { colors, glass, portalAccents } from '@/design/tokens';

function TabIcon({
  icon: Icon,
  symbol,
  focused,
  color,
}: {
  icon?: LucideIcon;
  symbol?: string;
  focused: boolean;
  color: ColorValue;
}) {
  const resolvedColor = typeof color === 'string' ? color : portalAccents.parent.from;

  return (
    <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
      {Icon ? (
        <Icon size={22} color={resolvedColor} strokeWidth={focused ? 2.4 : 1.8} />
      ) : (
        <Text style={[styles.tabIconText, { color: resolvedColor, opacity: focused ? 1 : 0.6 }]}>
          {symbol}
        </Text>
      )}
    </View>
  );
}

export default function ParentLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: portalAccents.parent.from,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarBackground: () => (
          <BlurView intensity={55} tint="light" style={StyleSheet.absoluteFill} />
        ),
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopColor: glass.border,
          borderTopWidth: 1,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Live Tracking',
          tabBarLabel: 'Track',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={MapPin} symbol="⌖" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Attendance',
          tabBarLabel: 'Attendance',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={Calendar} symbol="🗓" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={Bell} symbol="🔔" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
  },
  tabIconWrapActive: {
    transform: [{ scale: 1.05 }],
  },
  tabIconText: {
    fontSize: 20,
    textAlign: 'center',
  },
});
