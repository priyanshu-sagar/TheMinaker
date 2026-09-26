import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'minaker.hasSeenOnboarding';

export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) === '1';
  } catch {
    return false;
  }
}

export async function markOnboardingSeen(): Promise<void> {
  await AsyncStorage.setItem(KEY, '1');
}
