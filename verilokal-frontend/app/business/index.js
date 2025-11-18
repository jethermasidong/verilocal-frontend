import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFonts } from "expo-font";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View
} from "react-native";

export default function BusinessDashboard() {
  const [products, setProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await axios.get("https://backend1-al4l.onrender.com/api/products/my-products", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(res.data);
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const openModal = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const downloadQRCode = async (qrUrl) => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `qr_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log("QR Download Error:", error);
    }
  };

  const [fontsLoaded] = useFonts({
    "Garet-Book": require("../../assets/fonts/garet/Garet-Book.ttf"),
    "Garet-Heavy": require("../../assets/fonts/garet/Garet-Heavy.ttf"),
    "Montserrat-Regular": require("../../assets/fonts/Montserrat/static/Montserrat-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View>
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      contentContainerStyle={{ alignItems: "center", paddingVertical: 60, paddingHorizontal: 40 }}
    >
      {/* Header */}
      <View
        style={{
          width: "100%",
          maxWidth: 900,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 50,
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <Text
          style={{
            fontSize: 32,
            fontFamily: "Garet-Heavy",
            color: "#000",
            textAlign: "center",
          }}
        >
          Business Dashboard
        </Text>

        <Pressable
          style={{
            backgroundColor: "#e98669",
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 30,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
          }}
          onPress={() => router.push("/business/productRegistration")}
        >
          <Text
            style={{
              color: "#000",
              fontWeight: "700",
              fontFamily: "Montserrat-Regular",
            }}
          >
            REGISTER PRODUCT +
          </Text>
        </Pressable>
      </View>

      {/* Product List */}
      <View style={{ width: "100%", maxWidth: 900, alignSelf: "center" }}>
        <FlatList
          data={products.slice(0, visibleCount)}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: "#fff",
                borderWidth: 2,
                borderColor: "#000",
                borderRadius: 12,
                padding: 20,
                marginBottom: 20,
                width: "100%",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                  {item.name}
                </Text>
                <Pressable
                  onPress={() => openModal(item)}
                  style={{
                    borderWidth: 2,
                    borderColor: "#000",
                    borderRadius: 20,
                    paddingVertical: 6,
                    paddingHorizontal: 14,
                  }}
                >
                  <Text style={{ fontWeight: "600" }}>SHOW DETAILS</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      </View>

      {/* Show More */}
      {products.length > visibleCount && (
        <Pressable onPress={() => setVisibleCount(products.length)} style={{ marginTop: 5, marginBottom: 20 }}>
          <Text style={{ fontSize: 14, color: "#444", fontWeight: "500", textDecorationLine: "underline" }}>
            Show More
          </Text>
        </Pressable>
      )}

      {/* Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 25,
              borderRadius: 16,
              width: "90%",
              maxWidth: 450,
              elevation: 5,
            }}
          >
            {selectedProduct && (
              <>
                {/* HEADER IMAGE */}
                <Image
                  source={{
                    uri: `https://backend1-al4l.onrender.com/${selectedProduct?.product_image?.replace(/\\/g, "/")}`,
                  }}
                  style={{ width: "100%", height: 200, borderRadius: 12, marginBottom: 15 }}
                  resizeMode="contain"
                />

                {/* PRODUCT NAME */}
                <Text style={{ fontSize: 24, fontFamily: "Garet-Heavy", marginBottom: 6 }}>
                  {selectedProduct.name}
                </Text>

                {/* PRODUCT DETAILS */}
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontFamily: "Montserrat-Regular" }}>
                    <Text style={{ fontWeight: "600" }}>Type:</Text> {selectedProduct.type}
                  </Text>
                  <Text style={{ fontFamily: "Montserrat-Regular" }}>
                    <Text style={{ fontWeight: "600" }}>Materials:</Text> {selectedProduct.materials}
                  </Text>
                  <Text style={{ fontFamily: "Montserrat-Regular" }}>
                    <Text style={{ fontWeight: "600" }}>Origin:</Text> {selectedProduct.origin}
                  </Text>
                  <Text style={{ fontFamily: "Montserrat-Regular" }}>
                    <Text style={{ fontWeight: "600" }}>Production Date:</Text> {selectedProduct.productionDate}
                  </Text>
                </View>

                {/* DESCRIPTION */}
                <Text style={{ marginTop: 8, fontWeight: "600", fontSize: 16, fontFamily: "Montserrat-Regular" }}>
                  Description
                </Text>
                <Text style={{ fontFamily: "Montserrat-Regular", marginBottom: 20 }}>
                  {selectedProduct.description}
                </Text>

                {/* QR + DOWNLOAD BUTTON STACKED */}
                <View
                  style={{
                    alignItems: "center",
                    backgroundColor: "#f9f9f9",
                    padding: 14,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#ccc",
                    marginBottom: 20,
                  }}
                >
                  {/* DOWNLOAD BUTTON ON TOP */}
                  <Pressable
                    onPress={() =>
                      downloadQRCode(
                        `https://backend1-al4l.onrender.com/${selectedProduct.qr_code.replace(/\\/g, "/")}`
                      )
                    }
                    style={{
                      backgroundColor: "#e98669",
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 6,
                      marginBottom: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: "#000",
                        textAlign: "center",
                        fontWeight: "700",
                        fontFamily: "Montserrat-Regular",
                        fontSize: 10,
                      }}
                    >
                      DOWNLOAD QR
                    </Text>
                  </Pressable>

                  {/* QR IMAGE */}
                  {selectedProduct?.qr_code && (
                    <Image
                      source={{ uri: `http://"https://backend1-al4l.onrender.com/${selectedProduct.qr_code.replace(/\\/g, "/")}` }}
                      style={{ width: 130, height: 130, borderRadius: 8 }}
                      resizeMode="contain"
                    />
                  )}
                </View>
                {/* BLOCKCHAIN INFO */}
                  <View
                    style={{
                      backgroundColor: "#f4f4f4",
                      padding: 14,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "#d9d9d9",
                      marginBottom: 20,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        marginBottom: 8,
                        fontFamily: "Montserrat-Regular",
                      }}
                    >
                      Blockchain Information
                    </Text>
                    <Text style={{ fontFamily: "Montserrat-Regular", marginBottom: 10 }}>
                      <Text style={{ fontWeight: "600" }}>Transaction Hash:</Text>{" "}
                      {selectedProduct.tx_hash}
                    </Text>

                    
                    {selectedProduct.tx_hash && (
                      <Pressable
                        onPress={() =>
                          Linking.openURL(
                            `https://eth-sepolia.blockscout.com/tx/${selectedProduct.tx_hash}`
                          )
                        }
                        style={{
                          backgroundColor: "#e98669",
                          paddingVertical: 10,
                          borderRadius: 6,
                          marginTop: 5,
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: "700",
                            fontFamily: "Montserrat-Regular",
                            textAlign: "center",
                            color: "#000",
                          }}
                        >
                          VIEW BLOCKCHAIN
                        </Text>
                      </Pressable>
                    )}
                  </View>

                {/* CLOSE */}
                <Pressable
                  style={{
                    backgroundColor: "#000",
                    paddingVertical: 12,
                    borderRadius: 10,
                  }}
                  onPress={() => setModalVisible(false)}
                >
                  <Text
                    style={{
                      color: "#fff",
                      textAlign: "center",
                      fontWeight: "700",
                      fontFamily: "Montserrat-Regular",
                    }}
                  >
                    CLOSE
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
