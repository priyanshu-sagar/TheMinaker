import { Tabs } from 'expo-router';
import { BookOpen, LayoutDashboard, MessageSquare, Settings, Users } from 'lucide-react-native';
import { colors } from '@/design/teacher-theme';
import { TabBarIcon } from '@/components/shared/TabBarIcon';
import { useSelectedClass } from '@/store/teacher.store';

export default function TeacherLayout() {
  const selected = useSelectedClass();
  const isHomeroom = selected?.isClassTeacher ?? false;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={LayoutDashboard} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="roster"
        options={{
          title: 'Roster',
          href: isHomeroom ? undefined : null,
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={Users} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="academics"
        options={{
          title: 'Academics',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={BookOpen} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="comms"
        options={{
          title: 'Comms',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={MessageSquare} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={Settings} color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
