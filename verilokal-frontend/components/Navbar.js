import { useFonts } from "expo-font";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [fontsLoaded] = useFonts({
    "Garet-Book": require("../assets/fonts/garet/Garet-Book.ttf"),
    "Garet-Heavy": require("../assets/fonts/garet/Garet-Heavy.ttf"),
    "Montserrat-Regular": require("../assets/fonts/Montserrat/static/Montserrat-Regular.ttf"),
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const links = [
    { name: "HOME", route: "/" },
    { name: "ABOUT", route: "/about" },
    { name: "CONTACT", route: "/contact" },
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(Dimensions.get("window").width < 600);
    };
    handleResize();
    Dimensions.addEventListener("change", handleResize);
    return () => Dimensions.removeEventListener("change", handleResize);
  }, []);

  if (!fontsLoaded) {
    return (
      <View>
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <>
      {/* Navbar Container */}
      <View style={styles.navbar}>
        {/* Logo */}
        <TouchableOpacity onPress={() => router.push("/")}>
          <Image
            source={require("../assets/images/verilokal_text.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Links */}
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
          </View>
        )}
      </View>

      {/* Mobile Dropdown Menu */}
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
              <Text
                style={[
                  styles.mobileText,
                  pathname === link.route && styles.activeNavText,
                ]}
              >
                {link.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Spacer to prevent content overlap */}
      <View style={{ height: 70 }} />
    </>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  logo: {
    width: 140,
    height: 30,
  },
  navLinks: {
    flexDirection: "row",
    gap: 24,
  },
  navText: {
    fontSize: 14,
    color: "#000",
    fontFamily: "Montserrat-Regular",
  },
  activeNavText: {
    color: "#d6461f",
    fontWeight: "bold",
  },
  menuIcon: {
    fontSize: 26,
    color: "#000",
  },
  mobileMenu: {
    position: "absolute",
    top: 70,
    right: 20,
    backgroundColor: "gray",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 999,
  },
  mobileLink: {
    marginVertical: 8,
  },
  mobileText: {
    fontSize: 14,
    color: "#000",
    fontFamily: "Montserrat-Regular",
  },
});
