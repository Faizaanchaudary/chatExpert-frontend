module.exports = {
  preset: "react-native",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|react-native-zip-archive|@react-native-google-signin/google-signin|@react-native-async-storage/async-storage|react-native-iphone-x-helper|react-native-keyboard-aware-scroll-view|@react-native|@react-navigation|@react-native-google-signin)/)",
  ],
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
    "^.+\\.(ts|tsx)$": "ts-jest",
  },

  setupFiles: ["<rootDir>/setup-jest.js"],

  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  testPathIgnorePatterns: ["/node_modules/", "/android/", "/ios/"],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json", // Ensure Jest picks up the correct tsconfig
      babelConfig: true,
      // isolatedModules: true,
    },
  },
  testEnvironment: "node",
};
