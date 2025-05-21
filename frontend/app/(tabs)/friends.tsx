import { useState } from "react";
import { View, Text, Button, TextInput, TouchableOpacity } from "react-native";

const friends = () => 
  {
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");

  const handleAddFriend = () => 
  {
    setShowSearch(true);
  };

  const handleCancel = () => 
  {
    setShowSearch(false);
    setSearchText("");
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
            placeholder="Search for friends..."
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
          <TouchableOpacity onPress={handleCancel}>
            <Text className="text-blue-500 font-bold">Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default friends;
