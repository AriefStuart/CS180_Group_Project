module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|@react-native-async-storage|@expo|expo(nent)?|@expo(nent)?/.*|expo-router)",
  ],
};
