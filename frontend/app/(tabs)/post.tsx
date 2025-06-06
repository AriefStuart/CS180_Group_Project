import React, { useState } from "react";
import { ScrollView, View, Text, TextInput, Button, StyleSheet } from "react-native";
import PhotoUploader from "@/components/post/PhotoUploader";

const Post = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handlePost = () => {
    console.log("Title:", title);
    console.log("Description:", description);
    console.log("Photo uploaded!");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Create a Post</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter title"
        value={title}
        onChangeText={(text) => setTitle(text)}
      />
      <TextInput
        style={[styles.input, styles.descriptionInput]}
        placeholder="Enter description"
        value={description}
        onChangeText={(text) => setDescription(text)}
        multiline
      />
      <View style={styles.photoUploader}>
        <PhotoUploader />
      </View>
      <Button title="Post" onPress={handlePost} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: "top",
  },
  photoUploader: {
    marginBottom: 16,
  },
});

export default Post;