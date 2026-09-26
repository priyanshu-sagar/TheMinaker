import { Text } from 'react-native';

export function TabBarIcon({ glyph, focused }: { glyph: string; focused: boolean }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>{glyph}</Text>;
}
