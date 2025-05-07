import { ScrollView, View } from "react-native";
import PhotoSetUploader from "@/components/post/PhotoSetUploader";

const post = () => {
  return (
    <ScrollView>
      <View className="mt-60 px-4">
        <PhotoSetUploader />
      </View>
    </ScrollView>
  );
};

export default post;
