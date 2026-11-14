import * as Application from 'expo-application';
import Constants from 'expo-constants';

const APP_CONFIG_URL = 'https://raw.githubusercontent.com/cixxwastaken/HouseholdAppProjectRepo/main/app.json';
export const APP_RELEASES_URL = 'https://expo.dev/accounts/cixx/projects/homebase-household/builds';

type PublicAppConfig = { expo?: { version?: unknown } };

function parseVersion(version: string): number[] | null {
  if (!/^\d+\.\d+\.\d+$/.test(version)) return null;
  const parts = version.split('.').map(Number);
  return parts.every(Number.isSafeInteger) ? parts : null;
}

function compareVersions(left: string, right: string): number | null {
  const leftParts = parseVersion(left);
  const rightParts = parseVersion(right);
  if (!leftParts || !rightParts) return null;

  for (let index = 0; index < leftParts.length; index += 1) {
    if (leftParts[index] !== rightParts[index]) {
      return leftParts[index] > rightParts[index] ? 1 : -1;
    }
  }
  return 0;
}

export type AppUpdate = { currentVersion: string; latestVersion: string };

/** Reads the public app config so a release version doesn't have to be bundled in the client. */
export async function checkForAppUpdate(): Promise<AppUpdate | null> {
  const currentVersion = Application.nativeApplicationVersion ?? Constants.expoConfig?.version ?? null;
  if (!currentVersion || !parseVersion(currentVersion)) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch(`${APP_CONFIG_URL}?cacheBust=${Date.now()}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Version check returned HTTP ${response.status}.`);

    const config = (await response.json()) as PublicAppConfig;
    const latestVersion = typeof config.expo?.version === 'string' ? config.expo.version : '';
    if (compareVersions(latestVersion, currentVersion) !== 1) return null;

    return { currentVersion, latestVersion };
  } finally {
    clearTimeout(timeout);
  }
}
