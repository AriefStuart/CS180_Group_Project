import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem("userId", data.user_id.toString());
        await AsyncStorage.setItem("username", username);
        Alert.alert("Success", "Login successful!");
        router.replace("/(tabs)/home");
      } else {
        Alert.alert("Error", "Invalid username or password.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      Alert.alert("Error", "An error occurred. Please try again.");
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white p-4">
      <Text className="text-2xl font-bold mb-6">Login</Text>
      <TextInput
        className="w-full h-12 border border-gray-300 rounded-lg px-4 mb-4"
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        className="w-full h-12 border border-gray-300 rounded-lg px-4 mb-6"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity
        className="w-full h-12 bg-blue-500 rounded-lg justify-center items-center"
        onPress={handleLogin}
      >
        <Text className="text-white text-lg font-bold">Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.back()}
        className="bg-gray-300 px-4 py-4 rounded-full"
      >
        <Text className="text-black font-bold">Go to Create Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;
