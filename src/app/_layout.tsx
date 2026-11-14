import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { Alert, Platform } from 'react-native';
import { NavigationBar } from 'expo-navigation-bar';
import * as Linking from 'expo-linking';
import { APP_RELEASES_URL, checkForAppUpdate } from '../lib/app-version';

export default function RootLayout() {
  const checkedForUpdate = useRef(false);

  useEffect(() => {
    if (Platform.OS === 'android') NavigationBar.setHidden(true);
  }, []);

  useEffect(() => {
    if (checkedForUpdate.current) return;
    checkedForUpdate.current = true;

    void checkForAppUpdate().then((update) => {
      if (!update) return;
      Alert.alert(
        'Update available',
        `Homebase ${update.latestVersion} is newer than your installed version ${update.currentVersion}. Open the Expo builds page to install it.`,
        [
          { text: 'Later', style: 'cancel' },
          {
            text: 'View update',
            onPress: () => {
              void Linking.openURL(APP_RELEASES_URL).catch((error) => {
                if (__DEV__) console.warn('Could not open the Homebase release page.', error);
                Alert.alert('Could not open updates', 'Please try opening the Homebase Expo builds page again.');
              });
            },
          },
        ],
      );
    }).catch((error) => {
      // A failed network check should never block sign-in or household access.
      if (__DEV__) console.warn('Could not check for a Homebase update.', error);
    });
  }, []);

  return <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="(tabs)" />
  </Stack>;
}
