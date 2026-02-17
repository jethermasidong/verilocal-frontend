import axios from "axios";
import { useEffect, useState } from "react";
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

  const showImage = (imgPath) => {
    if (!imgPath) return;

    const fullUrl = imgPath.startsWith("http")
      ? imgPath
      : `${serverUrl}/${imgPath}`;

    setCurrentImage(fullUrl);
    setShowModal(true);
  };

  return (
    <View style={{ flex: 1, padding: 22, backgroundColor: "#F5F5F7" }}>
      
      {/* Title */}
      <Text
        style={{
          fontSize: 32,
          fontWeight: "800",
          marginBottom: 10,
          color: "#333",
        }}
      >
        Admin Dashboard
      </Text>

      <Text
        style={{
          fontSize: 22,
          fontWeight: "600",
          marginBottom: 15,
          color: "#555",
        }}
      >
        Pending Business Accounts
      </Text>

      <ScrollView horizontal>
        <View>
          {/* Table Header */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#D9D9D9",
              paddingVertical: 14,
              paddingHorizontal: 10,
              minWidth: 1400,
              borderRadius: 8,
            }}
          >
            <Text style={{ flex: 1.2, fontWeight: "800" }}>Name</Text>
            <Text style={{ flex: 1.2, fontWeight: "800" }}>Address</Text>
            <Text style={{ flex: 1.2, fontWeight: "800" }}>
              Registered Name
            </Text>
            <Text style={{ flex: 2, fontWeight: "800" }}>Description</Text>

            <Text
              style={{
                flex: 1,
                fontWeight: "800",
                textAlign: "center",
              }}
            >
              Business Permit
            </Text>

            <Text
              style={{
                flex: 1,
                fontWeight: "800",
                textAlign: "center",
              }}
            >
              Certificates
            </Text>

            <Text
              style={{
                flex: 1,
                fontWeight: "800",
                textAlign: "center",
              }}
            >
              Logo
            </Text>

            <Text style={{ flex: 1.1, fontWeight: "800" }}>Contact No</Text>

            <Text
              style={{
                flex: 0.9,
                fontWeight: "800",
                textAlign: "center",
              }}
            >
              Action
            </Text>
          </View>

          {/* Table Rows */}
          {pendingBusinesses.length === 0 ? (
            <Text
              style={{
                marginTop: 20,
                fontSize: 18,
                color: "#888",
                fontStyle: "italic",
              }}
            >
              No pending businesses
            </Text>
          ) : (
            pendingBusinesses.map((b) => (
              <View
                key={b.id}
                style={{
                  flexDirection: "row",
                  paddingVertical: 16,
                  paddingHorizontal: 10,
                  minWidth: 1400,
                  backgroundColor: "#FFFFFF",
                  borderBottomWidth: 1,
                  borderBottomColor: "#E0E0E0",
                  alignItems: "center",
                }}
              >
                <Text style={{ flex: 1.2 }}>{b.name}</Text>
                <Text style={{ flex: 1.2 }}>{b.address}</Text>
                <Text style={{ flex: 1.2 }}>{b.registered_business_name}</Text>
                <Text style={{ flex: 2 }}>{b.description}</Text>

                {/* Business Permit */}
                <View style={{ flex: 1, alignItems: "center" }}>
                  {b.permit ? (
                    <TouchableOpacity
                      onPress={() => showImage(b.permit)}
                      style={{
                        backgroundColor: "#146C94",
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "700" }}>View</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text>-</Text>
                  )}
                </View>


                {/* Certificates */}
                <View style={{ flex: 1, alignItems: "center" }}>
                  {b.certificates ? (
                    (() => {
                      let certArray = [];
                      try {
                        certArray = typeof b.certificates === "string" 
                          ? JSON.parse(b.certificates)  
                          : b.certificates;
                      } catch (e) {
                        certArray = [b.certificates];
                      }
                      return certArray.length > 0 ? (
                        certArray.map((cert, idx) => (
                          <TouchableOpacity
                            key={idx}
                            onPress={() => showImage(cert)}
                            style={{
                              backgroundColor: "#146C94",
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              borderRadius: 6,
                              marginBottom: 4,
                            }}
                          >
                            <Text style={{ color: "white", fontWeight: "700" }}>
                              View {idx + 1}
                            </Text>
                          </TouchableOpacity>
                        ))
                      ) : (
                        <Text>-</Text>
                      );
                    })()
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
                        backgroundColor: "#146C94",
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "700" }}>
                        View
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text>-</Text>
                  )}
                </View>

                <Text style={{ flex: 1.1 }}>{b.contact_no}</Text>

                {/* Verify Button */}
                <View style={{gap: 5, flexDirection: 'row'}}>
                <TouchableOpacity
                  onPress={() => handleVerify(b.id)}
                  style={{
                    flex: 0.9,
                    backgroundColor: "#5cbe7a",
                    paddingVertical: 8,
                    paddingHorizontal: 8,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "700" }}>
                    Verify
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteBusiness(b.id)}
                  style={{
                    flex: 0.9,
                    backgroundColor: "#aa4a4a",
                    paddingVertical: 8,
                    paddingHorizontal: 8,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "700" }}>
                    Delete
                  </Text>
                </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Image Modal */}
      <Modal visible={showModal} transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.85)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Image
            source={{ uri: currentImage }}
            style={{
              width: Dimensions.get("window").width * 0.9,
              height: Dimensions.get("window").height * 0.75,
              resizeMode: "contain",
              borderRadius: 12,
            }}
          />

          <Pressable
            onPress={() => setShowModal(false)}
            style={{
              marginTop: 25,
              paddingVertical: 12,
              paddingHorizontal: 30,
              backgroundColor: "#D9534F",
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
              Close
            </Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}
