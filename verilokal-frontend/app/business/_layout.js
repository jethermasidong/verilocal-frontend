import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { Slot, usePathname, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
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

  const [business, setBusiness] = useState(null);
  useEffect(() => {
        const fetchBusinessProfile = async () => {
          try {
            const token = await AsyncStorage.getItem("token");
  
            const res = await axios.get(
              "http://localhost:3000/api/business/profile",
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            setBusiness(res.data);
          } catch (err) {
            console.error("Failed to load business profile:", err);
          }
        };
        fetchBusinessProfile();
      }, []);



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
              {business && business.logo ? (
                 <Image
                source={{uri: business.logo}}
                style={{width: 100, height: 100, borderRadius: 100, borderColor: '#000' ,borderWidth: 2, marginBottom: 10}}
              />
              ) : (
                <Ionicons
                  name="person-circle-outline"
                  size={100}
                  color="#000"
                />
              )}
                {business && business.registered_business_name ? (
                  <Text style={{ fontSize: 16, fontWeight: "700", fontFamily: 'Montserrat-Bold' }}>
                  {business.registered_business_name}
                  </Text>
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: "700", fontFamily: 'Montserrat-Bold' }}> Your Business </Text>
                )}
              <Text style={{ fontSize: 12, color: "#666", fontFamily: 'Montserrat-Regular' }}>
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
              <Text style={{ textAlign: "center", fontWeight: "600", fontFamily: 'Montserrat-Regular'}}>
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
                  fontFamily: 'Montserrat-Regular',
                }}
              >
                Log out
              </Text>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>

      <Slot />
    </>
  );
}
