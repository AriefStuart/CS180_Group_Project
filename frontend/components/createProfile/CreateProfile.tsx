import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CreateProfile = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if (fullName && username && password) {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_SERVER_IP}/add`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fullname: fullName,
              username: username,
              password: password,
            }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Profile created:", data);
          await AsyncStorage.setItem("userId", data.id.toString());
          Alert.alert("Success", "Profile created successfully!");
          router.replace("/(tabs)/home");
        } else {
          const errorData = await response.json();
          console.error("Error creating profile:", errorData);
          Alert.alert(
            "Error",
            errorData.message || "Failed to create profile.",
          );
        }
      } catch (error) {
        console.error("Error:", error);
        Alert.alert("Error", "An error occurred while creating the profile.");
      }
    } else {
      Alert.alert("Validation Error", "Please fill out all fields.");
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white mt-60 px-4">
      <Text className="text-2xl font-bold mb-4">Create Profile</Text>
      <TextInput
        placeholder="Full Name"
        placeholderTextColor="#747474"
        value={fullName}
        onChangeText={setFullName}
        className="border-b border-gray-300 w-full mb-8 p-2"
      />
      <TextInput
        placeholder="Username"
        placeholderTextColor="#747474"
        value={username}
        onChangeText={setUsername}
        className="border-b border-gray-300 w-full mb-8 p-2"
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#747474"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="border-b border-gray-300 w-full mb-8 p-2"
      />
      <TouchableOpacity
        onPress={handleSubmit}
        className="bg-app-primary px-4 py-4 rounded-full"
      >
        <Text className="text-white font-bold">Submit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/login")}
        className="bg-gray-300 px-4 py-4 rounded-full"
      >
        <Text className="text-black font-bold">Go to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreateProfile;
