import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions, View
} from "react-native";

export default function PublicProfile() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [activePanel, setActivePanel] = useState(null);
  const togglePanel = (panel) => {
    setActivePanel(prev => prev === panel ? null : panel);
  };

  const [business, setBusiness] = useState({});
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  const certIndex = useRef(0);
  const permitIndex = useRef(0);

  const certScrollRef = useRef(null);
  const permitScrollRef = useRef(null);

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [hoverClose, setHoverClose] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const openPreview = (image) => {
    setPreviewImage(image);
    setPreviewVisible(true);
  };


  const scrollCarousel = (type, direction, length) => {
    const imageWidth = 292;

    if (type === "certificates") {
      certIndex.current =
        direction === "right"
          ? Math.min(certIndex.current + 1, length - 1)
          : Math.max(certIndex.current - 1, 0);

      certScrollRef.current?.scrollTo({
        x: certIndex.current * imageWidth,
        animated: true,
      });
    }

    if (type === "permits") {
      permitIndex.current =
        direction === "right"
          ? Math.min(permitIndex.current + 1, length - 1)
          : Math.max(permitIndex.current - 1, 0);

      permitScrollRef.current?.scrollTo({
        x: permitIndex.current * imageWidth,
        animated: true,
      });
    }
  };

  useEffect(() => {
        const fetchBusinessProfile = async () => {
          try {
            const token = await AsyncStorage.getItem("token");
  
            const res = await axios.get(
              "https://verilocalph.onrender.com/api/business/profile",
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

  let certificatesArray = [];
  try {
    certificatesArray =
      typeof business.certificates === "string"
        ? JSON.parse(business.certificates)
        : business.certificates;
  } catch {
    certificatesArray = [];
  }


  useEffect(() => {
    Animated.timing(dropdownAnim, {
      toValue: activePanel ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [activePanel]);

  const dropdownStyle = {
    opacity: dropdownAnim,
    transform: [
      {
        translateY: dropdownAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-20, 0],
        }),
      },
    ],
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View
          style={[
            styles.header,
            isMobile && {
              flexDirection: "column",
              alignItems: "center",
              padding: 18,
            },
          ]}
        >
          <Image
            source={ business.logo ? { uri: business.logo} : require("../../assets/images/placeholder.png")}
            style={[styles.avatar, 
              isMobile && {
                width: 80,
                height: 80,
              }, 
            ]}
          />

          <View
            style={[
              styles.headerText,
              isMobile && {
                marginLeft: 0,
                marginTop: 12,
                alignItems: "center",
              },
            ]}
          >
            <Text style={[styles.name, isMobile && {fontSize: 20}]}>{business.registered_business_name}</Text>
            <Text style={[styles.location, isMobile && {fontSize: 14}]}>{business.address}</Text>
          </View>
        </View>

        {/* Body */}
        <View
          style={[
            styles.details,
            isMobile && {
              flexDirection: "column",
              padding: 20,
            },
          ]}
        >
          {/* Left */}
          <View style={styles.left}>
            <DetailItem
              icon="location-outline"
              value={business.address}
            />
            <DetailItem
              icon="call-outline"
              value={business.contact_no}
            />
            <DetailItem
              icon="call-outline"
              value={business.contact_no1 || ""}
            />
            <DetailItem
              icon="mail-outline"
              value={business.email}
            />
          </View>

          {!isMobile && <View style={styles.divider} />}

          {/* Right */}
          <View
            style={[
              styles.right,
              isMobile && {
                width: "100%",
                marginTop: 130,
              },
            ]}
          >
            <View style={[styles.iconRow, isMobile && { marginTop: -50 }]}>
              <IconButton
                icon="images-outline"
                label="Certificates"
                active={activePanel === "certificates"}
                onPress={() => togglePanel("certificates")}
              />
              <IconButton
                icon="cube-outline"
                label="Permits"
                active={activePanel === "permits"}
                onPress={() => togglePanel("permits")}
              />
            </View>

            {activePanel === "permits" && (
              <Animated.View
                style={[
                  styles.dropdown,
                  dropdownStyle,
                  isMobile && {
                    position: "relative",
                  },
                ]}
              >
                <ScrollView
                  horizontal
                  pagingEnabled
                  ref={permitScrollRef}
                  showsHorizontalScrollIndicator={false}
                >
                  {business.permit && (
                    <View style={styles.imageWrapper}>
                      <Pressable onPress={() => openPreview(business.permit)}>
                        <Image
                          source={business.permit}
                          style={[
                            styles.dropdownImage,
                            isMobile && { width: width - 40, height: 220 },
                          ]}
                        />
                      </Pressable>
                    </View>
                  )}
                </ScrollView>
              </Animated.View>
            )}
            {activePanel === "certificates" && (
              <Animated.View
                style={[
                  styles.dropdown,
                  dropdownStyle,
                  isMobile && {
                    position: "relative",
                  },
                ]}
              >
                <ScrollView
                  horizontal
                  pagingEnabled
                  ref={certScrollRef}
                  showsHorizontalScrollIndicator={false}
                >
                  {certificatesArray.length > 0 ? (
                    certificatesArray.map((cert, index) => (
                      <View key={index} style={styles.imageWrapper}>
                        <Pressable onPress={() => openPreview(cert)}>
                          <Image
                            source={{ uri: cert }}
                            style={[
                              styles.dropdownImage,
                              isMobile && { width: width - 40, height: 220 },
                            ]}
                          />
                        </Pressable>
                      </View>
                    ))
                  ) : (
                    <Text>No certificates</Text>
                  )}
                </ScrollView>
              </Animated.View>
            )}
          </View>
        </View> 
      </View>
      {previewVisible && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Image
              source={
                typeof previewImage === "string"
                  ? { uri: previewImage }
                  : previewImage
              }
              style={[
                styles.modalImage,
                isMobile && { height: 220 }
              ]}
              resizeMode="contain"
            />

            {/* CLOSE BUTTON */}
            <View style={{position: "absolute", top: 0, right: 200, zIndex: 10,}}>
              <Pressable
                onHoverIn={() => setHoverClose(true)}
                onHoverOut={() => setHoverClose(false)}
                onPress={() => setPreviewVisible(false)}
                style={{
                borderWidth: 1,
                borderColor: "#000",
                backgroundColor: hoverClose
                  ? "#C0392B"
                  : "#fff",
                borderRadius: 100,
                paddingVertical: 8,
                paddingHorizontal: 12,
                
              }}
              >
              <Ionicons name="close" size={18} color="#000" />
              </Pressable>
            </View>
          </View>
        </View>
      )}
      {isLoading && (
        <View style={styles.loadingOverlay}>
            <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#5177b0" />
                <Text style={{ marginTop: 10 }}>Submitting Business...</Text>
            </View>
        </View>
    )}
    </ScrollView>
  );
}




function DetailItem({ icon, value}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={22} />
      <Text
        style={styles.input}>
        {value || ""}
        </Text>
    </View>
  );
}

function IconButton({ icon, label, onPress, active }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.iconButton, active && styles.iconButtonActive]}
    >
      <Ionicons name={icon} size={20} color={active ? "#fff" : "#111"} />
      <Text style={[styles.iconLabel, active && { color: "#fff" }]}>
        {label}
      </Text>
    </Pressable>
  );
}


