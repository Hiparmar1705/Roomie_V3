import { NativeModules, Platform } from 'react-native';

const DEFAULT_PORT = '3000';
const API_PATH = '/api';

const getScriptHost = () => {
  const scriptURL = NativeModules?.SourceCode?.scriptURL;

  if (!scriptURL) {
    return null;
  }

  const match = scriptURL.match(/^https?:\/\/([^/:]+)/i);
  return match?.[1] || null;
};

const buildDefaultBaseUrl = () => {
  const scriptHost = getScriptHost();

  if (scriptHost && scriptHost !== 'localhost' && scriptHost !== '127.0.0.1') {
    return `http://${scriptHost}:${DEFAULT_PORT}${API_PATH}`;
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${DEFAULT_PORT}${API_PATH}`;
  }

  return `http://localhost:${DEFAULT_PORT}${API_PATH}`;
};

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || buildDefaultBaseUrl();

export const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const rawText = await response.text();

  let payload = null;
  if (rawText) {
    try {
      payload = JSON.parse(rawText);
    } catch {
      payload = null;
    }
  }

  if (!response.ok || !payload?.success) {
    const message =
      payload?.message ||
      (rawText && !payload ? rawText : null) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload;
};
