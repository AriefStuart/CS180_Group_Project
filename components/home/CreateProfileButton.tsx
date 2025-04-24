import { View, Text } from "react-native";
import { Link } from "expo-router";

const ExampleComponent = () => {
  return (
    <View className="flex-1 justify-center items-center">
      <Link href="/createProfile">Create Profile</Link>
    </View>
  );
};

export default ExampleComponent;
