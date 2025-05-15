import { useState, useEffect, useCallback } from "react";
import { View, Text, Image, FlatList, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const PostsGrid = () => {
  const [post, setPost] = useState("");
  const [loading, setLoading] = useState(true);

  useFocusEffect(
      useCallback(() => {
    const fetchPosts = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          console.error("User ID not found");
          Alert.alert("Error", "User ID not found.");
          return;
        }

        const response = await fetch(`http://127.0.0.1:5000/get_posts/${userId}/`);
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setPost(data[0].picture_link);
        } else {
          console.error("Failed to fetch posts");
          Alert.alert("Error", "Failed to fetch posts.");
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        Alert.alert("Error", "An error occurred while fetching posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    console.log(post);
}, []),
);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (post.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text>No posts to display.</Text>
      </View>
    );
  }

  return (
    <>
    <Text>PostsGrid</Text>
    
        <View >
          <Image source={{ uri: post }} />
          <Text>{post}</Text>
        </View>
      
    
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  postContainer: {
    flex: 1,
    margin: 5,
  },
  postImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
});

export default PostsGrid;