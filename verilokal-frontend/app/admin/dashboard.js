import axios from "axios";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";


export default function AdminDashboard() {
  const [pendingBusinesses, setPendingBusinesses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);

  const serverUrl = "http://localhost:3000";

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
      img.startsWith("http") ? img : `${serverUrl}/${img}`
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


  const totalPending = pendingBusinesses.length;
  const withPermit = pendingBusinesses.filter(b => b.permit).length;
  const withCertificates = pendingBusinesses.filter(b => b.certificates).length;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const [currentImages, setCurrentImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [hoverClose, setHoverClose] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: "#E9EDF5", padding: 30, paddingHorizontal: 220, }}>
      <View style={{ 
        width: "100%",  
        marginBottom: 10,
        borderWidth: 2, 
        borderColor: "#000",
        borderRadius: 20,
        paddingVertical: 20, 
        paddingHorizontal: 25,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 4,}}>
        <Text
          style={{
            fontSize: 32,
            fontFamily: "Garet-Heavy",
            color: "#000",
            marginBottom: 5,
          }}
        >
          Admin Dashboard
        </Text>
      </View>

    <Text
      style={{
        fontSize: 18,
        fontWeight: "600",
        color: "#6B7280",
        marginBottom: 20,
      }}
    >
      Pending Business Accounts
    </Text>
    {/* ===== SUMMARY CARDS ===== */}
    <View style={{ flexDirection: "row", gap: 20, marginBottom: 25 }}>

      {/* Total Pending */}
      <View style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
      }}>
        <Text style={{
          fontFamily: "Montserrat-Bold",
          fontSize: 14,
          color: "#6B7280",
          marginBottom: 6
        }}>
          TOTAL PENDING
        </Text>
        <Text style={{
          fontFamily: "Montserrat-Black",
          fontSize: 28,
          color: "#111827"
        }}>
          {totalPending}
        </Text>
      </View>
    </View>
      <View
  style={{
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 25,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  }}
>

  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    <View>

      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          paddingVertical: 18,
          paddingHorizontal: 15,
          minWidth: 1400,
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <Text style={{ flex: 1.2, fontFamily: "Montserrat-Bold", fontSize: 13, color: "#6B7280" }}>NAME</Text>
        <Text style={{ flex: 1.2, fontFamily: "Montserrat-Bold", fontSize: 13, color: "#6B7280" }}>ADDRESS</Text>
        <Text style={{ flex: 1.2, fontFamily: "Montserrat-Bold", fontSize: 13, color: "#6B7280" }}>REGISTERED NAME</Text>
        <Text style={{ flex: 2, fontFamily: "Montserrat-Bold", fontSize: 13, color: "#6B7280" }}>DESCRIPTION</Text>
        <Text style={{ flex: 1, textAlign: "center", fontFamily: "Montserrat-Bold", fontSize: 13, color: "#6B7280" }}>PERMIT</Text>
        <Text style={{ flex: 1, textAlign: "center", fontFamily: "Montserrat-Bold", fontSize: 13, color: "#6B7280" }}>CERTIFICATES</Text>
        <Text style={{ flex: 1, textAlign: "center", fontFamily: "Montserrat-Bold", fontSize: 13, color: "#6B7280" }}>LOGO</Text>
        <Text style={{ flex: 1.1, fontFamily: "Montserrat-Bold", fontSize: 13, color: "#6B7280" }}>CONTACT</Text>
        <Text style={{ flex: 1, textAlign: "center", fontFamily: "Montserrat-Bold", fontSize: 13, color: "#6B7280" }}>ACTION</Text>
      </View>

      {/* ROWS */}
      {pendingBusinesses.length === 0 ? (
        <Text style={{ marginTop: 25, fontFamily: "Montserrat-Regular", color: "#9CA3AF" }}>
          No pending businesses
        </Text>
      ) : (
        pendingBusinesses.map((b) => (
          <View
            key={b.id}
            style={{
              flexDirection: "row",
              paddingVertical: 20,
              paddingHorizontal: 15,
              minWidth: 1400,
              borderBottomWidth: 1,
              borderBottomColor: "#F3F4F6",
              alignItems: "center",
            }}
          >
            <Text style={{ flex: 1.2, fontFamily: "Montserrat-Regular", color: "#111827" }}>{b.name}</Text>
            <Text style={{ flex: 1.2, fontFamily: "Montserrat-Regular", color: "#111827" }}>{b.address}</Text>
            <Text style={{ flex: 1.2, fontFamily: "Montserrat-Regular", color: "#111827" }}>{b.registered_business_name}</Text>
            <Text style={{ flex: 2, fontFamily: "Montserrat-Regular", color: "#111827" }}>{b.description}</Text>

            {/* Permit */}
            <View style={{ flex: 1, alignItems: "center" }}>
              {b.permit ? (
                <TouchableOpacity
                  onPress={() => showImage(b.permit)}
                  style={{
                    backgroundColor: "#E0E7FF",
                    paddingVertical: 6,
                    paddingHorizontal: 16,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ color: "#4338CA", fontFamily: "Montserrat-Bold", fontSize: 12 }}>View</Text>
                </TouchableOpacity>
              ) : <Text>-</Text>}
            </View>

            {/* Certificates */}
            <View style={{ flex: 1, alignItems: "center" }}>
              {b.certificates ? (
                <TouchableOpacity
                  onPress={() => showImage(b.certificates)}
                  style={{
                    backgroundColor: "#EDE9FE",
                    paddingVertical: 6,
                    paddingHorizontal: 16,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ color: "#6D28D9", fontFamily: "Montserrat-Bold", fontSize: 12 }}>View</Text>
                </TouchableOpacity>
              ) : <Text>-</Text>}
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
                  <Text style={{ color: "#1D4ED8", fontFamily: "Montserrat-Bold", fontSize: 12 }}>View</Text>
                </TouchableOpacity>
              ) : <Text>-</Text>}
            </View>

            <Text style={{ flex: 1.1, fontFamily: "Montserrat-Regular", color: "#111827" }}>
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
                <Text style={{ color: "#15803D", fontFamily: "Montserrat-Bold", fontSize: 12 }}>
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
                <Text style={{ color: "#B91C1C", fontFamily: "Montserrat-Bold", fontSize: 12 }}>
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
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 300,
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 12,
              elevation: 5,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Montserrat-Bold",
                marginBottom: 10,
              }}
            >
              Delete Business
            </Text>

            <Text style={{ marginBottom: 20, fontFamily: "Montserrat-Regular" }}>
              Are you sure you want to delete this business?
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <Pressable
                style={{
                  padding: 10,
                  backgroundColor: "#eee",
                  borderRadius: 8,
                }}
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
                <Text style={{ color: "#fff", fontFamily: "Montserrat-Regular" }}>
                  Delete
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      {/* Verify Business Modal */}
      <Modal transparent visible={showVerifyModal} animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 300,
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 12,
              elevation: 5,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Montserrat-Bold",
                marginBottom: 10,
              }}
            >
              Verify Business
            </Text>

            <Text style={{ marginBottom: 20, fontFamily: "Montserrat-Regular" }}>
              Are you sure you want to verify this business?
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <Pressable
                style={{
                  padding: 10,
                  backgroundColor: "#eee",
                  borderRadius: 8,
                }}
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
                <Text style={{ color: "#fff", fontFamily: "Montserrat-Regular" }}>
                  Verify
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      {/* Image Modal */}
      <Modal visible={showModal} transparent>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            backgroundColor: "rgba(0,0,0,0.8)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
            width: "75%%",
          }}
        >
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
              <Image
                source={{ uri: currentImages[currentIndex] }}
                style={{
                  width: Dimensions.get("window").width * 0.85,
                  height: Dimensions.get("window").height * 0.75,
                  resizeMode: "contain",
                  borderRadius: 16,
                }}
              />

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
            <View style={{position: "absolute", top: 125, right: 120, zIndex: 10,}}>
              <Pressable
                onHoverIn={() => setHoverClose(true)}
                onHoverOut={() => setHoverClose(false)}
                onPress={() => setShowModal(false)}
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
      </Modal>
    </View>
  );
}
