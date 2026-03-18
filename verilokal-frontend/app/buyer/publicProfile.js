import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
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

  const {business_id}= useLocalSearchParams();

  const [activePanel, setActivePanel] = useState(null);
  const [renderedPanel, setRenderedPanel] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const togglePanel = (panel) => {
    if (isAnimating) return;

    setIsAnimating(true);

    if (activePanel === panel) {
      // 🔻 closing same panel
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setActivePanel(null);
        setIsAnimating(false);
      });

    } else if (activePanel) {
      // 🔁 switching panels (THIS IS YOUR BUG CASE)
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(() => {
        setActivePanel(panel); 

        Animated.timing(dropdownAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }).start(() => setIsAnimating(false));
      });

    } else {
      setActivePanel(panel);

      Animated.timing(dropdownAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start(() => setIsAnimating(false));
    }
  };

  const [business, setBusiness] = useState({});
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  const [activeCertIndex, setActiveCertIndex] = useState(0);

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
    let newIndex = activeCertIndex;

    if (direction === "left") {
      newIndex = Math.max(0, activeCertIndex - 1);
    } else {
      newIndex = Math.min(length - 1, activeCertIndex + 1);
    }

    setActiveCertIndex(newIndex);

    certScrollRef.current?.scrollTo({
      x: newIndex * 292,
      animated: true,
    });
  };

  useEffect(() => {
    const fetchBusinessProfile = async () => {
      try {
        setIsLoading(true);
        
        const res = await axios.get(
            `https://verilocalph.onrender.com/api/business/public/${business_id}`,
        );
        setBusiness(res.data);
      } catch (err) {
        console.error("Failed to load business profile:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (business_id) fetchBusinessProfile();
  }, [business_id]);

  let certificatesArray = [];
  try {
    certificatesArray =
      typeof business.certificates === "string"
        ? JSON.parse(business.certificates)
        : business.certificates;
  } catch {
    certificatesArray = [];
  }

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
                marginTop: 12,
                alignItems: "center",
              },
            ]}
          >
            <Text style={[styles.name, isMobile && {fontSize: 20}]}>{business.registered_business_name}</Text>
            <Text style={[styles.location, isMobile && {fontSize: 14, textAlign: isMobile ? "center" : "left"}]}>{business.address}</Text>
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
          <View style={[styles.left, isMobile && { gap : 16 }]}>
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
            <DetailItem
              icon="link-outline"
              value={business.social_link}
            />
            <DetailItem
              icon="information-outline"
              value={business.description}
              multiline={true}
            />

            {isMobile && (
              <>
                <View style={styles.iconRow}>
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

                <View style={styles.previewNote}>
                  <Ionicons name="eye-outline" size={22} color={"#466be5"} />
                  <Text style={styles.previewText}>
                    Click on the image to Preview
                  </Text>
                </View>

                {activePanel === "permits" && (
                  <Animated.View style={[styles.dropdown, dropdownStyle]}>
                    <ScrollView horizontal pagingEnabled ref={permitScrollRef}>
                      {business.permit && (
                        <Pressable onPress={() => openPreview(business.permit)}>
                          <Image
                            source={{ uri: business.permit }}
                            style={{ width: width - 40, height: 220 }}
                          />
                        </Pressable>
                      )}
                    </ScrollView>
                  </Animated.View>
                )}

                {activePanel === "certificates" && (
                  <Animated.View style={[styles.dropdown, dropdownStyle]}>
                    <ScrollView
                      horizontal
                      pagingEnabled
                      ref={certScrollRef}
                      onMomentumScrollEnd={(event) => {
                        const slide = Math.round(
                          event.nativeEvent.contentOffset.x / 292
                        );
                        setActiveCertIndex(slide);
                      }}
                    >
                      {certificatesArray.map((cert, index) => (
                        <Pressable key={index} onPress={() => openPreview(cert)}>
                          <Image
                            source={{ uri: cert }}
                            style={{ width: width - 50, height: 220 }}
                          />
                        </Pressable>
                      ))}
                    </ScrollView>

                    <View style={styles.pagination}>
                      {certificatesArray.map((_, index) => (
                        <View
                          key={index}
                          style={[
                            styles.dot,
                            activeCertIndex === index && styles.activeDot,
                          ]}
                        />
                      ))}
                    </View>
                  </Animated.View>
                )}
              </>
            )}
          </View>

          {!isMobile && <View style={styles.divider} />}

          {/* Right */}
          {!isMobile && (
            <View style={styles.right}>
              <View style={[styles.iconRow, isMobile && { marginTop: 15 }]}>
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
              <View style={styles.previewNote}>
                <Ionicons name="eye-outline" size={22} color={"#466be5"} />
                <Text style={styles.previewText}>
                Click on the image to Preview
                </Text>
              </View>

              {activePanel === "permits" && (
                <Animated.View
                  style={[
                    styles.dropdown,
                    dropdownStyle,
                    isMobile && {
                      marginTop: 15,
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
                            source={{uri: business.permit}}
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
                      marginTop: 15,
                    },
                  ]}
                >
                  <View style={{ position: "relative" }}>
                    <ScrollView
                      horizontal
                      pagingEnabled
                      ref={certScrollRef}
                      showsHorizontalScrollIndicator={false}
                      onMomentumScrollEnd={(event) => {
                        const slide = Math.round(
                          event.nativeEvent.contentOffset.x / 292
                        );
                        setActiveCertIndex(slide);
                      }}
                    >
                      {certificatesArray.map((cert, index) => (
                        <View
                          key={index}
                          style={[styles.imageWrapper, isMobile && { height: 190 }]}
                        >
                          <Pressable onPress={() => openPreview(cert)}>
                            <Image
                              source={{ uri: cert }}
                              style={[
                                styles.dropdownImage,
                                isMobile && { width: width - 50, height: 220 },
                              ]}
                            />
                          </Pressable>
                        </View>
                      ))}
                    </ScrollView>

                    <View style={styles.pagination}>
                      {certificatesArray.map((_, index) => (
                        <View
                          key={index}
                          style={[
                            styles.dot,
                            activeCertIndex === index && styles.activeDot,
                          ]}
                        />
                      ))}
                    </View>

                    {!isMobile && (
                      <>
                        <Pressable
                          style={styles.arrowLeft}
                          onPress={() =>
                            scrollCarousel(
                              "certificates",
                              "left",
                              certificatesArray.length
                            )
                          }
                        >
                          <Ionicons name="chevron-back" size={24} color="#fff" />
                        </Pressable>

                        <Pressable
                          style={styles.arrowRight}
                          onPress={() =>
                            scrollCarousel(
                              "certificates",
                              "right",
                              certificatesArray.length
                            )
                          }
                        >
                          <Ionicons name="chevron-forward" size={24} color="#fff" />
                        </Pressable>
                      </>
                    )}
                  </View>
                </Animated.View>
              )}
            </View>
          )}
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
            <View style={{position: "absolute", top: isMobile ? 300 : 0, right: isMobile ? 0 : 100, zIndex: 10,}}>
              <Pressable
                onHoverIn={() => setHoverClose(true)}
                onHoverOut={() => setHoverClose(false)}
                onPress={() => setPreviewVisible(false)}
                style={[styles.closeBtn,{backgroundColor: hoverClose ? "#C0392B" : "#fff",}]}
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
                <Text style={{ marginTop: 10 }}>Loading Business Profile.....</Text>
            </View>
        </View>
    )}
    </ScrollView>
  );
}




function DetailItem({ icon, value, multiline}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={22} />
      <Text style={[styles.input, multiline && styles.textArea]}>
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

  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },

  saveButton: {
    backgroundColor: "#16a34a",
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

  previewImage: {
    width: "100%",
    height: 280,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
  },

  iconRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 12,
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
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ccc",
    marginHorizontal: 3,
  },

  activeDot: {
    backgroundColor: "#333",
  },

  arrowLeft: {
    position: "absolute",
    left: 5,
    top: "45%",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 5,
  },

  arrowRight: {
    position: "absolute",
    right: 5,
    top: "45%",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 5,
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

  closeBtn : {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 12,
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
    alignItems: "center" 
  },
  previewText: {  
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: "#466be5",
  },
  previewNote: {
    flexDirection: "row", 
    gap: 6, 
    alignItems: "center", 
    marginLeft: 10,
    marginVertical: 10,
  },
  
});