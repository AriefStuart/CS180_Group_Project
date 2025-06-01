import { useState } from "react";
import { View, Text, Button, Image, Alert, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AWS from "aws-sdk";
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } from "@env"; // Import from .env

// Configure AWS S3
AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

const PhotoUploader = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadPhoto = async () => {
    if (!imageUri) {
      Alert.alert("Error", "Please select an image first.");
      return;
    }

    setUploading(true);

    try {
      // Get user_id from AsyncStorage
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("Error", "User ID not found.");
        setUploading(false);
        return;
      }

      // Fetch the image as a blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Upload the image to S3
      const s3 = new AWS.S3();
      const s3Params = {
        Bucket: "cs180-bucket", // Replace with your bucket name
        Key: `post-images/${Date.now()}-${imageUri.split("/").pop()}`, // Unique key for the image
        Body: blob,
        ContentType: "image/jpg", // Adjust based on the image type
      };

      const uploadResult = await s3.upload(s3Params).promise();
      console.log("Image uploaded successfully:", uploadResult.Location);

      // Send the S3 URL to the backend
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

      if (backendResponse.ok) {
        Alert.alert("Success", "Photo uploaded successfully!");
        setImageUri(null); // Reset the selected image
      } else {
        const errorData = await backendResponse.json();
        console.error("Error saving photo to backend:", errorData);
        Alert.alert("Error", errorData.message || "Failed to save photo.");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      Alert.alert("Error", "An error occurred while uploading the photo.");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    setImageUri(null);
  };

  return (
    <View className="flex-1 justify-center items-center">
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      {imageUri && (
        <View style={{ marginTop: 16, position: "relative" }}>
          <Image
            source={{ uri: imageUri }}
            style={{ width: 192, height: 192, borderRadius: 10 }}
          />
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "red",
              borderRadius: 12,
              padding: 6,
              zIndex: 2,
            }}
            onPress={removePhoto}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              X
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <Button
        title={uploading ? "Uploading..." : "Upload Photo"}
        onPress={uploadPhoto}
        disabled={uploading}
      />
    </View>
  );
};

export default PhotoUploader;
