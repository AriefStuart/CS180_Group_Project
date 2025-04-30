import ProfileTop from "@/components/profile/ProfileTop";
// Allow for upoading files into profile
import PhotoSetUploader from "@/components/profile/PhotoSetUploader";
import { ScrollView, View } from "react-native";

const profile = () => {
  return (
    <ScrollView>
      <ProfileTop />
      <View className="mt-6 px-4">
        <PhotoSetUploader />
      </View>
    </ScrollView>
  );
};

export default profile;
