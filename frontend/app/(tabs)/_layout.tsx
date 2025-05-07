import { Tabs } from "expo-router";
import { Image } from "react-native";
import HomeIcon from "@/assets/images/navbar/Home.png";
import HomeIconActive from "@/assets/images/navbar/Home (Clicked).png";
import FriendsIcon from "@/assets/images/navbar/Friends.png";
import FriendsIconActive from "@/assets/images/navbar/People.png";
import PostIcon from "@/assets/images/navbar/Create.png";
import PostIconActive from "@/assets/images/navbar/Create (Clicked).png";
import ChatIcon from "@/assets/images/navbar/Message.png";
import ChatIconActive from "@/assets/images/navbar/Message (Clicked).png";
import ProfileIcon from "@/assets/images/navbar/profile picture.png";
import ProfileIconActive from "@/assets/images/navbar/profile picture (clicked).png";

const _Layout = () => {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused, size }) => (
            <Image
              source={focused ? HomeIconActive : HomeIcon}
              style={{ width: size, height: size }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Friends",
          headerShown: false,
          tabBarIcon: ({ focused, size }) => (
            <Image
              source={focused ? FriendsIconActive : FriendsIcon}
              style={{ width: size, height: size }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: "Post",
          headerShown: false,
          tabBarIcon: ({ focused, size }) => (
            <Image
              source={focused ? PostIconActive : PostIcon}
              style={{ width: size, height: size }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          headerShown: false,
          tabBarIcon: ({ focused, size }) => (
            <Image
              source={focused ? ChatIconActive : ChatIcon}
              style={{ width: size, height: size }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused, size }) => (
            <Image
              source={focused ? ProfileIconActive : ProfileIcon}
              style={{ width: size, height: size }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default _Layout;
