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
import FriendDisplay from "./FriendDisplay";

interface User {
  id: number;
  username: string;
  name: string;
  profilePicture: string;
  friendStatus:
    | "Friend Add"
    | "Friend Result"
    | "Friend Request"
    | "Friend Request Sent";
}

const DEFAULT_PROFILE_PICTURE = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

const FriendSearch = () => {
  const [searchQuery, setSearchQuery] = useState(""); 
  const [userId, setUserId] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

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
            `http://127.0.0.1:5000/get_users_excluding_me?user_id=${userId}`
          );
          if (response.ok) {
            const data = await response.json();
            console.log("Raw fetched users:", data);
            
            // Validate and transform the data
            const validatedUsers = data.map((user: any) => ({
              id: user.id || 0,
              username: user.username || "unknown",
              name: user.name || "Unknown User",
              profilePicture: user.profilePicture || DEFAULT_PROFILE_PICTURE,
              friendStatus: user.friendStatus || "Friend Add"
            }));
            
            console.log("Validated users:", validatedUsers);
            setUsers(validatedUsers);
            setFilteredUsers(validatedUsers);
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
    }, [userId])
  );

  // Update filtered users when the search query changes
  useEffect(() => {
    setFilteredUsers(
      users.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, users]);

  // Handle adding or removing a friend
  const toggleFriend = async (friendId: number, currentStatus: string) => {
    if (!userId) return;

    let endpoint = "";
    let newStatus: User["friendStatus"] = currentStatus as User["friendStatus"];

    switch (currentStatus) {
      case "Friend Add":
        endpoint = `http://127.0.0.1:5000/add_friend/${userId}/${friendId}/`;
        newStatus = "Friend Request Sent";
        break;
      case "Friend Request Sent":
      case "Friend Result":
        endpoint = `http://127.0.0.1:5000/remove_friend/${userId}/${friendId}/`;
        newStatus = "Friend Add";
        break;
      case "Friend Request":
        endpoint = `http://127.0.0.1:5000/accept_friend/${userId}/${friendId}/`;
        newStatus = "Friend Result";
        break;
      default:
        return;
    }

    try {
      const response = await fetch(endpoint, { method: "POST" });

      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === friendId ? { ...user, friendStatus: newStatus } : user
          )
        );
        setFilteredUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === friendId ? { ...user, friendStatus: newStatus } : user
          )
        );
        Alert.alert("Success", "Friend status updated!");
      } else {
        Alert.alert("Error", "Failed to update friend status.");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Network error.");
    }
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-xl font-bold mb-4">Search Friends</Text>
      <TextInput
        className="h-10 border border-gray-300 rounded-lg px-3 mb-4"
        placeholder="Search..."
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text)}
      />

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <FriendDisplay
            profilePicture={item.profilePicture || DEFAULT_PROFILE_PICTURE}
            name={item.name || "Unknown User"}
            username={item.username || "unknown"}
            option={item.friendStatus || "Friend Add"}
            onOptionPress={() => toggleFriend(item.id, item.friendStatus)}
          />
        )}
        ListEmptyComponent={() => (
          <Text className="text-center text-gray-500 mt-4">
            No users found
          </Text>
        )}
      />
    </View>
  );
};

export default FriendSearch;
