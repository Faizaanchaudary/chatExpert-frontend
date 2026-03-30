/**
 * Config - reads from .env via react-native-dotenv (Babel plugin).
 * Replaces react-native-config to avoid native module issues.
 */
import { baseUrl, googleLoginKey } from "@env";

// Ensure baseUrl ends with / so paths like "photobooks" resolve to baseUrl + "photobooks"
const normalizedBaseUrl = (baseUrl || "").trim();
const Config = {
  baseUrl: normalizedBaseUrl ? (normalizedBaseUrl.endsWith("/") ? normalizedBaseUrl : normalizedBaseUrl + "/") : "",
  googleLoginKey: googleLoginKey || "",
};

export default Config;
