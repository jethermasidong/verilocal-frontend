import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFonts } from "expo-font";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const windowWidth = Dimensions.get("window").width;
const isMobile = windowWidth < 768;

export default function BusinessDashboard() {
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTallImage, setIsTallImage] = useState(false);

  useEffect(() => {
    const fetchBusinessProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const businessId = await AsyncStorage.getItem("business_id");
        const res = await axios.get(
          `http://localhost:3000/api/business/profile/${business_id}`,
          { headers: {Authorization: `Bearer ${token}`}}
        );
        setBusiness(res.data);
      } catch (err) {
        console.lob("Error loading business profile:", err);
      }
    }
  })

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:3000/api/products/my-products",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProducts(res.data);
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const openModal = (product) => {
    setSelectedProduct(product);
    if (product.product_image) {
    Image.getSize(product.product_image, (width, height) => {
      setIsTallImage(height > width * 1.2);
    });
  }
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

  const printQRCode = (qrUrl) => {
    if (!qrUrl) return;

    const printWindow = window.open("", "_blank", "width=350,height=450");

    const html = `
      <html>
        <head>
          <style>
            body { 
              text-align: center; 
              padding: 20px; 
              font-family: Arial; 
            }
            img {
              width: 220px;
              height: 220px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <img src="${qrUrl}" />
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
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
          justifyContent: isMobile ? "center" : "space-between",
          textAlign: "center",
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
            textAlign: isMobile ? "center" : "left",
            width: isMobile ? "100%" : "auto",
          }}
        >
          Business Dashboard
        </Text>
        <Text style={{ fontSize: 16, fontFamily: "Montserrat-Regular", marginBottom: 20}}>
          Total Products: {filteredProducts.length}
        </Text>
        <TextInput
          placeholder="Search products..."
          placeholderTextColor="#999"
          style={{
            width: "100%",
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderWidth: 2,
            borderColor: "#000",
            borderRadius: 30,
            marginBottom: 20,
            fontFamily: "Montserrat-Regular",
          }}
          value={searchQuery}
          onChangeText={(text) =>{
            setSearchQuery(text);
            setVisibleCount(9999);
          }}
          />
        {/* REGISTER PRODUCT BUTTON */}
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
          data={filteredProducts.slice(0, visibleCount)}
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
                  gap: 12,
                }}
              >
                {item.product_image && (
                  <View 
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    overflow: "hidden",
                    backgroundColor: "#f0f0f0",
                  }}
                  >
                  <Image
                  source={{ uri: item.product_image }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    resizeMode: "cover",
                  }}
                  />
                  </View>
                )}
                <Text style={{ fontWeight: "bold", fontSize: 16, flex: 1}}>{item.name}</Text>
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
              maxHeight: "85%",
            }}
          >
            {selectedProduct && (
              <>
                {/* HEADER IMAGES */}
                {selectedProduct?.product_image && (
                  <View
                  style={{
                    width: "100%",
                    aspectRatio: 1.6,
                    height: 250,
                    borderRadius: 16,
                    overflow: "hidden",
                    backgroundColor: "#f2f2f2",
                    marginBottom: 15,
                  }}
                  >
                  <Image
                    source={{ uri: selectedProduct.product_image }}
                    style={{
                      width: "100%",
                      height: "100%",
                      resizeMode: "contain",
                    }}
                  />
                  </View>
                )}

                {/* PRODUCT DETAILS */}
                <ScrollView
                  style={{ flexGrow: 1 }}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={{ fontSize: 24, fontFamily: "Garet-Heavy", marginBottom: 6 }}>
                    {selectedProduct.name}
                  </Text>

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

                  <Text style={{ marginTop: 8, fontWeight: "600", fontSize: 16, fontFamily: "Montserrat-Regular" }}>
                    Description
                  </Text>
                  <Text style={{ fontFamily: "Montserrat-Regular", marginBottom: 20 }}>
                    {selectedProduct.description}
                  </Text>
                  {selectedProduct?.process_image && (
                    <View style={{ marginBottom: 15, alignItems: "align-left" }}>
                      <Text
                        style={{
                          fontFamily: "Montserrat-Regular",
                          fontWeight: "600",
                          marginBottom: 6,
                        }}
                      >
                        Image of the Process
                      </Text>
                      <Image
                        source={{ uri: selectedProduct.process_image }}
                        style={{
                          width: "100%",
                          height: 200,
                          borderRadius: 40,
                          resizeMode: "contain",
                        }}
                      />
                    </View>
                  )}

                  {/* QR + PRINT + DOWNLOAD */}
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
                    <Pressable
                      onPress={() => printQRCode(selectedProduct.qr_code)}
                      style={{
                        backgroundColor: "#e98669",
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 6,
                        marginBottom: 6,
                        width: 90,
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
                        PRINT QR
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => downloadQRCode(selectedProduct.qr_code)}
                      style={{
                        backgroundColor: "#e98669",
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 6,
                        marginBottom: 10,
                        width: 90,
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
                        DOWNLOAD
                      </Text>
                    </Pressable>

                    {selectedProduct?.qr_code && (
                      <Image
                        source={{ uri: selectedProduct.qr_code }}
                        style={{ width: 220, height: 220, borderRadius: 8 }}
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
                          Linking.openURL(`https://eth-sepolia.blockscout.com/tx/${selectedProduct.tx_hash}`)
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
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
