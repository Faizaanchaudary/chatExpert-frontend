declare module 'react-native-config' {
  export interface NativeConfig {
    GROQ_API_KEY?: string;
    baseUrl?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
