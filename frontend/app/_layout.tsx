import { Stack } from "expo-router";
import "./global.css";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="photoSets/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="editProfile"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
