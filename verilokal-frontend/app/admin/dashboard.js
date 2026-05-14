import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AdminDashboard() {
  const [pendingBusinesses, setPendingBusinesses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);

  const serverUrl = "https://verilocalph.onrender.com";

  const loadBusinesses = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/admin/pending-businesses`);
      setPendingBusinesses(res.data);
    } catch (error) {
      Alert.alert("Error", "Failed to load businesses");
      console.error(error);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  const handleVerify = async (id) => {
    try {
      await axios.put(`${serverUrl}/api/admin/verify/${id}`);
      Alert.alert("Success", "Business verified!");
      setPendingBusinesses((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      Alert.alert("Error", "Verification failed");
      console.error(error);
    }
  };

  const deleteBusiness = async (id) => {
    try {
      await axios.delete(`${serverUrl}/api/admin/delete/${id}`);
      Alert.alert("Success", "Business Deleted");
      setPendingBusinesses((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      Alert.alert("Error", "Delete failed");
      console.error(error);
    }
  };

  const showImage = (images) => {
    if (!images) return;

    let formattedImages = [];

    if (Array.isArray(images)) {
      formattedImages = images;
    } else if (typeof images === "string") {
      try {
        const parsed = JSON.parse(images);
        formattedImages = Array.isArray(parsed) ? parsed : [images];
      } catch {
        formattedImages = [images];
      }
    }

    const fullUrls = formattedImages.map((img) =>
      img.startsWith("http") ? img : `${serverUrl}/${img}`,
    );

    setCurrentImages(fullUrls);
    setCurrentIndex(0);
    setShowModal(true);
  };

  const [fontsLoaded] = useFonts({
    "Garet-Book": require("../../assets/fonts/garet/Garet-Book.ttf"),
    "Garet-Heavy": require("../../assets/fonts/garet/Garet-Heavy.ttf"),
    "Montserrat-Regular": require("../../assets/fonts/Montserrat/static/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("../../assets/fonts/Montserrat/static/Montserrat-Bold.ttf"),
    "Montserrat-Black": require("../../assets/fonts/Montserrat/static/Montserrat-Black.ttf"),
  });

  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showAddOriginModal, setShowAddOriginModal] = useState(false);
  const [showManageDropdown, setShowManageDropdown] = useState(false);

  const totalPending = pendingBusinesses.length;
  const withPermit = pendingBusinesses.filter((b) => b.permit).length;
  const withCertificates = pendingBusinesses.filter(
    (b) => b.certificates,
  ).length;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const [currentImages, setCurrentImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [hoverClose, setHoverClose] = useState(false);

  // History modals
  const [showMaterialHistoryModal, setShowMaterialHistoryModal] =
    useState(false);
  const [showOriginHistoryModal, setShowOriginHistoryModal] = useState(false);
  const [materialHistory, setMaterialHistory] = useState([]);
  const [originHistory, setOriginHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // History item delete confirmation modal
  const [showHistoryDeleteModal, setShowHistoryDeleteModal] = useState(false);
  const [historyDeleteTarget, setHistoryDeleteTarget] = useState(null); // { id, name, type: 'material' | 'origin' }

  // Add Material inputs
  const [newMaterialName, setNewMaterialName] = useState("");
  const [newMaterialType, setNewMaterialType] = useState("");

  // Add Origin inputs
  const [newOriginName, setNewOriginName] = useState("");

  // Shared loading & result state
  const [isLoading, setIsLoading] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);
  const [resultType, setResultType] = useState(null);
  const [resultMessage, setResultMessage] = useState("");

  // Result animations
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!resultVisible) return;
    if (resultType === "success") {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      opacityAnim.setValue(0);
      shakeAnim.setValue(0);
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 6,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -6,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [resultVisible, resultType]);

  const fetchMaterialHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await axios.get(`${serverUrl}/api/materials`);
      setMaterialHistory(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      Alert.alert("Error", "Failed to load material history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchOriginHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await axios.get(`${serverUrl}/api/origin`);
      setOriginHistory(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      Alert.alert("Error", "Failed to load origin history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const deleteMaterialEntry = async (id) => {
    try {
      await axios.delete(`${serverUrl}/api/materials/${id}`);
      setMaterialHistory((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      Alert.alert("Error", "Failed to delete material");
    }
  };

  const deleteOriginEntry = async (id) => {
    try {
      await axios.delete(`${serverUrl}/api/origin/${id}`);
      setOriginHistory((prev) => prev.filter((o) => o.id !== id));
    } catch (error) {
      Alert.alert("Error", "Failed to delete origin");
    }
  };

  const handleAddMaterial = async () => {
    if (!newMaterialName.trim() || !newMaterialType.trim()) {
      Alert.alert("Validation", "Please fill in all material fields.");
      return;
    }
    try {
      setShowAddMaterialModal(false);
      setIsLoading(true);
      await axios.post(
        "https://verilocalph.onrender.com/api/materials/create",
        {
          name: newMaterialName,
          type: newMaterialType,
        },
      );
      setResultType("success");
      setResultMessage(
        `"${newMaterialName}" has been successfully added as a material.`,
      );
      setNewMaterialName("");
      setNewMaterialType("");
    } catch (err) {
      const serverMessage =
        err.response?.data?.message ||
        "Failed to add material. Please try again.";
      setResultType("error");
      setResultMessage(serverMessage);
    } finally {
      setIsLoading(false);
      setResultVisible(true);
    }
  };

  const handleAddOrigin = async () => {
    if (!newOriginName.trim()) {
      Alert.alert("Validation", "Please enter an origin name.");
      return;
    }
    try {
      setShowAddOriginModal(false);
      setIsLoading(true);
      await axios.post("https://verilocalph.onrender.com/api/origin/create", {
        name: newOriginName,
      });
      setResultType("success");
      setResultMessage(
        `"${newOriginName}" has been successfully added as an origin.`,
      );
      setNewOriginName("");
    } catch (err) {
      const serverMessage =
        err.response?.data?.message ||
        "Failed to add origin. Please try again.";
      setResultType("error");
      setResultMessage(serverMessage);
    } finally {
      setIsLoading(false);
      setResultVisible(true);
    }
  };

  return (
    <View style={styles.admin_mainContainer}>
      <LinearGradient
        colors={["#f4f6fb", "#4A70A9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.admin_headerCard}
      >
        <Text style={styles.admin_headerTitle}>Admin Dashboard</Text>
      </LinearGradient>

      <View style={[styles.admin_headerContainer, { zIndex: 20 }]}>
        <Text style={styles.admin_pendingTitle}>Pending Artisan Accounts</Text>
        <View style={{ position: "relative", zIndex: 100 }}>
          <Pressable
            style={styles.manageDropdownBtn}
            onPress={() => setShowManageDropdown((prev) => !prev)}
          >
            <Ionicons name="settings-outline" size={16} color="#FFFFFF" />
            <Text style={styles.manageDropdownBtnText}>Manage Product Registration</Text>
            <Ionicons
              name={showManageDropdown ? "chevron-up" : "chevron-down"}
              size={14}
              color="#FFFFFF"
            />
          </Pressable>
          {showManageDropdown && (
            <View style={styles.manageDropdownMenu}>
              <Pressable
                style={styles.manageDropdownItem}
                onPress={() => {
                  setShowManageDropdown(false);
                  setShowAddMaterialModal(true);
                }}
              >
                <View style={styles.manageDropdownItemIcon}>
                  <Ionicons name="hammer-outline" size={15} color="#4A70A9" />
                </View>
                <Text style={styles.manageDropdownText}>Add Material</Text>
              </Pressable>
              <View style={styles.manageDropdownDivider} />
              <Pressable
                style={styles.manageDropdownItem}
                onPress={() => {
                  setShowManageDropdown(false);
                  setShowAddOriginModal(true);
                }}
              >
                <View style={styles.manageDropdownItemIcon}>
                  <Ionicons name="location-outline" size={15} color="#4A70A9" />
                </View>
                <Text style={styles.manageDropdownText}>Add Origin</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
      {/* ===== SUMMARY CARDS ===== */}
      <View style={[styles.admin_summaryContainer, { zIndex: 0 }]}>
        {/* Total Pending */}
        <View style={styles.admin_summaryCard}>
          <View style={{flexDirection: "row", gap: 4}}>
          <Ionicons name="time-outline" size={22} color="#54667f" />
          <Text
            style={{
              fontFamily: "Montserrat-Regular",
              fontSize: 14,
              paddingTop: 3,
              marginBottom: 6,
              color: "#54667f",
            }}
          >
            Total Pending
          </Text>
          </View>
          <Text
            style={{
              fontFamily: "Montserrat-Black",
              fontSize: 28,
              color: "#657c9d",
            }}
          >
            {totalPending} Artisan(s)
          </Text>
        </View>
      </View>
      <View style={styles.admin_tableContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {/* HEADER */}
            <View style={styles.admin_tableHeaderRow}>
              <Text style={styles.admin_heading_1}>NAME</Text>
              <Text style={styles.admin_heading_1}>ADDRESS</Text>
              <Text style={styles.admin_heading_1}>REGISTERED NAME</Text>
              <Text style={styles.admin_heading_2}>DESCRIPTION</Text>
              <Text style={styles.admin_heading_3}>PERMIT</Text>
              <Text style={styles.admin_heading_3}>CERTIFICATES</Text>
              <Text style={styles.admin_heading_3}>LOGO</Text>
              <Text style={styles.admin_heading_4}>CONTACT</Text>
              <Text style={styles.admin_heading_3}>ACTION</Text>
            </View>

            {/* ROWS */}
            {pendingBusinesses.length === 0 ? (
              <Text
                style={{
                  marginTop: 25,
                  fontFamily: "Montserrat-Regular",
                  color: "#9CA3AF",
                }}
              >
                No pending accounts
              </Text>
            ) : (
              pendingBusinesses.map((b) => (
                <View key={b.id} style={styles.admin_tableRow}>
                  <Text style={styles.admin_pendingHeading_1}>{b.name}</Text>
                  <Text style={styles.admin_pendingHeading_1}>{b.address}</Text>
                  <Text style={styles.admin_pendingHeading_1}>
                    {b.registered_business_name}
                  </Text>
                  <Text style={styles.admin_pendingHeading_2}>
                    {b.description}
                  </Text>

                  {/* Permit */}
                  <View style={{ flex: 1, alignItems: "center" }}>
                    {b.permit ? (
                      <TouchableOpacity
                        onPress={() => showImage(b.permit)}
                        style={styles.showImageButton}
                      >
                        <Text style={[styles.buttonText, { color: "#4338CA" }]}>
                          View
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <Text>-</Text>
                    )}
                  </View>

                  {/* Certificates */}
                  <View style={{ flex: 1, alignItems: "center" }}>
                    {b.certificates ? (
                      <TouchableOpacity
                        onPress={() => showImage(b.certificates)}
                        style={styles.showImageButton}
                      >
                        <Text style={[styles.buttonText, { color: "#6D28D9" }]}>
                          View
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <Text>-</Text>
                    )}
                  </View>

                  {/* Logo */}
                  <View style={{ flex: 1, alignItems: "center" }}>
                    {b.logo ? (
                      <TouchableOpacity
                        onPress={() => showImage(b.logo)}
                        style={{
                          backgroundColor: "#DBEAFE",
                          paddingVertical: 6,
                          paddingHorizontal: 16,
                          borderRadius: 10,
                        }}
                      >
                        <Text style={[styles.buttonText, { color: "#1D4ED8" }]}>
                          View
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <Text>-</Text>
                    )}
                  </View>

                  <Text
                    style={{
                      flex: 1.1,
                      fontFamily: "Montserrat-Regular",
                      color: "#111827",
                    }}
                  >
                    {b.contact_no}
                  </Text>

                  {/* Actions */}
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedBusiness(b);
                        setShowVerifyModal(true);
                      }}
                      style={{
                        backgroundColor: "#DCFCE7",
                        paddingVertical: 6,
                        paddingHorizontal: 14,
                        borderRadius: 10,
                      }}
                    >
                      <Text style={[styles.buttonText, { color: "#15803D" }]}>
                        Verify
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setSelectedBusiness(b);
                        setShowDeleteModal(true);
                      }}
                      style={{
                        backgroundColor: "#FEE2E2",
                        paddingVertical: 6,
                        paddingHorizontal: 14,
                        borderRadius: 10,
                      }}
                    >
                      <Text style={[styles.buttonText, { color: "#B91C1C" }]}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>

      {/* Delete Business Modal */}
      <Modal transparent visible={showDeleteModal} animationType="fade">
        <View style={styles.modalMainContainer}>
          <View style={styles.modalContentContainer}>
            <Text style={styles.modalHeading}>Delete Business</Text>

            <Text
              style={{ marginBottom: 20, fontFamily: "Montserrat-Regular" }}
            >
              Are you sure you want to delete this business?
            </Text>

            <View style={styles.modalButtonContainer}>
              <Pressable
                style={styles.modalButton}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={{ fontFamily: "Montserrat-Regular" }}>Cancel</Text>
              </Pressable>

              <Pressable
                style={{
                  padding: 10,
                  backgroundColor: "#be4848",
                  borderRadius: 8,
                }}
                onPress={() => {
                  if (selectedBusiness) {
                    deleteBusiness(selectedBusiness.id);
                  }
                  setShowDeleteModal(false);
                }}
              >
                <Text
                  style={{ color: "#fff", fontFamily: "Montserrat-Regular" }}
                >
                  Delete
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      {/* Verify Business Modal */}
      <Modal transparent visible={showVerifyModal} animationType="fade">
        <View style={styles.modalMainContainer}>
          <View style={styles.modalContentContainer}>
            <Text style={styles.modalHeading}>Verify Business</Text>

            <Text
              style={{ marginBottom: 20, fontFamily: "Montserrat-Regular" }}
            >
              Are you sure you want to verify this business?
            </Text>

            <View style={styles.modalButtonContainer}>
              <Pressable
                style={styles.modalButton}
                onPress={() => setShowVerifyModal(false)}
              >
                <Text style={{ fontFamily: "Montserrat-Regular" }}>Cancel</Text>
              </Pressable>

              <Pressable
                style={{
                  padding: 10,
                  backgroundColor: "#22C55E",
                  borderRadius: 8,
                }}
                onPress={() => {
                  if (selectedBusiness) {
                    handleVerify(selectedBusiness.id);
                  }
                  setShowVerifyModal(false);
                }}
              >
                <Text
                  style={{ color: "#fff", fontFamily: "Montserrat-Regular" }}
                >
                  Verify
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      {/* Image Modal */}
      <Modal visible={showModal} transparent>
        <View style={styles.admin_imageModalContainer}>
          {currentImages.length > 0 && (
            <>
              {/* Left Arrow */}
              <View style={{ width: 0, alignItems: "center" }}>
                {currentIndex > 0 && (
                  <Pressable
                    disabled={currentIndex === 0}
                    onPress={() => {
                      if (currentIndex > 0) {
                        setCurrentIndex((prev) => prev - 1);
                      }
                    }}
                    style={{
                      backgroundColor: "rgba(0,0,0,0.5)",
                      padding: 12,
                      borderRadius: 30,
                    }}
                  >
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                  </Pressable>
                )}
              </View>

              {/* Image */}
              <Image style={styles.admin_modalImage} />

              {/* Right Arrow */}
              <View style={{ width: 0, alignItems: "center" }}>
                {currentIndex < currentImages.length - 1 && (
                  <Pressable
                    disabled={currentIndex === currentImages.length - 1}
                    onPress={() => {
                      if (currentIndex < currentImages.length - 1) {
                        setCurrentIndex((prev) => prev + 1);
                      }
                    }}
                    style={{
                      backgroundColor: "rgba(0,0,0,0.5)",
                      padding: 12,
                      borderRadius: 30,
                    }}
                  >
                    <Ionicons name="chevron-forward" size={24} color="#fff" />
                  </Pressable>
                )}
              </View>
            </>
          )}

          {/* CLOSE BUTTON */}
          <View style={styles.admin_closeButtonWrapper}>
            <Pressable
              onHoverIn={() => setHoverClose(true)}
              onHoverOut={() => setHoverClose(false)}
              onPress={() => setShowModal(false)}
              style={[
                styles.admin_closeButton,
                { backgroundColor: hoverClose ? "#C0392B" : "#fff" },
              ]}
            >
              <Ionicons name="close" size={18} color="#000" />
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Add Material Modal */}
      <Modal visible={showAddMaterialModal} transparent animationType="fade">
        <View style={styles.addMaterial_modalOverlay}>
          <View style={styles.addMaterial_modalContainer}>
            <View
              style={{
                alignItems: "center",
                marginBottom: 12,
                flexDirection: "row",
                gap: 10,
              }}
            >
              {/* Icon */}
              <View style={styles.addMaterial_modalIconWrap}>
                <Ionicons name="bag-add-outline" size={22} color="#111827" />
              </View>

              {/* Title & subtitle */}
              <Text style={[styles.addMaterial_modalTitle, { flex: 1 }]}>
                Material Addition
              </Text>

              {/* History Button */}
              <TouchableOpacity
                onPress={() => {
                  fetchMaterialHistory();
                  setShowMaterialHistoryModal(true);
                }}
                style={styles.historyIconBtn}
              >
                <Ionicons name="time-outline" size={22} color="#4A70A9" />
              </TouchableOpacity>
            </View>
            {/* Input */}
            <View style={styles.addMaterial_modalInputWrap}>
              <TextInput
                placeholder="New material name"
                placeholderTextColor="#9CA3AF"
                style={styles.addMaterial_modalInput}
                autoCapitalize="none"
                maxLength={64}
                value={newMaterialName}
                onChangeText={setNewMaterialName}
              />
            </View>
            <View style={styles.addMaterial_modalInputWrap}>
              <TextInput
                placeholder="New material type"
                placeholderTextColor="#9CA3AF"
                style={styles.addMaterial_modalInput}
                autoCapitalize="none"
                maxLength={64}
                value={newMaterialType}
                onChangeText={setNewMaterialType}
              />
            </View>

            {/* Divider */}
            <View style={styles.addMaterial_modalDivider} />

            {/* Actions */}
            <View style={styles.addMaterial_modalActions}>
              <TouchableOpacity
                onPress={() => {
                  setShowAddMaterialModal(false);
                  setNewMaterialName("");
                  setNewMaterialType("");
                }}
                style={styles.addMaterial_modalCancelBtn}
              >
                <Text style={styles.addMaterial_modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAddMaterial}
                style={styles.addMaterial_modalConfirmBtn}
              >
                <Text style={styles.addMaterial_modalConfirmText}>
                  Confirm Addition of Material
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Origin Modal */}
      <Modal visible={showAddOriginModal} transparent animationType="fade">
        <View style={styles.addMaterial_modalOverlay}>
          <View style={styles.addMaterial_modalContainer}>
            <View
              style={{
                alignItems: "center",
                marginBottom: 12,
                flexDirection: "row",
                gap: 10,
              }}
            >
              {/* Icon */}
              <View style={styles.addMaterial_modalIconWrap}>
                <Ionicons name="location-outline" size={22} color="#111827" />
              </View>

              {/* Title */}
              <Text style={[styles.addMaterial_modalTitle, { flex: 1 }]}>
                Origin Addition
              </Text>

              {/* History Button */}
              <TouchableOpacity
                onPress={() => {
                  fetchOriginHistory();
                  setShowOriginHistoryModal(true);
                }}
                style={styles.historyIconBtn}
              >
                <Ionicons name="time-outline" size={22} color="#4A70A9" />
              </TouchableOpacity>
            </View>

            {/* Input */}
            <View style={styles.addMaterial_modalInputWrap}>
              <TextInput
                placeholder="New origin name"
                placeholderTextColor="#9CA3AF"
                style={styles.addMaterial_modalInput}
                autoCapitalize="none"
                value={newOriginName}
                maxLength={64}
                onChangeText={setNewOriginName}
              />
            </View>

            {/* Divider */}
            <View style={styles.addMaterial_modalDivider} />

            {/* Actions */}
            <View style={styles.addMaterial_modalActions}>
              <TouchableOpacity
                onPress={() => {
                  setShowAddOriginModal(false);
                  setNewOriginName("");
                }}
                style={styles.addMaterial_modalCancelBtn}
              >
                <Text style={styles.addMaterial_modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAddOrigin}
                style={styles.addMaterial_modalConfirmBtn}
              >
                <Text style={styles.addMaterial_modalConfirmText}>
                  Confirm Addition of Origin
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Material History Modal */}
      <Modal
        visible={showMaterialHistoryModal}
        transparent
        animationType="fade"
      >
        <View style={styles.addMaterial_modalOverlay}>
          <View
            style={[styles.addMaterial_modalContainer, { maxHeight: "75%" }]}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
                gap: 10,
              }}
            >
              <View style={styles.addMaterial_modalIconWrap}>
                <Ionicons name="time-outline" size={22} color="#4A70A9" />
              </View>
              <Text
                style={[
                  styles.addMaterial_modalTitle,
                  { flex: 1, marginBottom: 16 },
                ]}
              >
                Material History
              </Text>
              <TouchableOpacity
                onPress={() => setShowMaterialHistoryModal(false)}
                style={{ marginBottom: 16 }}
              >
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.addMaterial_modalDivider} />

            {/* List */}
            {historyLoading ? (
              <View style={{ paddingVertical: 24, alignItems: "center" }}>
                <ActivityIndicator size="small" color="#4A70A9" />
                <Text style={[styles.admin_loadingText, { marginTop: 10 }]}>
                  Loading…
                </Text>
              </View>
            ) : materialHistory.length === 0 ? (
              <View style={{ paddingVertical: 24, alignItems: "center" }}>
                <Ionicons name="archive-outline" size={36} color="#D1D5DB" />
                <Text
                  style={{
                    fontFamily: "Garet-Book",
                    color: "#9CA3AF",
                    marginTop: 10,
                  }}
                >
                  No materials added yet
                </Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 340 }}
              >
                {materialHistory.map((item, index) => (
                  <View key={item.id ?? index} style={styles.historyItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyItemName}>{item.name}</Text>
                      {item.type ? (
                        <Text style={styles.historyItemSub}>{item.type}</Text>
                      ) : null}
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        setHistoryDeleteTarget({
                          id: item.id,
                          name: item.name,
                          type: "material",
                        });
                        setShowHistoryDeleteModal(true);
                      }}
                      style={styles.historyDeleteBtn}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color="#B91C1C"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
            <View
              style={[styles.addMaterial_modalDivider, { marginTop: 12 }]}
            />
          </View>
        </View>
      </Modal>

      {/* Origin History Modal */}
      <Modal visible={showOriginHistoryModal} transparent animationType="fade">
        <View style={styles.addMaterial_modalOverlay}>
          <View
            style={[styles.addMaterial_modalContainer, { maxHeight: "75%" }]}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
                gap: 10,
              }}
            >
              <View style={styles.addMaterial_modalIconWrap}>
                <Ionicons name="time-outline" size={22} color="#4A70A9" />
              </View>
              <Text
                style={[
                  styles.addMaterial_modalTitle,
                  { flex: 1, marginBottom: 16 },
                ]}
              >
                Origin History
              </Text>
              <TouchableOpacity
                onPress={() => setShowOriginHistoryModal(false)}
                style={{ marginBottom: 16 }}
              >
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.addMaterial_modalDivider} />

            {/* List */}
            {historyLoading ? (
              <View style={{ paddingVertical: 24, alignItems: "center" }}>
                <ActivityIndicator size="small" color="#4A70A9" />
                <Text style={[styles.admin_loadingText, { marginTop: 10 }]}>
                  Loading…
                </Text>
              </View>
            ) : originHistory.length === 0 ? (
              <View style={{ paddingVertical: 24, alignItems: "center" }}>
                <Ionicons name="archive-outline" size={36} color="#D1D5DB" />
                <Text
                  style={{
                    fontFamily: "Garet-Book",
                    color: "#9CA3AF",
                    marginTop: 10,
                  }}
                >
                  No origins added yet
                </Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 340 }}
              >
                {originHistory.map((item, index) => (
                  <View key={item.id ?? index} style={styles.historyItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyItemName}>{item.name}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        setHistoryDeleteTarget({
                          id: item.id,
                          name: item.name,
                          type: "origin",
                        });
                        setShowHistoryDeleteModal(true);
                      }}
                      style={styles.historyDeleteBtn}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color="#B91C1C"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <View
              style={[styles.addMaterial_modalDivider, { marginTop: 12 }]}
            />
          </View>
        </View>
      </Modal>

      {/* History Item Delete Confirmation Modal */}
      <Modal transparent visible={showHistoryDeleteModal} animationType="fade">
        <View style={styles.historyDelete_overlay}>
          <View style={styles.historyDelete_card}>
            {/* Icon */}
            <View style={styles.historyDelete_iconWrap}>
              <Ionicons name="trash-outline" size={28} color="#B91C1C" />
            </View>

            {/* Title */}
            <Text style={styles.historyDelete_title}>
              {historyDeleteTarget?.type === "material"
                ? "Delete Material"
                : "Delete Origin"}
            </Text>

            {/* Message */}
            <Text style={styles.historyDelete_message}>
              Are you sure you want to remove{" "}
              <Text style={{ fontFamily: "Garet-Heavy", color: "#111827" }}>
                "{historyDeleteTarget?.name}"
              </Text>
              {historyDeleteTarget?.type === "material"
                ? " from materials?"
                : " from origins?"}
            </Text>

            {/* Buttons */}
            <View style={styles.historyDelete_buttonRow}>
              <TouchableOpacity
                style={styles.historyDelete_cancelBtn}
                onPress={() => {
                  setShowHistoryDeleteModal(false);
                  setHistoryDeleteTarget(null);
                }}
              >
                <Text style={styles.historyDelete_cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.historyDelete_confirmBtn}
                onPress={() => {
                  if (historyDeleteTarget?.type === "material") {
                    deleteMaterialEntry(historyDeleteTarget.id);
                  } else {
                    deleteOriginEntry(historyDeleteTarget.id);
                  }
                  setShowHistoryDeleteModal(false);
                  setHistoryDeleteTarget(null);
                }}
              >
                <Ionicons
                  name="trash-outline"
                  size={14}
                  color="#fff"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.historyDelete_confirmText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.admin_resultOverlay}>
          <View style={styles.admin_loadingContainer}>
            <ActivityIndicator size="large" color="#4A70A9" />
            <Text style={styles.admin_loadingText}>Processing…</Text>
          </View>
        </View>
      )}

      {/* Success / Error Result Modal */}
      {resultVisible && (
        <View style={styles.admin_resultOverlay}>
          <Animated.View
            style={[
              styles.admin_resultContainer,
              {
                opacity: opacityAnim,
                transform: [
                  { scale: resultType === "success" ? scaleAnim : 1 },
                  { translateX: resultType === "error" ? shakeAnim : 0 },
                ],
              },
            ]}
          >
            <Ionicons
              name={
                resultType === "success" ? "checkmark-circle" : "close-circle"
              }
              size={70}
              color={resultType === "success" ? "#4caf50" : "#d32f2f"}
              style={styles.admin_resultIcon}
            />
            <Text
              style={[
                styles.admin_resultTitle,
                { color: resultType === "success" ? "#2e7d32" : "#c62828" },
              ]}
            >
              {resultType === "success"
                ? "Addition Successful"
                : "Addition Failed"}
            </Text>
            <Text style={styles.admin_resultMessage}>{resultMessage}</Text>
            <Pressable
              onPress={() => setResultVisible(false)}
              style={[
                styles.admin_resultButton,
                {
                  backgroundColor:
                    resultType === "success" ? "#4caf50" : "#d32f2f",
                },
              ]}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "600",
                  fontFamily: "Garet-Book",
                }}
              >
                OK
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  admin_mainContainer: {
    flex: 1,
    backgroundColor: "#E9EDF5",
    padding: 100,
    paddingHorizontal: 320,
  },

  admin_headerCard: {
    width: "100%",
    marginVertical: 10,
    maxWidth: 1500,
    borderRadius: 40,
    paddingVertical: 20,
    paddingHorizontal: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(200, 210, 230, 0.6)",
    shadowColor: "#1a2f5a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
  },

  admin_headerTitle: {
    fontSize: 28,
    fontFamily: "Montserrat-Black",
    color: "#000",
    marginBottom: 5,
  },

  admin_pendingTitle: {
    fontSize: 20,
    fontFamily: "Montserrat-Regular",
    color: "#6B7280",
  },

  admin_summaryContainer: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 25,
  },

  admin_summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  admin_tableContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 25,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  admin_tableHeaderRow: {
    flexDirection: "row",
    paddingVertical: 18,
    paddingHorizontal: 15,
    minWidth: 1400,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  admin_tableRow: {
    flexDirection: "row",
    paddingVertical: 20,
    paddingHorizontal: 15,
    minWidth: 1400,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    alignItems: "center",
  },

  admin_imageModalContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    width: "75%%",
  },

  admin_modalImage: {
    width: Dimensions.get("window").width * 0.85,
    height: Dimensions.get("window").height * 0.75,
    resizeMode: "contain",
    borderRadius: 16,
  },

  admin_closeButtonWrapper: {
    position: "absolute",
    top: 125,
    right: 120,
    zIndex: 10,
  },

  admin_closeButton: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  admin_heading_1: {
    flex: 1.2,
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: "#6B7280",
  },
  admin_heading_2: {
    flex: 2,
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: "#6B7280",
  },

  admin_heading_3: {
    flex: 1,
    textAlign: "center",
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: "#6B7280",
  },
  admin_heading_4: {
    flex: 1.1,
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: "#6B7280",
  },
  admin_pendingHeading_1: {
    flex: 1.2,
    fontFamily: "Montserrat-Regular",
    color: "#111827",
  },
  admin_pendingHeading_2: {
    flex: 2,
    fontFamily: "Montserrat-Regular",
    color: "#111827",
  },
  showImageButton: {
    backgroundColor: "#E0E7FF",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  buttonText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 12,
  },
  modalMainContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContentContainer: {
    width: 300,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  modalHeading: {
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    marginBottom: 10,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalButton: {
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  admin_headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addButtonsContainer: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 25,
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    borderColor: "#54667f",
  },
  addButtonText: {
    color: "#000000",
    fontWeight: "thin",
    paddingRight: 6,
    fontSize: 13,
    fontFamily: "Montserrat-Regular",
  },
  manageDropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#4A70A9",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    shadowColor: "#4A70A9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  manageDropdownBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Montserrat-Regular",
    fontWeight: "600",
  },
  manageDropdownMenu: {
    position: "absolute",
    top: 48,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(200, 210, 230, 0.6)",
    shadowColor: "#1a2f5a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 999,
    minWidth: 190,
    overflow: "hidden",
  },
  manageDropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 12,
  },
  manageDropdownItemIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  manageDropdownDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 16,
  },
  manageDropdownText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: "#111827",
    fontWeight: "500",
  },
  addMaterial_modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  addMaterial_modalContainer: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 10,
  },
  addMaterial_modalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  addMaterial_modalTitle: {
    fontSize: 22,
    color: "#111827",
    fontFamily: "Garet-Heavy",
    marginBottom: 18,
  },
  addMaterial_modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Garet-Book",
    lineHeight: 20,
    marginBottom: 20,
  },
  addMaterial_modalSubtitleBold: {
    color: "#111827",
    fontWeight: "600",
  },
  addMaterial_modalInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    marginBottom: 20,
  },
  addMaterial_modalInputIcon: {
    marginTop: 1,
  },
  addMaterial_modalInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    fontFamily: "Garet-Book",
    padding: 5,
  },
  addMaterial_modalDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginBottom: 16,
  },
  addMaterial_modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  addMaterial_modalCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  addMaterial_modalCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    fontFamily: "Garet-Book",
  },
  addMaterial_modalConfirmBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: "#4A70A9",
    alignItems: "center",
  },
  addMaterial_modalConfirmText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "Garet-Book",
  },

  // Loading & Result
  admin_resultOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    zIndex: 999,
  },
  admin_loadingContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 32,
    alignItems: "center",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  admin_loadingText: {
    fontSize: 14,
    fontFamily: "Garet-Book",
    color: "#374151",
    fontWeight: "500",
  },
  admin_resultContainer: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  admin_resultIcon: {
    marginBottom: 15,
  },
  admin_resultTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Garet-Heavy",
    marginBottom: 12,
    textAlign: "center",
  },
  admin_resultMessage: {
    fontSize: 14,
    textAlign: "center",
    color: "#4B5563",
    fontFamily: "Garet-Book",
    marginBottom: 24,
    lineHeight: 20,
  },
  admin_resultButton: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  // History
  historyIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#DBEAFE",
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  historyItemName: {
    fontSize: 14,
    fontFamily: "Garet-Heavy",
    color: "#111827",
  },
  historyItemSub: {
    fontSize: 12,
    fontFamily: "Garet-Book",
    color: "#6B7280",
    marginTop: 2,
  },
  historyDeleteBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FEE2E2",
    marginLeft: 10,
  },

  // History Delete Confirmation Modal
  historyDelete_overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  historyDelete_card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  historyDelete_iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  historyDelete_title: {
    fontSize: 18,
    fontFamily: "Garet-Heavy",
    color: "#111827",
    marginBottom: 10,
    textAlign: "center",
  },
  historyDelete_message: {
    fontSize: 14,
    fontFamily: "Garet-Book",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  historyDelete_buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  historyDelete_cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
  },
  historyDelete_cancelText: {
    fontFamily: "Garet-Heavy",
    color: "#374151",
    fontSize: 14,
  },
  historyDelete_confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  historyDelete_confirmText: {
    fontFamily: "Garet-Heavy",
    color: "#fff",
    fontSize: 14,
  },
});