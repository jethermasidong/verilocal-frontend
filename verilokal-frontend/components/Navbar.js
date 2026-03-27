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
    "Montserrat-SemiBold": require("../assets/fonts/Montserrat/static/Montserrat-SemiBold.ttf"),
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateLayout = () => {
      setIsMobile(Dimensions.get("window").width < 640);
    };
    updateLayout();
    const sub = Dimensions.addEventListener("change", updateLayout);
    return () => sub?.remove?.();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <>
      <View style={styles.navbarWrapper}>
        <View style={styles.navbar}>
  
          <TouchableOpacity style={styles.logoContainer}>
            <Image
              source={require("../assets/images/verilokal_text.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
          {isMobile ? (
            <TouchableOpacity
              onPress={() => setMenuOpen(!menuOpen)}
              style={styles.menuButton}
            >
              <View style={styles.menuLine} />
              <View style={[styles.menuLine, menuOpen && { opacity: 0 }]} />
              <View style={styles.menuLine} />
            </TouchableOpacity>
          ) : (
            <View style={styles.navLinks}>
              {links.map((link) => {
                const isActive = pathname === link.route;
                return (
                  <TouchableOpacity
                    key={link.route}
                    onPress={() => router.push(link.route)}
                    style={[styles.navItem, isActive && styles.navItemActive]}
                  >
                    <Text
                      style={[
                        styles.navText,
                        isActive && styles.activeNavText,
                      ]}
                    >
                      {link.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {/* PROFILE BUTTON */}
              {showProfile && (
                <TouchableOpacity
                  onPress={onProfilePress}
                  style={styles.profileButton}
                >
                  <Ionicons
                    name="person-circle-outline"
                    size={26}
                    color="#5177b0"
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      {/* MOBILE DROPDOWN MENU */}
      {menuOpen && isMobile && (
        <View style={styles.mobileMenu}>
          {links.map((link) => {
            const isActive = pathname === link.route;
            return (
              <TouchableOpacity
                key={link.route}
                onPress={() => {
                  router.push(link.route);
                  setMenuOpen(false);
                }}
                style={[
                  styles.mobileLink,
                  isActive && styles.mobileLinkActive,
                ]}
              >
                <Text
                  style={[
                    styles.mobileText,
                    isActive && styles.mobileTextActive,
                  ]}
                >
                  {link.name}
                </Text>
              </TouchableOpacity>
            );
          })}

          {showProfile && (
            <TouchableOpacity
              onPress={() => {
                onProfilePress();
                setMenuOpen(false);
              }}
              style={styles.mobileLink}
            >
              <View style={styles.mobileProfileRow}>
                <Ionicons
                  name="person-circle-outline"
                  size={18}
                  color="#5177b0"
                />
                <Text style={[styles.mobileText, { marginLeft: 8 }]}>
                  PROFILE
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  navbarWrapper: {
    position: "absolute",
    width: "100%",
    top: 16,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
    width: "100%",
    maxWidth: 900,
    borderWidth: 1,
    borderColor: "rgba(200, 210, 230, 0.6)",
    shadowColor: "#1a2f5a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 12,
  },

  logoContainer: {
    paddingVertical: 2,
  },
  logo: {
    width: 130,
    height: 28,
  },
  navLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  navItem: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 50,
  },
  navItemActive: {
    backgroundColor: "rgba(81, 119, 176, 0.12)",
  },
  navText: {
    fontSize: 13,
    color: "#374151",
    fontFamily: "Montserrat-Regular",
    letterSpacing: 0.3,
  },
  activeNavText: {
    color: "#5177b0",
    fontFamily: "Montserrat-SemiBold",
  },
  profileButton: {
    marginLeft: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(81,119,176,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  menuButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  menuLine: {
    width: 22,
    height: 2,
    backgroundColor: "#374151",
    borderRadius: 2,
  },

  mobileMenu: {
    position: "absolute",
    top: 78,
    left: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.97)",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 8,
    zIndex: 999,
    borderWidth: 1,
    borderColor: "rgba(200, 210, 230, 0.5)",
    shadowColor: "#1a2f5a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 14,
  },
  mobileLink: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  mobileLinkActive: {
    backgroundColor: "rgba(81, 119, 176, 0.10)",
  },
  mobileText: {
    fontSize: 13,
    fontFamily: "Montserrat-Regular",
    color: "#374151",
    letterSpacing: 0.4,
  },
  mobileTextActive: {
    color: "#5177b0",
    fontFamily: "Montserrat-SemiBold",
  },
  mobileProfileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});