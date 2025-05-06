import { Tabs } from "expo-router";
import { Image } from "react-native";
import HomeIcon from "@/assets/images/Home.png";
import HomeIconActive from "@/assets/images/Home (Clicked).png";
import FriendsIcon from "@/assets/images/Friends.png";
import FriendsIconActive from "@/assets/images/People.png";
import PostIcon from "@/assets/images/Create.png";
import PostIconActive from "@/assets/images/Create (Clicked).png";
import ChatIcon from "@/assets/images/Message.png";
import ChatIconActive from "@/assets/images/Message (Clicked).png";
import ProfileIcon from "@/assets/images/profile picture.png";
import ProfileIconActive from "@/assets/images/profile picture (clicked).png";

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
