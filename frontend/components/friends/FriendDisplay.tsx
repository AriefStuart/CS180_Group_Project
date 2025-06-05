import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { X, MoreHorizontal } from "lucide-react-native";

// Default avatar from Gravatar
const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/default?s=200&d=mp";

interface FriendDisplayProps {
  profilePicture: string;
  name: string;
  username: string;
  option: "Friend Add" | "Friend Result" | "Friend Request" | "Friend Request Sent";
  onOptionPress?: () => void;
}

const FriendDisplay: React.FC<FriendDisplayProps> = ({
  profilePicture,
  name,
  username,
  option,
  onOptionPress,
}) => {
  const [imageSource, setImageSource] = useState({ uri: profilePicture || DEFAULT_AVATAR });

  // Render the right section based on the option prop
  const renderRightSection = () => {
    switch (option) {
      case "Friend Add":
        return (
          <TouchableOpacity 
            className="bg-blue-500 px-4 py-1 rounded-full"
            onPress={onOptionPress}
          >
            <Text className="text-white font-semibold">Add</Text>
          </TouchableOpacity>
        );

      case "Friend Request":
        return (
          <View className="flex-row space-x-2">
            <TouchableOpacity 
              className="bg-red-500 px-4 py-1 rounded-full"
              onPress={onOptionPress}
            >
              <Text className="text-white font-semibold">Ignore</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-blue-500 px-4 py-1 rounded-full"
              onPress={onOptionPress}
            >
              <Text className="text-white font-semibold">Accept</Text>
            </TouchableOpacity>
          </View>
        );

      case "Friend Request Sent":
        return (
          <View className="flex-row items-center space-x-2">
            <View className="bg-yellow-400 px-3 py-1 rounded-full">
              <Text className="text-white font-semibold">Request Sent</Text>
            </View>
            <TouchableOpacity onPress={onOptionPress}>
              <X size={20} color="black" />
            </TouchableOpacity>
          </View>
        );

      case "Friend Result":
        return (
          <TouchableOpacity onPress={onOptionPress}>
            <MoreHorizontal size={20} color="black" />
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  return (
    <View className="flex-row items-center justify-between bg-white p-4 my-2 rounded-xl shadow">
      <View className="flex-row items-center space-x-4">
        <Image
          source={imageSource}
          className="w-12 h-12 rounded-full"
          onError={() => {
            setImageSource({ uri: DEFAULT_AVATAR });
          }}
        />
        <View>
          <Text className="text-base font-bold">{name}</Text>
          <Text className="text-sm text-gray-500">@{username}</Text>
        </View>
      </View>
      {renderRightSection()}
    </View>
  );
};

export default FriendDisplay; 