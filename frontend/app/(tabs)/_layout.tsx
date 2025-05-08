import { Tabs } from "expo-router";
import { Image } from "react-native";
import { navbarIcons } from "@/data/navbarIcons";

const _Layout = () => {
  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused, size }) => (
            <Image
              source={
                focused ? navbarIcons.HomeIconActive : navbarIcons.HomeIcon
              }
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
              source={
                focused
                  ? navbarIcons.FriendsIconActive
                  : navbarIcons.FriendsIcon
              }
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
              source={
                focused ? navbarIcons.PostIconActive : navbarIcons.PostIcon
              }
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
              source={
                focused ? navbarIcons.ChatIconActive : navbarIcons.ChatIcon
              }
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
              source={
                focused
                  ? navbarIcons.ProfileIconActive
                  : navbarIcons.ProfileIcon
              }
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
