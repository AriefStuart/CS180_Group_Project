import { useState } from "react";
import { Button, Image, View, Text, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";

const PhotoPicker = () => {
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View className="flex-1 justify-center items-center">
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      {image && <Image source={{ uri: image }} className="w-48 h-48 mt-4" />}
    </View>
  );
};

export default PhotoPicker;
