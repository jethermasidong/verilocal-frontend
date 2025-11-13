import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFonts } from "expo-font";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
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
        const res = await axios.get("http://localhost:3000/api/products/my-products", {
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
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
      }}
      contentContainerStyle={{
        alignItems: "center",
        paddingVertical: 60,
        paddingHorizontal: 40,
      }}
    >
      {/* Header - Centered */}
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 40,
          gap: 20,
          flexWrap: "wrap", // responsive layout
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
            paddingVertical: 10,
            paddingHorizontal: 18,
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

      {/* Product List - Static on left side */}
      <View
        style={{
          width: "100%",
          alignItems: "flex-start", // keep list on the left
          maxWidth: 900,
        }}
      >
        <FlatList
          data={products.slice(0, visibleCount)}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: "#fff",
                borderWidth: 2,
                borderColor: "#000",
                borderRadius: 12,
                padding: 18,
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

      {/* Show More - only when many products */}
      {products.length > visibleCount && (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            marginTop: 10,
          }}
        >
          <Pressable onPress={() => setVisibleCount(products.length)}>
            <Text style={{ fontSize: 22, color: "#000" }}>⌄</Text>
            <Text
              style={{
                fontSize: 14,
                color: "#444",
                fontWeight: "500",
                textDecorationLine: "underline",
              }}
            >
              SHOW MORE
            </Text>
          </Pressable>
        </View>
      )}

      {/* Product Details Modal */}
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
              padding: 20,
              borderRadius: 10,
              alignItems: "center",
              maxWidth: 400,
              width: "90%",
            }}
          >
            {selectedProduct && (
              <>
                <Image
                  source={{
                    uri: `http://localhost:3000/${selectedProduct?.product_image?.replace(
                      /\\/g,
                      "/"
                    )}`,
                  }}
                  style={{
                    width: 250,
                    height: 250,
                    borderRadius: 10,
                    marginBottom: 10,
                  }}
                />
                <Text
                  style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}
                >
                  {selectedProduct.name}
                </Text>
                <Text>Type: {selectedProduct.type}</Text>
                <Text>Materials: {selectedProduct.materials}</Text>
                <Text>Origin: {selectedProduct.origin}</Text>
                <Text>Production Date: {selectedProduct.productionDate}</Text>
                <Text style={{ marginTop: 8, fontWeight: "600" }}>
                  Description:
                </Text>
                <Text>{selectedProduct.description}</Text>

                <View style={{ marginTop: 18, alignItems: "center" }}>
                  {selectedProduct?.qr_code && (
                    <Image
                      source={{
                        uri: `http://localhost:3000/${selectedProduct.qr_code.replace(
                          /\\/g,
                          "/"
                        )}`,
                      }}
                      style={{
                        width: 160,
                        height: 160,
                        borderRadius: 8,
                      }}
                      resizeMode="contain"
                    />
                  )}
                  <Text
                    style={{
                      marginTop: 8,
                      fontWeight: "600",
                      color: "#444",
                    }}
                  >
                    Product QR Code
                  </Text>
                </View>

                <Pressable
                  style={{
                    backgroundColor: "#000",
                    padding: 12,
                    borderRadius: 8,
                    marginTop: 15,
                    width: "100%",
                  }}
                  onPress={() => setModalVisible(false)}
                >
                  <Text
                    style={{
                      color: "#fff",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Close
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
