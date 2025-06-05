import {
  View,
  Text,
  Alert,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PhotoCarousel from "@/components/post/PhotoCarousel";

interface PostSet {
  post_set_id: number;
  user_id: number;
  photos: string[];
  like_counts: number[];
  post_ids: number[];
  liked: boolean[];
}

const AllPosts = () => {
  const [postSets, setPostSets] = useState<PostSet[]>([]);
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
          const response = await fetch(
            `${process.env.EXPO_PUBLIC_SERVER_IP}/get_posts_for_user_and_friends/${userId}`,
          );
          if (response.ok) {
            const data = await response.json();
            setPostSets(data); // Store the post sets from the backend
          } else {
            Alert.alert("Error", "Failed to fetch posts.");
          }
        } catch (error) {
          Alert.alert("Error", "An error occurred while fetching posts.");
        }
      };

      // const fetchLikedPosts = async () => {
      //   if (!userId) return;

      //   try {
      //     const response = await fetch(
      //       `${process.env.EXPO_PUBLIC_SERVER_IP}/get_liked_posts/${userId}`,
      //     );
      //     if (response.ok) {
      //       const likedPostIds: number[] = await response.json();
      //       setPosts((prevPosts) =>
      //         prevPosts.map((post) => ({
      //           ...post,
      //           liked: likedPostIds.includes(post.post_id), // Mark posts as liked if they are in the likedPostIds array
      //         })),
      //       );
      //     } else {
      //       console.error("Failed to fetch liked posts");
      //     }
      //   } catch (error) {
      //     console.error("Error fetching liked posts:", error);
      //   }
      // };

      const initialize = async () => {
        await fetchUserId();
        await fetchPostsForUserAndFriends();
        // await fetchLikedPosts();
        setLoading(false);
      };

      initialize();
    }, [userId]),
  );

  const toggleLike = async (
    post_id: number,
    setIndex: number,
    photoIndex: number,
  ) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SERVER_IP}/toggle_like/${post_id}/${userId}/`,
        { method: "POST" },
      );
      if (response.ok) {
        const updated = await response.json();
        setPostSets((prev) => {
          const updatedSets = [...prev];
          updatedSets[setIndex].like_counts[photoIndex] = updated.like_count;
          updatedSets[setIndex].liked[photoIndex] = updated.liked;
          return updatedSets;
        });
      }
    } catch (error) {
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

  if (postSets.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg">No posts to display.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={postSets}
      keyExtractor={(item) => item.post_set_id.toString()}
      renderItem={({ item, index: setIndex }) => (
        <View className="mb-8">
          <PhotoCarousel
            photos={item.photos}
            likeCounts={item.like_counts}
            liked={item.liked}
            postIds={item.post_ids}
            onToggleLike={(photoIndex: number) =>
              toggleLike(item.post_ids[photoIndex], setIndex, photoIndex)
            }
          />
        </View>
      )}
      className="p-4"
    />
  );
};

export default AllPosts;
