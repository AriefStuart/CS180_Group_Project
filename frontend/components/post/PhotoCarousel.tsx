import * as React from "react";
import { Dimensions, View, Image, TouchableOpacity, Text } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import { useState } from "react";

const width = Dimensions.get("window").width;

type PhotoCarouselProps = {
  photos: string[];
  likeCounts: number[];
  liked: boolean[];
  postIds: number[];
  onToggleLike: (photoIndex: number) => void;
};

function PhotoCarousel({
  photos,
  likeCounts,
  liked,
  postIds,
  onToggleLike,
}: PhotoCarouselProps) {
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onProgressChange = (progressValue: number) => {
    setCurrentIndex(Math.round(progressValue));
    progress.value = progressValue;
  };

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <Carousel
        ref={ref}
        width={width}
        height={width / 2}
        data={photos}
        onProgressChange={onProgressChange}
        renderItem={({ item }: { item: string }) => (
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Image
              source={{ uri: item }}
              style={{ width: "100%", height: "100%", resizeMode: "cover" }}
            />
          </View>
        )}
      />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginHorizontal: 20,
          marginTop: 10,
        }}
      >
        <TouchableOpacity onPress={() => onToggleLike(currentIndex)}>
          <Text
            style={{
              color: liked[currentIndex] ? "red" : "blue",
              fontWeight: "bold",
            }}
          >
            {liked[currentIndex] ? "Unlike" : "Like"}
          </Text>
        </TouchableOpacity>
        <Text style={{ color: "#333" }}>{likeCounts[currentIndex]} Likes</Text>
      </View>

      <Pagination.Basic
        progress={progress}
        data={photos}
        dotStyle={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 50 }}
        containerStyle={{ gap: 5, marginTop: 10 }}
        onPress={onPressPagination}
      />
    </View>
  );
}

export default PhotoCarousel;
