import AllPosts from "@/components/home/AllPosts";
import PhotoCarousel from "@/components/post/PhotoCarousel";

export default function Home() {
  return (
    <>
      {/* <PhotoCarousel photos={["https://picsum.photos/id/1/800/800", "https://picsum.photos/id/2/800/800"]} /> */}
      <AllPosts />
    </>
  );
}
