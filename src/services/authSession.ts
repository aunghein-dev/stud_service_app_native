let accessToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function getSessionToken() {
  return accessToken;
}

export function setSessionToken(token?: string | null) {
  accessToken = token?.trim() || null;
}

export function clearSessionToken() {
  accessToken = null;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export function notifyUnauthorized() {
  unauthorizedHandler?.();
}
