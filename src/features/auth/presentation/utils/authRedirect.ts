import { makeRedirectUri } from "expo-auth-session";
import { Platform } from "react-native";

const DEFAULT_NEXT_PATH = "/login";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function getWebBaseUrl() {
  const configured = process.env.EXPO_PUBLIC_AUTH_WEB_URL?.trim();
  if (configured) {
    return trimTrailingSlash(configured);
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return trimTrailingSlash(window.location.origin);
  }

  return "http://localhost:8081";
}

function normalizeNextPath(nextPath?: string | null) {
  if (!nextPath) {
    return DEFAULT_NEXT_PATH;
  }

  if (nextPath.startsWith("http://") || nextPath.startsWith("https://")) {
    try {
      const parsedUrl = new URL(nextPath);
      return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
    } catch {
      return DEFAULT_NEXT_PATH;
    }
  }

  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return DEFAULT_NEXT_PATH;
  }

  return nextPath;
}

export function buildNativeAuthCallbackUri(
  flow?: "confirmation" | "recovery",
  nextPath?: string | null,
) {
  return makeRedirectUri({
    scheme: "examenapp",
    path: "auth/callback",
    queryParams: flow
      ? {
          flow,
          next: normalizeNextPath(nextPath),
        }
      : undefined,
  });
}

export function buildWebAuthCallbackUrl(
  flow: "confirmation" | "recovery",
  nextPath?: string | null,
) {
  const callbackUrl = new URL("/auth/callback", `${getWebBaseUrl()}/`);
  callbackUrl.searchParams.set("flow", flow);
  callbackUrl.searchParams.set("next", normalizeNextPath(nextPath));
  return callbackUrl.toString();
}

export function buildAuthCallbackUrl(
  flow: "confirmation" | "recovery",
  nextPath?: string | null,
) {
  const hasConfiguredWebUrl = Boolean(
    process.env.EXPO_PUBLIC_AUTH_WEB_URL?.trim(),
  );

  if (Platform.OS === "web" || hasConfiguredWebUrl) {
    return buildWebAuthCallbackUrl(flow, nextPath);
  }

  return buildNativeAuthCallbackUri(flow, nextPath);
}

export function buildSafeNextPath(nextPath?: string | null) {
  return normalizeNextPath(nextPath);
}
