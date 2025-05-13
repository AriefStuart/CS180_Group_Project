import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { X } from "lucide-react-native";

interface RoundedButtonProps {
  text: string;
  color: string;
  borderRadius: string;
  isX: boolean;
}

const RoundedButton = ({
  text,
  color,
  borderRadius,
  isX,
}: RoundedButtonProps) => {
  return (
    <View>
      <TouchableOpacity
        className={`px-4 py-4 ${color} ${borderRadius} flex-row items-center self-start`}
      >
        <Text className="text-black items-center font-bold text-base">
          {text}
          {isX && (
            <View className="">
              <X size={30} color="black" />
            </View>
          )}{" "}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default RoundedButton;
