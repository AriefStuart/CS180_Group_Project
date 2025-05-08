import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import ProfilePic from "@/assets/images/profile/default_profile_picture.jpg";
import CameraIcon from "@/assets/images/editProfile/camera-icon.svg";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EditProfile = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState(ProfilePic);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          console.error("User ID not found");
          return;
        }

        const response = await fetch(`http://10.13.129.5:5000/get/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setFullName(data.fullname);
          setUsername(data.username);
          setBio(data.bio || "");
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        console.error("User ID not found");
        return;
      }
      const response = await fetch(`http://10.13.129.5:5000/update/${userId}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullname: fullName,
          username: username,
          password: "placeholder_password", // Replace with actual password logic
          bio: bio,
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Profile updated successfully!");
        router.back();
      } else {
        const errorData = await response.json();
        console.error("Error updating profile:", errorData);
        Alert.alert("Error", errorData.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "An error occurred while updating the profile.");
    }
  };

  const handleCancel = () => {
    console.log("Edit cancelled");
    // Add your cancel logic here
    router.back();
  };

  const handleChangePhoto = async () => {
    console.log("Change photo pressed");

    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex mx-4">
      <View className="flex-row justify-between">
        <TouchableOpacity onPress={handleCancel}>
          <Text className="text-app-secondary font-bold text-2xl">Cancel</Text>
        </TouchableOpacity>
        <Text className="font-bold text-2xl">Edit Profile</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text className="text-app-primary font-bold text-2xl pl-5">Save</Text>
        </TouchableOpacity>
      </View>

      <View className="items-center mt-4">
        <View className="relative">
          <Image
            source={
              typeof profileImage === "string"
                ? { uri: profileImage }
                : profileImage
            }
            className="w-32 h-32 rounded-full"
          />
          <TouchableOpacity
            onPress={handleChangePhoto}
            className="absolute -bottom-4 -right-4 bg-white rounded-full"
          >
            <CameraIcon className="bg-white" />
          </TouchableOpacity>
        </View>
      </View>

      <Text className="text-sm text-gray-600">Full name</Text>
      <TextInput
        value={fullName}
        onChangeText={setFullName}
        className="border-b border-gray-300 pb-2 text-base mb-4"
      />

      <Text className="text-sm text-gray-600">Username</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        className="border-b border-gray-300 pb-2 text-base mb-4"
      />

      <Text className="text-sm text-gray-600">Bio</Text>
      <TextInput
        value={bio}
        onChangeText={setBio}
        multiline
        className="border-b border-gray-300 pb-2 text-base mb-4"
      />
    </SafeAreaView>
  );
};

export default EditProfile;
