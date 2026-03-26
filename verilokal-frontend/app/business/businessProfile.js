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
  TextInput, useWindowDimensions, View
} from "react-native";

export default function BusinessProfile() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [isEditing, setIsEditing] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const togglePanel = (panel) => {
    setActivePanel(prev => prev === panel ? null : panel);
  };

  const [business, setBusiness] = useState({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  const certIndex = useRef(0);
  const permitIndex = useRef(0);

  const [showCertificates, setShowCertificates] = useState(true);

  const certScrollRef = useRef(null);
  const permitScrollRef = useRef(null);

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [hoverClose, setHoverClose] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [activeCertIndex, setActiveCertIndex] = useState(0);

  const openPreview = (image) => {
    setPreviewImage(image);
    setPreviewVisible(true);
  };

  const handleChange = (field, value) => {
    setBusiness((prev) => ({...prev, [field]: value}));
  };

  const handleSave = async () => {
    try {
        setIsLoading(true);
        const token = await AsyncStorage.getItem("token");
        await axios.put(
            `https://verilocalph.onrender.com/api/business/${business.id}`,
            {
                name: business.name,
                address: business.address,
                registered_business_name: business.registered_business_name,
                description: business.description,
                contact_no: business.contact_no,
                contact_no1: business.contact_no1,
                social_link: business.social_link,
                logo: business.logo,
                show_certificates: showCertificates,
            },
            {headers: {Authorization: `Bearer ${token}`}}
        );
        console.log("Business updated successfully!");
        setIsEditing(false);

    } catch (err) {
        console.error("Failed to update business", err);
    } finally {
        setIsLoading(false);
    }
  };

  const scrollCarousel = (type, direction, length) => {
    const imageWidth = 292;

    if (type === "certificates") {
      certIndex.current =
        direction === "right"
          ? Math.min(certIndex.current + 1, length - 1)
          : Math.max(certIndex.current - 1, 0);
      
      setActiveCertIndex(certIndex.current);

      certScrollRef.current?.scrollTo({
        x: certIndex.current * imageWidth,
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
            setShowCertificates(res.data.show_certificates);
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
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: isEditing ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: isEditing ? 0 : 30,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isEditing]);

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
            <Text style={[styles.location, isMobile && {fontSize: 14, textAlign: isMobile ?"center" : "left"}]}>{business.address}</Text>
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>

            {isEditing ? (
              <>
                <Pressable
                  style={[
                    styles.editButton,
                    styles.saveButton,
                    isMobile && { marginTop: 16, paddingVertical: 8, paddingHorizontal: 12 },
                  ]}
                  onPress={handleSave}
                >
                  <Ionicons name="checkmark" size={isMobile ? 14 : 18} color="#fff" />  
                  <Text style={styles.editText}>Save</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.editButton,
                    styles.cancelButton,
                    isMobile && { marginTop: 16, paddingVertical: 8, paddingHorizontal: 12 },
                  ]}
                  onPress={() => setIsEditing(false)}
                >
                  <Ionicons name="close" size={isMobile ? 14 : 18} color="#fff" />
                  <Text style={styles.editText}>Cancel</Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                style={[
                  styles.editButton,
                  isMobile && { marginTop: 16, paddingVertical: 8, paddingHorizontal: 12 },
                ]}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="pencil" size={isMobile ? 14 : 18} color="#fff" />
                <Text style={styles.editText}>Edit Profile</Text>
              </Pressable>
            )}

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
              editable={isEditing}
              maxLength={100}
              onChangeText={(text) => handleChange("address", text)}
            />
            <DetailItem
              icon="call-outline"
              value={business.contact_no}
              editable={isEditing}
              maxLength={11}
              keyboardType="numeric"
              onChangeText={(text) => handleChange("contact_no", text)}
            />
            <DetailItem
              icon="call-outline"
              value={business.contact_no1 || ""}
              placeholder="Second phone number"
              keyboardType="numeric"
              maxLength={11}
              editable={isEditing}
              onChangeText={(text) => handleChange("contact_no1", text)}
            />
            <DetailItem
              icon="mail-outline"
              value={business.email}
              editable={isEditing}
              maxLength={40}
              onChangeText={(text) => handleChange("email", text)}
            />
            <DetailItem
              icon="link-outline"
              value={business.social_link}
              editable={isEditing}
              maxLength={40}
              placeholder="(Facebook, Instagram, Official Business Website)"
              onChangeText={(text) => handleChange("social_link", text)}
            />
            <DetailItem
              icon="information-outline"
              value={business.description}
              editable={isEditing}
              multiline={true}
              placeholder="Describe what your business do."
              onChangeText={(text) => handleChange("description", text)}
            />

            {isMobile && (
              <>
                <View style={[styles.iconRow]}>
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
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingBottom: 10, paddingTop: 10}}>
                      <Pressable disable={!isEditing} onPress={() => setShowCertificates(prev => !prev)}>
                        <Ionicons
                          name={showCertificates ? "checkbox" : "square-outline"}
                          size={22}
                          color={isEditing ? "#466be5" : "aaa"}
                        />
                      </Pressable>
                      <Text style={{fontFamily: 'Montserrat-Regular', fontSize: 12}}>Show Certificates Publicly</Text>
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
                            source={{ uri: business.permit }}
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
                <View style={{position: "relative",}}>
                  <ScrollView
                    horizontal
                    pagingEnabled
                    ref={certScrollRef}
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(event) => {
                      const slide = Math.round(event.nativeEvent.contentOffset.x / 292);
                      setActiveCertIndex(slide);
                    }}
                  >
                      {certificatesArray.map((cert, index) => (
                        <View key={index} style={[styles.imageWrapper, isMobile && {height: 190}]}>
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
                              scrollCarousel("certificates", "left", certificatesArray.length)
                            }
                          >
                            <Ionicons name="chevron-back" size={24} color="#fff" />
                          </Pressable>

                          <Pressable
                            style={styles.arrowRight}
                            onPress={() =>
                              scrollCarousel("certificates", "right", certificatesArray.length)
                            }
                          >
                            <Ionicons name="chevron-forward" size={24} color="#fff" />
                          </Pressable>
                        </>
                      )}
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingBottom: 10, paddingTop: 10}}>
                      <Pressable disabled={!isEditing} onPress={() => setShowCertificates(prev => !prev)}>
                        <Ionicons
                          name={showCertificates ? "checkbox" : "square-outline"}
                          size={22}
                          color={isEditing ? "#466be5" : "aaa"}
                        />
                      </Pressable>
                      <Text style={{fontFamily: 'Montserrat-Regular', fontSize: 12}}>Show Certificates Publicly</Text>
                    </View>
                </Animated.View>
              )}
            </View>
          )}
        </View>
        

        {/* Edit Hint */}
        <Animated.View
          style={[
            styles.editHint,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Ionicons name="information-circle-outline" size={18} />
          <Text style={styles.hintText}>
            Editing mode enabled — don’t forget to save
          </Text>
        </Animated.View>
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
            <View style={{position: "absolute", top: isMobile ? 330 : 0, right: isMobile ? 0 : 100, zIndex: 10,}}>
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
                <Text style={{ marginTop: 10 }}>Saving Profile...</Text>
            </View>
        </View>
    )}
    </ScrollView>
  );
}




function DetailItem({ icon, value, placeholder, editable, onChangeText, keyboardType, maxLength, multiline}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={22} />
      <TextInput
        value={value || ""}
        placeholder={placeholder}
        editable={editable}
        multiline={multiline}
        maxLength={maxLength}
        onChangeText={(t) =>
          onChangeText(keyboardType === "numeric" ? t.replace(/[^0-9]/g, "") : t)
        }
        style={[styles.input, editable && styles.inputEditable, multiline && styles.textArea]}
      />
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

  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
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
    paddingTop: 10,
    paddingBottom: 10,
  },

  headerText: {
    flex: 1,
    marginLeft: 24,
  },

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#cbd5e1",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#466be5",
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

  cancelButton: {
    backgroundColor: "#ef4444",
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
    alignItems: "flex-start",
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
    textAlignVertical: "top",
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
    alignItems: "center" 
  },
  closeBtn : {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});