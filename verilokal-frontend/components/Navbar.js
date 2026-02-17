import { useFonts } from "expo-font";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Navbar({ links, showProfile, onProfilePress }) {
  const router = useRouter();
  const pathname = usePathname();

  const [fontsLoaded] = useFonts({
    "Garet-Book": require("../assets/fonts/garet/Garet-Book.ttf"),
    "Garet-Heavy": require("../assets/fonts/garet/Garet-Heavy.ttf"),
    "Montserrat-Regular": require("../assets/fonts/Montserrat/static/Montserrat-Regular.ttf"),
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateLayout = () => {
      setIsMobile(Dimensions.get("window").width < 600);
    };
    updateLayout();
    Dimensions.addEventListener("change", updateLayout);
    return () =>
      Dimensions.removeEventListener("change", updateLayout);
  }, []);

  if (!fontsLoaded) return null;

  return (
    <>
      <View style={styles.navbar}>
        {/* LOGO */}
        <TouchableOpacity onPress={() => router.push("/")}>
          <Image
            source={require("../assets/images/verilokal_text.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* LINKS */}
        {isMobile ? (
          <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.navLinks}>
            {links.map((link) => (
              <TouchableOpacity
                key={link.route}
                onPress={() => router.push(link.route)}
              >
                <Text
                  style={[
                    styles.navText,
                    pathname === link.route && styles.activeNavText,
                  ]}
                >
                  {link.name}
                </Text>
              </TouchableOpacity>
            ))}

            {/* PROFILE BUTTON */}
            {showProfile && (
              <TouchableOpacity
                onPress={onProfilePress}
                style={{ marginLeft: 5 }}
              >
                <Ionicons
                  name="person-circle-outline"
                  size={30}
                  color="#000"
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* MOBILE MENU */}
      {menuOpen && isMobile && (
        <View style={styles.mobileMenu}>
          {links.map((link) => (
            <TouchableOpacity
              key={link.route}
              onPress={() => {
                router.push(link.route);
                setMenuOpen(false);
              }}
              style={styles.mobileLink}
            >
              <Text style={styles.mobileText}>{link.name}</Text>
            </TouchableOpacity>
          ))}

          {showProfile && (
            <TouchableOpacity
              onPress={() => {
                onProfilePress();
                setMenuOpen(false);
              }}
              style={styles.mobileLink}
            >
              <Text style={styles.mobileText}>
                PROFILE
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 19,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 5,
  },
  logo: {
    width: 140,
    height: 30,
  },
  navLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  navText: {
    fontSize: 14,
    color: "#000",
    fontFamily: "Montserrat-Regular",
  },
  activeNavText: {
    color: "#5177b0",
    fontWeight: "700",
  },
  menuIcon: {
    fontSize: 26,
  },
  mobileMenu: {
    position: "absolute",
    top: 70,
    right: 20,
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    zIndex: 999,
  },
  mobileLink: {
    marginVertical: 8,
  },
  mobileText: {
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
  },
});
