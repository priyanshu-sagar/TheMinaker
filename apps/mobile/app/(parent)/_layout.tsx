import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';
import { Bus, CalendarDays, Phone, UserRound } from 'lucide-react-native';
import { colors, glass, portalAccents } from '@/design/tokens';
import { TabBarIcon } from '@/components/shared/TabBarIcon';

export default function ParentLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: portalAccents.parent.from,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarBackground: () => <BlurView intensity={80} tint="light" style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(248,250,252,0.94)' }]} />,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopColor: glass.border,
          borderTopWidth: 1,
          elevation: 0,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Live',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={Bus} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={CalendarDays} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: 'Actions',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={Phone} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={UserRound} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}
