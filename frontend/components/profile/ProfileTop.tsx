import { View, Text, Image, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import ProfilePic from "@/assets/images/profile/profilePic.webp";

const ProfileTop = () => {
  return (
    <SafeAreaView className="flex items-center">
      <Text className="text-2xl font-bold">Profile</Text>
      <Link href="/editProfile" asChild>
        <TouchableOpacity>
          <Image source={ProfilePic} className="w-32 h-32 mt-4 rounded-full" />
        </TouchableOpacity>
      </Link>
      <Link href="/editProfile" asChild>
        <TouchableOpacity>
          <Text className="text-2xl font-bold mt-1">Aryan Goel</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/editProfile" asChild>
        <TouchableOpacity>
          <Text className="text-xl">agoel27</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/editProfile" asChild>
        <TouchableOpacity className="mt-1 bg-app-primary rounded-full px-4 py-1 flex items-center">
          <Text className="text-white font-extrabold text-xs">+ Add bio</Text>
        </TouchableOpacity>
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
