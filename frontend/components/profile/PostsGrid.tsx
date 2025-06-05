import { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  Alert,
  Modal,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from "@google/genai";
import Base64 from "base64-js";

interface Post {
  picture_link: string;
  like_count: number;
}

const PostsGrid = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null); // State for the selected post
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility
  const [generatedComment, setGeneratedComment] = useState("");
  const [generating, setGenerating] = useState(false);

  const generateInstagramComment = async (imageUrl: string) => {
    setGenerating(true);
    setGeneratedComment("");

    try {
      console.log("Generating comment for image:", imageUrl);
      const response = await fetch("https://corsproxy.io/?" + imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const base64Image = Base64.fromByteArray(new Uint8Array(arrayBuffer));

      const ai = new GoogleGenAI({
        apiKey: process.env.EXPO_PUBLIC_GEMINI_KEY,
      });

      const contents = [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: base64Image } },
            {
              text: "Write a fun and engaging Instagram comment for this image.",
            },
          ],
        },
      ];

      const stream = await ai.models.generateContentStream({
        model: "gemini-2.0-flash",
        contents,
      });

      let buffer: string[] = [];
      for await (let chunk of stream) {
        buffer.push(chunk.text!);
      }

      setGeneratedComment(buffer.join(""));
    } catch (error) {
      console.error("Error generating comment:", error);
      setGeneratedComment("Failed to generate comment. Try again.");
    } finally {
      setGenerating(false);
    }
  };

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

          const response = await fetch(
            `${process.env.EXPO_PUBLIC_SERVER_IP}/get_posts/${userId}/`,
          );
          if (response.ok) {
            const data = await response.json();
            console.log("Fetched posts:", data);
            setPosts(data); // Store the full post object (including picture_link and like_count)
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
    }, []),
  );

  const openModal = (post: Post) => {
    setSelectedPost(post);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedPost(null);
    setModalVisible(false);
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
    <View className="flex-1">
      <FlatList
        data={posts}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3} // Display posts in a grid with 3 columns
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openModal(item)}>
            <View className="m-1">
              <Image
                source={{ uri: item.picture_link }}
                className="w-32 h-32 rounded-lg"
              />
            </View>
          </TouchableOpacity>
        )}
        className="p-4"
      />

      {/* Modal for expanded photo */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-75">
          {selectedPost && (
            <View className="items-center">
              <Image
                source={{ uri: selectedPost.picture_link }}
                style={{ width: screenWidth * 0.9, height: screenWidth * 0.9 }}
                className="rounded-lg"
              />
              <Text className="text-white text-lg mt-4">
                {selectedPost.like_count} Likes
              </Text>
              <TouchableOpacity
                onPress={() =>
                  generateInstagramComment(selectedPost.picture_link)
                }
                className="mt-4 bg-blue-600 px-4 py-2 rounded-lg"
              >
                <Text className="text-white">
                  {generating ? "Generating..." : "Generate Instagram Comment"}
                </Text>
              </TouchableOpacity>

              {generatedComment !== "" && (
                <View className="mt-4 px-4">
                  <Text className="text-white text-center italic">
                    {generatedComment}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                onPress={closeModal}
                className="mt-4 bg-gray-800 px-4 py-2 rounded-lg"
              >
                <Text className="text-white">Close</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default PostsGrid;
