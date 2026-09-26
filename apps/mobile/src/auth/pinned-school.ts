import AsyncStorage from '@react-native-async-storage/async-storage';
import { MockSchool } from './mock-directory';

function key(scope: 'teacher' | 'school-admin') {
  return `minaker.pinnedSchool.${scope}`;
}

export async function getPinnedSchool(scope: 'teacher' | 'school-admin'): Promise<MockSchool | null> {
  try {
    const raw = await AsyncStorage.getItem(key(scope));
    return raw ? (JSON.parse(raw) as MockSchool) : null;
  } catch {
    return null;
  }
}

export async function setPinnedSchool(scope: 'teacher' | 'school-admin', school: MockSchool): Promise<void> {
  await AsyncStorage.setItem(key(scope), JSON.stringify(school));
}

export async function clearPinnedSchool(scope: 'teacher' | 'school-admin'): Promise<void> {
  await AsyncStorage.removeItem(key(scope));
}
