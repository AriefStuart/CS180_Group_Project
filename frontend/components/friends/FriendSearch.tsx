import {
  View,
  Text,
  TextInput,
  FlatList,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

interface User {
  id: number;
  username: string;
  isFriend: boolean; // Indicates whether the user is already a friend
}

const FriendSearch = () => {
  const [searchQuery, setSearchQuery] = useState(""); // State to store the search query
  const [userId, setUserId] = useState<number | null>(null); // Current user's ID
  const [users, setUsers] = useState<User[]>([]); // State to store all users
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]); // State to store filtered users

  // Fetch the current user's ID from AsyncStorage
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(parseInt(storedUserId, 10));
        } else {
          console.error("User ID not found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching user ID from AsyncStorage:", error);
      }
    };

    fetchUserId();
  }, []);

  // Fetch users from the backend whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      const fetchUsers = async () => {
        if (!userId) return;

        try {
          const response = await fetch(
            `http://127.0.0.1:5000/get_users_excluding_me?user_id=${userId}`,
          ); // Pass userId as a query parameter
          if (response.ok) {
            const data = await response.json();
            console.log("Fetched users:", data);
            setUsers(data); // Set the users from the backend
            setFilteredUsers(data); // Initially, all users are displayed
          } else {
            console.error("Failed to fetch users");
            Alert.alert("Error", "Failed to fetch users.");
          }
        } catch (error) {
          console.error("Error fetching users:", error);
          Alert.alert("Error", "An error occurred while fetching users.");
        }
      };

      fetchUsers();
    }, [userId]),
  );

  // Update filtered users when the search query changes
  useEffect(() => {
    setFilteredUsers(
      users.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    );
  }, [searchQuery, users]);

  // Handle adding or removing a friend
  const toggleFriend = async (friendId: number, isFriend: boolean) => {
    if (!userId) {
      Alert.alert("Error", "User ID not available.");
      return;
    }

    try {
      const endpoint = isFriend
        ? `http://127.0.0.1:5000/remove_friend/${userId}/${friendId}/`
        : `http://127.0.0.1:5000/add_friend/${userId}/${friendId}/`;

      const response = await fetch(endpoint, { method: "POST" });

      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === friendId ? { ...user, isFriend: !isFriend } : user,
          ),
        );
        Alert.alert(
          "Success",
          isFriend
            ? "Friend removed successfully!"
            : "Friend added successfully!",
        );
      } else {
        Alert.alert("Error", "Failed to update friend status.");
      }
    } catch (error) {
      console.error("Error toggling friend status:", error);
      Alert.alert("Error", "An error occurred while updating friend status.");
    }
  };

  return (
    <View className="flex-1 pt-12 px-4 bg-white">
      <Text className="text-xl font-bold mb-4">Search Friends</Text>
      <TextInput
        className="h-10 border border-gray-300 rounded-lg px-3 mb-4"
        placeholder="Search..."
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text)} // Update search query
      />
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
            <Text className="text-lg">{item.username}</Text>
            <TouchableOpacity
              className={`px-4 py-2 rounded-lg ${
                item.isFriend ? "bg-red-500" : "bg-blue-500"
              }`}
              onPress={() => toggleFriend(item.id, item.isFriend)}
            >
              <Text className="text-white font-bold">
                {item.isFriend ? "Remove Friend" : "Add Friend"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default FriendSearch;
