import { useState } from "react";
import { Button, Image, View, FlatList, TouchableOpacity, Text, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";

const PhotoSetUploader = () => 
{
  // Array to hold the selected photos
  const [photos, setPhotos] = useState<string[]>([]);

  // Function to pick a photo from the library
  const pickPhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      // Square images, can be changed later for other aspect ratios
      aspect: [1, 1],
      quality: 1,
    });

    // Add photo to the array if not canceled
    if (!result.canceled) 
    {
      setPhotos((prevPhotos) => [...prevPhotos, result.assets[0].uri]);
    }
  };

    // Code to remove a photo from the array
  const removePhoto = (index: number) => 
  {
    setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <Button title="Upload Photo" onPress={pickPhoto} />
      <FlatList
        data={photos}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        renderItem={({ item, index }) => (
          <View style={styles.photoContainer}>
            <Image source={{ uri: item }} style={styles.photo} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removePhoto(index)}
            >
              <Text style={styles.removeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

// Style information

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    alignItems: "center",
  },
  photoContainer: {
    position: "relative",
    margin: 5,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "red",
    borderRadius: 10,
    padding: 5,
  },
  removeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default PhotoSetUploader;