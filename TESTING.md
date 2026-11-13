# Test Homebase

## Desktop browser

From this folder, run:

```powershell
npm run test:desktop
```

Expo opens the app in your desktop browser. This is the fastest way to check layout, navigation, authentication screens, chores, calendar, and shopping-list flows. Push-notification registration intentionally does nothing on web.

## Android phone — quick testing

1. Install the SDK 58-compatible Expo Go build from [expo.dev/go](https://expo.dev/go) on the phone.
2. Connect the phone and computer to the same Wi-Fi network.
3. Run `npm run test:android:lan` and scan the terminal QR code in Expo Go.
4. If LAN discovery is blocked, run `npm run test:android` instead; this uses Expo's tunnel and displays a different QR code.

Fast Refresh reloads the app after TypeScript changes. The app uses the local `.env` file, so never share the QR code with anyone you do not trust while it points to a development backend.

## Android development build — push-notification testing

Expo Go is suitable for ordinary UI and Supabase-auth testing. Remote push notifications on Android require a development build for this project.

1. Install the development client: `npx expo install expo-dev-client`.
2. Set up Android Studio and enable USB debugging on the phone.
3. Connect the phone by USB, then run `npx expo run:android --device`.
4. For later JavaScript-only changes, start `npx expo start` and open the installed Homebase development client.

Rebuild the development client after adding/updating a native module or changing `app.json`.

## Checks

```powershell
npm run typecheck
npm run lint
```

No test mode applies the Supabase migration or changes live data. The app will show the existing authentication/onboarding experience until the version-controlled migration is explicitly approved and applied.
