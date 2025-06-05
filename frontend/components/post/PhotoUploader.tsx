import { useState } from "react";
import { View, Text, Button, Image, Alert, TouchableOpacity, FlatList } from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AWS from "aws-sdk";

// Configure AWS S3
AWS.config.update({
  accessKeyId: process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY,
  region: process.env.EXPO_PUBLIC_AWS_REGION,
});

const PhotoUploader = () => {
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      selectionLimit: 0, // 0 or undefined allows multiple selection in some environments
    });

    if (!result.canceled) {
      const newUris = result.assets.map(asset => asset.uri);
      setImageUris(prev => [...prev, ...newUris]);
    }
  };

  const uploadPhotos = async () => {
    if (imageUris.length === 0) {
      Alert.alert("Error", "Please select at least one image first.");
      return;
    }

    setUploading(true);

    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("Error", "User ID not found.");
        setUploading(false);
        return;
      }

      for (const uri of imageUris) {
        const response = await fetch(uri);
        const blob = await response.blob();

        const s3 = new AWS.S3();
        const s3Params = {
          Bucket: "cs180-bucket",
          Key: `post-images/${Date.now()}-${uri.split("/").pop()}`,
          Body: blob,
          ContentType: "image/jpg",
        };

        const uploadResult = await s3.upload(s3Params).promise();
        console.log("Image uploaded successfully:", uploadResult.Location);

        const backendResponse = await fetch("http://127.0.0.1:5000/add_post", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            picture_link: uploadResult.Location,
          }),
        });

        if (!backendResponse.ok) {
          const errorData = await backendResponse.json();
          console.error("Error saving photo to backend:", errorData);
          Alert.alert("Error", errorData.message || "Failed to save photo.");
        }
      }

      Alert.alert("Success", "All photos uploaded successfully!");
      setImageUris([]); // Reset after upload
    } catch (error) {
      console.error("Error uploading photos:", error);
      Alert.alert("Error", "An error occurred while uploading the photos.");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setImageUris(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <View className="flex-1 justify-center items-center">
      <Button title="Pick images from camera roll" onPress={pickImage} />
      <FlatList
        data={imageUris}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        renderItem={({ item, index }) => (
          <View style={{ margin: 8, position: "relative" }}>
            <Image
              source={{ uri: item }}
              style={{ width: 100, height: 100, borderRadius: 10 }}
            />
            <TouchableOpacity
              style={{
                position: "absolute",
                top: 5,
                right: 5,
                backgroundColor: "red",
                borderRadius: 12,
                padding: 6,
                zIndex: 2,
              }}
              onPress={() => removePhoto(index)}
            >
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>X</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Button
        title={uploading ? "Uploading..." : "Upload Photos"}
        onPress={uploadPhotos}
        disabled={uploading}
      />
    </View>
  );
};

export default PhotoUploader;