const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#f3f4f6",
    minHeight: "100%",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    flex: 1,
    flexDirection: "column",
    width: "100%",
    height: "100%",
  },

  header: {
    backgroundColor: "#acbffc5d",
    padding: 32,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 200,
  },

  avatar: {
    width: 230,
    height: 230,
    borderRadius: 200,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#eee",
  },

  headerText: {
    flex: 1,
    marginLeft: 24,
  },

  name: {
    fontSize: 44,
    fontWeight: "800",
    fontFamily: 'Montserrat-Bold'
  },

  location: {
    fontSize: 22,
    color: "#444",
    marginTop: 6,
    fontFamily: 'Montserrat-Regular'
  },

  editButton: {
    flexDirection: "row",
    backgroundColor: "#466be5",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: "center",
    gap: 8,
  },

  saveButton: {
    backgroundColor: "#16a34a",
  },

  editText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: 'Montserrat-Regular'
  },

  details: {
    flexDirection: "row",
    padding: 32,
    gap: 24,
  },

  left: {
    flex: 1,
    gap: 20,
  },

  right: {
    flex: 1,
    justifyContent: "flex-start",
  },

  divider: {
    width: 1,
    backgroundColor: "#e5e7eb",
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  input: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    borderWidth: 1,
    borderColor: "#d1d5db",
  },

  inputEditable: {
    backgroundColor: "#fff",
    borderColor: "#466be5",
  },

  previewImage: {
    width: "100%",
    height: 280,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
  },

  editHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  hintText: {
    fontSize: 14,
    color: "#555",
    fontFamily: 'Montserrat-Regular'
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 12,
    marginBottom: 16,
  },

  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },

  iconButtonActive: {
    backgroundColor: "#466be5",
    borderColor: "#466be5",
  },

  iconLabel: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: 'Montserrat-Regular'
  },

  dropdown: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 12,
  },

  dropdownImage: {
    width: 280,
    height: 210,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: "#e5e7eb",
  },
  arrowLeft: {
    position: "absolute",
    top: "40%",
    left: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
  },

  arrowRight: {
    position: "absolute",
    top: "40%",
    right: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  modalContent: {
    width: "90%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
  },

  modalImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },

  closeButton: {
    position: "absolute",
    top: 0,
    right: 200,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 20,
  },

  imageWrapper: {
    position: "relative",
    width: 280,
    height: 210,
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden", 
  },

  loadingOverlay: { 
    position: "absolute", 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: "rgba(0,0,0,0.4)", 
    justifyContent: "center", 
    alignItems: "center", 
    zIndex: 9999 },

  loadingBox: { 
    backgroundColor: "#fff", 
    padding: 20, 
    borderRadius: 12, 
    alignItems: "center" },
});