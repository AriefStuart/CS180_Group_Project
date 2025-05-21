import { useState } from "react";
import { View, Text, Button, TextInput, TouchableOpacity, Image, FlatList } from "react-native";

const SAMPLE_FRIENDS = [
  {
    id: "1",
    name: "Dwight Schrute",
    image: "https://via.placeholder.com/80?text=A",
  },
  {
    id: "2",
    name: "Michael Scott",
    image: "https://via.placeholder.com/80?text=B",
  },
];

const friends = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [friendsList, setFriendsList] = useState(SAMPLE_FRIENDS);

  const handleAddFriend = () => {
    setShowSearch(true);
  };

  const handleCancel = () => {
    setShowSearch(false);
    setSearchText("");
  };

  const handleRemoveFriend = (id: string) => {
    setFriendsList((prev) => prev.filter((friend) => friend.id !== id));
  };

  return (
    <View className="flex-1 pt-10 px-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold">Friends</Text>
        <Button title="Add Friend" onPress={handleAddFriend} />
      </View>
      {showSearch && (
        <View className="mb-4 flex-row items-center">
          <TextInput
            className="flex-1 border border-gray-300 rounded px-3 py-2 mr-2"
            placeholder="Search for friends:"
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
          <TouchableOpacity onPress={handleCancel}>
            <Text className="text-blue-500 font-bold">Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={friendsList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="flex-row items-center mb-4">
            <Image
              source={{ uri: item.image }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "#e5e7eb",
                marginRight: 12,
              }}
            />
            <Text className="text-lg flex-1">{item.name}</Text>
            <TouchableOpacity onPress={() => handleRemoveFriend(item.id)}>
              <Text style={{ color: "red", fontWeight: "bold", fontSize: 18, marginLeft: 8 }}>X</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default friends;
