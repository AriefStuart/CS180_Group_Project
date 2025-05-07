import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import ProfilePic from "@/assets/images/profile/profilePic.webp";
import CameraIcon from "@/assets/images/editProfile/camera-icon.svg";
import { useRouter } from "expo-router";

const EditProfile = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("Aryan Goel");
  const [username, setUsername] = useState("agoel27");
  const [bio, setBio] = useState(
    "Hello there! My name is Aryan and I love thai food!",
  );
  const [profileImage, setProfileImage] = useState(ProfilePic);

  const handleSave = () => {
    console.log("Profile saved:", { fullName, username, bio });
    // Add your save logic here
    router.back();
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
