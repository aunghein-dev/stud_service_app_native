import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_BACKEND_PORT = '8080';
const DEFAULT_PATH = '/api/v1';

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

function isLoopbackHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
}

function extractHost(value: string | undefined | null): string | null {
  if (!value) {
    return null;
  }

  const raw = value.trim();
  if (!raw) {
    return null;
  }

  // Handles values like:
  // - 192.168.1.10:8081
  // - exp://192.168.1.10:8081
  // - https://example.com:8081/path
  const normalized = raw.includes('://') ? raw : `http://${raw}`;
  try {
    const parsed = new URL(normalized);
    return parsed.hostname || null;
  } catch {
    return raw.split(':')[0] || null;
  }
}

function getExpoHostFromDevServer(): string | null {
  const candidates = [
    Constants.expoConfig?.hostUri,
    (Constants as any)?.expoGoConfig?.debuggerHost as string | undefined,
    (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost as string | undefined,
    (Constants as any)?.manifest?.debuggerHost as string | undefined,
    (Constants as any)?.manifest?.hostUri as string | undefined,
    Constants.linkingUri
  ];

  for (const candidate of candidates) {
    const host = extractHost(candidate);
    if (host) {
      return host;
    }
  }
  return null;
}

function buildDefaultApiUrl(host: string): string {
  return `http://${host}:${DEFAULT_BACKEND_PORT}${DEFAULT_PATH}`;
}

function resolveApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  const expoHost = getExpoHostFromDevServer();
  const defaultHost = expoHost || (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');

  if (!envUrl) {
    return stripTrailingSlash(buildDefaultApiUrl(defaultHost));
  }

  try {
    const parsed = new URL(envUrl);

    // Expo Go runs on a physical device, so localhost in env would point to the phone itself.
    if (expoHost && isLoopbackHost(parsed.hostname)) {
      parsed.hostname = expoHost;
      if (!parsed.port) {
        parsed.port = DEFAULT_BACKEND_PORT;
      }
      if (!parsed.pathname || parsed.pathname === '/') {
        parsed.pathname = DEFAULT_PATH;
      }
      return stripTrailingSlash(parsed.toString());
    }

    return stripTrailingSlash(parsed.toString());
  } catch {
    // Supports raw host:port values in env (e.g. 192.168.1.3:8080/api/v1)
    const host = extractHost(envUrl);
    if (host && !envUrl.includes('://')) {
      return stripTrailingSlash(`http://${envUrl}`);
    }
    return stripTrailingSlash(envUrl);
  }
}

export const API_BASE_URL = resolveApiBaseUrl();
