import { ScrollView, View } from "react-native";
import PhotoSetUploader from "@/components/post/PhotoSetUploader";
import PhotoUploader from "@/components/post/PhotoUploader";

const post = () => {
  return (
    <ScrollView>
      <View className="mt-60 px-4">
        <PhotoUploader />
      </View>
    </ScrollView>
  );
};

export default post;
