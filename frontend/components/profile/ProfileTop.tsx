import { useState, useCallback } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import ProfilePic from "@/assets/images/profile/default_profile_picture.jpg";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileTop = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState(ProfilePic);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
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
    }, []),
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text>Loading ...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex items-center">
      <Text className="text-2xl font-bold">Profile</Text>
      <Link href="/editProfile" asChild>
        <TouchableOpacity>
          <Image
            source={
              typeof profileImage === "string"
                ? { uri: profileImage }
                : profileImage
            }
            className="w-32 h-32 mt-4 rounded-full"
          />
        </TouchableOpacity>
      </Link>
      <Link href="/editProfile" asChild>
        <TouchableOpacity>
          <Text className="text-2xl font-bold mt-1">{fullName}</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/editProfile" asChild>
        <TouchableOpacity>
          <Text className="text-xl">{username}</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/editProfile" asChild>
        {bio === "" ? (
          <TouchableOpacity className="mt-1 bg-app-primary rounded-full px-4 py-1 flex items-center">
            <Text className="text-white font-extrabold text-xs">+ Add bio</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity className="px-4 py-1 flex items-center">
            <Text className="text-app-gray text-sm">{bio}</Text>
          </TouchableOpacity>
        )}
      </Link>
      <View className="flex-row justify-around w-full mt-5">
        <View className="items-center">
          <Text className="text-3xl font-bold">42</Text>
          <Text className="text-app-primary text-base font-bold">Posts</Text>
        </View>
        <View className="items-center">
          <Text className="text-3xl font-bold">36</Text>
          <Text className="text-app-primary text-base font-bold">Friends</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProfileTop;
