import { View, Text, Alert, Image, FlatList, Dimensions, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Post {
  post_id: number;
  user_id: number;
  picture_link: string;
  like_count: number;
  liked: boolean;
}

const AllPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchUserId = async () => {
        try {
          const storedUserId = await AsyncStorage.getItem("userId");
          if (storedUserId) {
            setUserId(parseInt(storedUserId, 10)); // Parse userId as an integer
          } else {
            console.error("User ID not found in AsyncStorage");
            Alert.alert("Error", "User ID not found.");
          }
        } catch (error) {
          console.error("Error fetching user ID from AsyncStorage:", error);
          Alert.alert("Error", "An error occurred while fetching user ID.");
        }
      };

      const fetchPostsForUserAndFriends = async () => {
        if (!userId) return;

        try {
          const response = await fetch(`http://127.0.0.1:5000/get_posts_for_user_and_friends/${userId}`);
          if (response.ok) {
            const data = await response.json();
            console.log("Fetched posts:", data);
            setPosts(data); // Store the posts from the backend
          } else {
            console.error("Failed to fetch posts");
            Alert.alert("Error", "Failed to fetch posts.");
          }
        } catch (error) {
          console.error("Error fetching posts:", error);
          Alert.alert("Error", "An error occurred while fetching posts.");
        }
      };

      const fetchLikedPosts = async () => {
        if (!userId) return;

        try {
          const response = await fetch(`http://127.0.0.1:5000/get_liked_posts/${userId}`);
          if (response.ok) {
            const likedPostIds: number[] = await response.json();
            setPosts((prevPosts) =>
              prevPosts.map((post) => ({
                ...post,
                liked: likedPostIds.includes(post.post_id), // Mark posts as liked if they are in the likedPostIds array
              }))
            );
          } else {
            console.error("Failed to fetch liked posts");
          }
        } catch (error) {
          console.error("Error fetching liked posts:", error);
        }
      };

      const initialize = async () => {
        await fetchUserId();
        await fetchPostsForUserAndFriends();
        await fetchLikedPosts();
        setLoading(false);
      };

      initialize();
    }, [userId]),
  );

  const toggleLike = async (post_id: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/toggle_like/${post_id}/${userId}/`, {
        method: "POST",
      });
      if (response.ok) {
        const updatedPost = await response.json();
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.post_id === post_id
              ? { ...post, like_count: updatedPost.like_count, liked: updatedPost.liked }
              : post
          )
        );
      } else {
        console.error("Failed to toggle like");
        Alert.alert("Error", "Failed to toggle like.");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      Alert.alert("Error", "An error occurred while toggling like.");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg">Loading...</Text>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg">No posts to display.</Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get("window").width;

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.post_id.toString()}
      renderItem={({ item }) => (
        <View className="mb-4">
          <Image
            source={{ uri: item.picture_link }}
            style={{ width: screenWidth, height: screenWidth }}
            className="rounded-lg"
          />
          <View className="flex-row justify-between items-center mt-2 px-4">
            <TouchableOpacity onPress={() => toggleLike(item.post_id)}>
              <Text className={`text-${item.liked ? "red" : "blue"}-500`}>
                {item.liked ? "Unlike" : "Like"}
              </Text>
            </TouchableOpacity>
            <Text className="text-gray-700">{item.like_count} Likes</Text>
          </View>
        </View>
      )}
      className="p-4"
    />
  );
};

export default AllPosts;