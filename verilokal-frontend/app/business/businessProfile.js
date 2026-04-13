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
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

export default function BusinessProfile() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [isEditing, setIsEditing] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const togglePanel = (panel) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
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
    setBusiness((prev) => ({ ...prev, [field]: value }));
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
        { headers: { Authorization: `Bearer ${token}` } },
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
          },
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
        <View style={styles.headerBanner} />

        <View style={[styles.header, isMobile && styles.headerMobile]}>
          <View style={styles.avatarWrapper}>
            <Image
              source={
                business.logo
                  ? { uri: business.logo }
                  : require("../../assets/images/placeholder.png")
              }
              style={[styles.avatar, isMobile && styles.avatarMobile]}
            />
          </View>

          <View
            style={[styles.headerText, isMobile && styles.headerTextMobile]}
          >
            <Text style={[styles.name, isMobile && styles.nameMobile]}>
              {business.registered_business_name}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#8A8A9A" />
              <Text style={[styles.location, isMobile && { fontSize: 12 }]}>
                {business.address}
              </Text>
            </View>
          </View>

          <View style={[styles.headerActions, isMobile && { marginTop: 14 }]}>
            {isEditing ? (
              <>
                <Pressable
                  style={[styles.btn, styles.btnSave, isMobile && styles.btnSm]}
                  onPress={handleSave}
                >
                  <Ionicons
                    name="checkmark"
                    size={isMobile ? 13 : 15}
                    color="#fff"
                  />
                  <Text style={styles.btnText}>Save</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.btn,
                    styles.btnCancel,
                    isMobile && styles.btnSm,
                  ]}
                  onPress={() => setIsEditing(false)}
                >
                  <Ionicons
                    name="close"
                    size={isMobile ? 13 : 15}
                    color="#fff"
                  />
                  <Text style={styles.btnText}>Cancel</Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                style={[styles.btn, styles.btnEdit, isMobile && styles.btnSm]}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons
                  name="pencil-outline"
                  size={isMobile ? 13 : 15}
                  color="#3B5BDB"
                />
                <Text style={[styles.btnText, { color: "#3B5BDB" }]}>
                  Edit Profile
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.headerRule} />

        <View style={[styles.details, isMobile && styles.detailsMobile]}>
          <View style={[styles.left, isMobile && { gap: 14 }]}>
            <Text style={styles.sectionLabel}>Business Details</Text>

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
              placeholder="Facebook, Instagram, Website…"
              onChangeText={(text) => handleChange("social_link", text)}
            />
            <DetailItem
              icon="reader-outline"
              value={business.description}
              editable={isEditing}
              multiline={true}
              placeholder="Describe what your business does."
              onChangeText={(text) => handleChange("description", text)}
            />

            {isMobile && (
              <>
                <Text style={[styles.sectionLabel, { marginTop: 8 }]}>
                  Documents
                </Text>
                <View style={styles.iconRow}>
                  <IconButton
                    icon="images-outline"
                    label="Certificates"
                    active={activePanel === "certificates"}
                    onPress={() => togglePanel("certificates")}
                  />
                  <IconButton
                    icon="document-outline"
                    label="Permits"
                    active={activePanel === "permits"}
                    onPress={() => togglePanel("permits")}
                  />
                </View>

                <View style={styles.previewNote}>
                  <Ionicons name="eye-outline" size={14} color="#3B5BDB" />
                  <Text style={styles.previewText}>Tap image to preview</Text>
                </View>

                {activePanel === "permits" && (
                  <Animated.View style={[styles.dropdown, dropdownStyle]}>
                    <ScrollView horizontal pagingEnabled ref={permitScrollRef}>
                      {business.permit && (
                        <Pressable onPress={() => openPreview(business.permit)}>
                          <Image
                            source={{ uri: business.permit }}
                            style={{
                              width: width - 40,
                              height: 220,
                              borderRadius: 12,
                            }}
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
                          event.nativeEvent.contentOffset.x / 292,
                        );
                        setActiveCertIndex(slide);
                      }}
                    >
                      {certificatesArray.map((cert, index) => (
                        <Pressable
                          key={index}
                          onPress={() => openPreview(cert)}
                        >
                          <Image
                            source={{ uri: cert }}
                            style={{
                              width: width - 50,
                              height: 220,
                              borderRadius: 12,
                            }}
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
                    <View style={styles.checkRow}>
                      <Pressable
                        disable={!isEditing}
                        onPress={() => setShowCertificates((prev) => !prev)}
                      >
                        <Ionicons
                          name={
                            showCertificates ? "checkbox" : "square-outline"
                          }
                          size={20}
                          color={isEditing ? "#3B5BDB" : "#ccc"}
                        />
                      </Pressable>
                      <Text style={styles.checkLabel}>
                        Show Certificates Publicly
                      </Text>
                    </View>
                  </Animated.View>
                )}
              </>
            )}
          </View>

          {!isMobile && <View style={styles.divider} />}

          {!isMobile && (
            <View style={styles.right}>
              <Text style={styles.sectionLabel}>Documents</Text>

              <View style={[styles.iconRow, { marginTop: 14 }]}>
                <IconButton
                  icon="images-outline"
                  label="Certificates"
                  active={activePanel === "certificates"}
                  onPress={() => togglePanel("certificates")}
                />
                <IconButton
                  icon="document-outline"
                  label="Permits"
                  active={activePanel === "permits"}
                  onPress={() => togglePanel("permits")}
                />
              </View>

              <View style={styles.previewNote}>
                <Ionicons name="eye-outline" size={14} color="#3B5BDB" />
                <Text style={styles.previewText}>Click image to preview</Text>
              </View>

              {activePanel === "permits" && (
                <Animated.View style={[styles.dropdown, dropdownStyle]}>
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
                            style={styles.dropdownImage}
                          />
                        </Pressable>
                      </View>
                    )}
                  </ScrollView>
                </Animated.View>
              )}

              {activePanel === "certificates" && (
                <Animated.View style={[styles.dropdown, dropdownStyle]}>
                  <View style={{ position: "relative" }}>
                    <ScrollView
                      horizontal
                      pagingEnabled
                      ref={certScrollRef}
                      showsHorizontalScrollIndicator={false}
                      onMomentumScrollEnd={(event) => {
                        const slide = Math.round(
                          event.nativeEvent.contentOffset.x / 292,
                        );
                        setActiveCertIndex(slide);
                      }}
                    >
                      {certificatesArray.map((cert, index) => (
                        <View key={index} style={styles.imageWrapper}>
                          <Pressable onPress={() => openPreview(cert)}>
                            <Image
                              source={{ uri: cert }}
                              style={styles.dropdownImage}
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

                    <Pressable
                      style={styles.arrowLeft}
                      onPress={() =>
                        scrollCarousel(
                          "certificates",
                          "left",
                          certificatesArray.length,
                        )
                      }
                    >
                      <Ionicons name="chevron-back" size={18} color="#fff" />
                    </Pressable>
                    <Pressable
                      style={styles.arrowRight}
                      onPress={() =>
                        scrollCarousel(
                          "certificates",
                          "right",
                          certificatesArray.length,
                        )
                      }
                    >
                      <Ionicons name="chevron-forward" size={18} color="#fff" />
                    </Pressable>
                  </View>

                  <View style={styles.checkRow}>
                    <Pressable
                      disabled={!isEditing}
                      onPress={() => setShowCertificates((prev) => !prev)}
                    >
                      <Ionicons
                        name={showCertificates ? "checkbox" : "square-outline"}
                        size={20}
                        color={isEditing ? "#3B5BDB" : "#ccc"}
                      />
                    </Pressable>
                    <Text style={styles.checkLabel}>
                      Show Certificates Publicly
                    </Text>
                  </View>
                </Animated.View>
              )}
            </View>
          )}
        </View>

        <Animated.View
          style={[
            styles.editHint,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Ionicons
            name="information-circle-outline"
            size={15}
            color="#3B5BDB"
          />
          <Text style={styles.hintText}>
            Editing mode — remember to save your changes
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
              style={[styles.modalImage, isMobile && { height: 220 }]}
              resizeMode="contain"
            />
            <View
              style={{
                position: "absolute",
                top: isMobile ? 330 : 0,
                right: isMobile ? 0 : 100,
                zIndex: 10,
              }}
            >
              <Pressable
                onHoverIn={() => setHoverClose(true)}
                onHoverOut={() => setHoverClose(false)}
                onPress={() => setPreviewVisible(false)}
                style={[
                  styles.closeBtn,
                  {
                    backgroundColor: hoverClose
                      ? "#e53e3e"
                      : "rgba(255,255,255,0.12)",
                  },
                ]}
              >
                <Ionicons name="close" size={16} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#3B5BDB" />
            <Text style={styles.loadingText}>Saving Profile…</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function DetailItem({
  icon,
  value,
  placeholder,
  editable,
  onChangeText,
  keyboardType,
  maxLength,
  multiline,
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIconWrap}>
        <Ionicons
          name={icon}
          size={16}
          color={editable ? "#3B5BDB" : "#9CA3AF"}
        />
      </View>
      <TextInput
        value={value || ""}
        placeholder={placeholder || "—"}
        placeholderTextColor="#C4C4CF"
        editable={editable}
        multiline={multiline}
        maxLength={maxLength}
        onChangeText={(t) =>
          onChangeText(
            keyboardType === "numeric" ? t.replace(/[^0-9]/g, "") : t,
          )
        }
        style={[
          styles.input,
          editable && styles.inputEditable,
          multiline && styles.textArea,
        ]}
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
      <Ionicons name={icon} size={16} color={active ? "#fff" : "#555"} />
      <Text style={[styles.iconLabel, active && { color: "#fff" }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const ACCENT = "#3B5BDB";
const ACCENT_LIGHT = "#EEF1FF";
const TEXT_PRIMARY = "#111827";
const TEXT_MUTED = "#6B7280";
const BORDER = "#E5E7EB";
const BG_PAGE = "#ffffff";
const BG_CARD = "#ffffff";

const styles = StyleSheet.create({
  container: {
    padding: 28,
    marginTop: 99,
    backgroundColor: BG_PAGE,
    minHeight: "100%",
  },

  card: {
    backgroundColor: BG_CARD,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
  },

  headerBanner: {
    height: 110,
    backgroundColor: "#1E2A4A",
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 32,
    paddingBottom: 24,
    marginTop: -52,
    gap: 20,
  },
  headerMobile: {
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: -40,
    paddingBottom: 20,
  },

  avatarWrapper: {
    borderRadius: 100,
    borderWidth: 3,
    borderColor: BG_CARD,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: "#E5E7EB",
  },
  avatarMobile: {
    width: 80,
    height: 80,
  },

  headerText: {
    flex: 1,
    paddingTop: 52,
    gap: 4,
  },
  headerTextMobile: {
    paddingTop: 14,
    alignItems: "center",
  },
  name: {
    fontSize: 26,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    fontFamily: "Montserrat-Bold",
    letterSpacing: -0.5,
  },
  nameMobile: {
    fontSize: 20,
    textAlign: "center",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  location: {
    fontSize: 13,
    color: TEXT_MUTED,
    fontFamily: "Montserrat-Regular",
  },

  headerActions: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 52,
  },

  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 100,
  },
  btnSm: {
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  btnEdit: {
    backgroundColor: ACCENT_LIGHT,
    borderWidth: 1,
    borderColor: "#C7D0F8",
  },
  btnSave: {
    backgroundColor: "#16a34a",
  },
  btnCancel: {
    backgroundColor: "#dc2626",
  },
  btnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Montserrat-Regular",
  },

  headerRule: {
    height: 1,
    backgroundColor: BORDER,
    marginHorizontal: 32,
  },

  details: {
    flexDirection: "row",
    padding: 32,
    gap: 32,
  },
  detailsMobile: {
    flexDirection: "column",
    padding: 20,
    gap: 0,
  },

  left: {
    flex: 1,
    gap: 14,
  },

  right: {
    flex: 1,
  },

  divider: {
    width: 1,
    backgroundColor: BORDER,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: TEXT_MUTED,
    textTransform: "uppercase",
    fontFamily: "Montserrat-Bold",
    marginBottom: 2,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  detailIconWrap: {
    marginTop: 14,
    width: 20,
    alignItems: "center",
  },

  input: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: TEXT_PRIMARY,
    fontFamily: "Montserrat-Regular",
    borderWidth: 1,
    borderColor: BORDER,
  },
  inputEditable: {
    backgroundColor: ACCENT_LIGHT,
    borderColor: "#A5B4FC",
    color: "#1E3A8A",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  editHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: BORDER,
    backgroundColor: ACCENT_LIGHT,
  },
  hintText: {
    fontSize: 12,
    color: ACCENT,
    fontFamily: "Montserrat-Regular",
  },

  iconRow: {
    flexDirection: "row",
    gap: 10,
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 100,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: BORDER,
  },
  iconButtonActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  iconLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: TEXT_PRIMARY,
    fontFamily: "Montserrat-Regular",
  },

  previewNote: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
  },
  previewText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: ACCENT,
  },

  dropdown: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER,
    marginTop: 4,
  },

  imageWrapper: {
    position: "relative",
    width: 280,
    height: 210,
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  dropdownImage: {
    width: 280,
    height: 210,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },

  // ── Carousel arrows
  arrowLeft: {
    position: "absolute",
    top: "40%",
    left: 6,
    backgroundColor: "rgba(0,0,0,0.45)",
    padding: 6,
    borderRadius: 100,
  },
  arrowRight: {
    position: "absolute",
    top: "40%",
    right: 6,
    backgroundColor: "rgba(0,0,0,0.45)",
    padding: 6,
    borderRadius: 100,
  },

  // ── Pagination dots
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D1D5DB",
  },
  activeDot: {
    backgroundColor: ACCENT,
    width: 18,
  },

  // ── Checkbox row
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 12,
    paddingBottom: 4,
  },
  checkLabel: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: TEXT_MUTED,
  },

  // ── Modal
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(10,12,20,0.88)",
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
  closeBtn: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 100,
    padding: 8,
  },  

  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  loadingBox: {
    backgroundColor: BG_CARD,
    paddingVertical: 28,
    paddingHorizontal: 36,
    borderRadius: 16,
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  loadingText: {
    fontSize: 13,
    color: TEXT_MUTED,
    fontFamily: "Montserrat-Regular",
  },
});
