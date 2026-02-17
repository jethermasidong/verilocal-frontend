import { Slot, usePathname, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  View,
  Text,
  Image,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Navbar from "../../components/Navbar";

export default function BusinessLayout() {
  const pathname = usePathname();
  const router = useRouter();

  const allowedPages = [
    "/business",
    "/business/businessProfile",
    "/business/productRegistration",
  ];

  const showProfile = allowedPages.includes(pathname);

  // Sidebar state
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const slideX = useRef(new Animated.Value(300)).current;

  // OPEN SIDEBAR
  const openSidebar = () => {
    setSidebarVisible(true);
    Animated.timing(slideX, {
      toValue: 0,
      duration: 380,
      useNativeDriver: true,
    }).start();
  };

  // CLOSE SIDEBAR
  const closeSidebar = () => {
    Animated.timing(slideX, {
      toValue: 300,
      duration: 380,
      useNativeDriver: true,
    }).start(() => {
      setSidebarVisible(false);
    });
  };

  // TOGGLE NAVBAR BUTTON
  const toggleSidebar = () => {
    if (sidebarVisible) {
      closeSidebar();
    } else {
      openSidebar();
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <Navbar
        links={[{ name: "DASHBOARD", route: "/business" }]}
        showProfile={showProfile}
        onProfilePress={toggleSidebar}
      />

      {/* BUSINESS PROFILE SIDEBAR */}
      <Modal visible={sidebarVisible} transparent animationType="none">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
          onPress={closeSidebar}
        >
          <Animated.View
            style={{
              width: 280,
              height: 600,
              backgroundColor: "#fff",
              padding: 20,
              borderTopLeftRadius: 16,
              borderBottomLeftRadius: 16,
              marginTop: 170,
              transform: [{ translateX: slideX }],
            }}
          >
            {/* PROFILE */}
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <Ionicons
                name="person-circle-outline"
                size={60}
                color="#000"
              />
              <Text style={{ fontSize: 16, fontWeight: "700" }}>
                Your Business
              </Text>
              <Text style={{ fontSize: 12, color: "#666" }}>
                Business Account
              </Text>
            </View>

            {/* ACTIONS */}
            <Pressable
              style={{
                borderWidth: 1,
                borderRadius: 10,
                paddingVertical: 12,
                marginBottom: 10,
              }}
              onPress={() => {
                closeSidebar();
                router.push("/business/businessProfile");
              }}
            >
              <Text style={{ textAlign: "center", fontWeight: "600" }}>
                Manage Account
              </Text>
            </Pressable>

            <Pressable
              style={{
                backgroundColor: "#000",
                borderRadius: 10,
                paddingVertical: 12,
              }}
              onPress={async () => {
                await AsyncStorage.clear();
                router.replace("/login-business");
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  textAlign: "center",
                  fontWeight: "700",
                }}
              >
                Logout
              </Text>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>

      <Slot />
    </>
  );
}
