import axios from "axios";
import { useFonts } from "expo-font";
import { useEffect, useRef, useState } from "react";
import { Dimensions, Image, Modal, Pressable, ScrollView, Text, View } from "react-native";

export default function ProductScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [product, setProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [registered_business_name, setBusinessName] = useState("");

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(Dimensions.get("window").width < 600);
    handleResize();
    Dimensions.addEventListener("change", handleResize);
    return () => Dimensions.removeEventListener("change", handleResize);
  }, []);

  const Html5QrcodeRef = useRef(null);

  const startScanner = async () => {
    setError(null);
    setProduct(null);
    setQrData(null);
    setProductDetails(null);
    setIsScanning(true);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const qrCodeScanner = new Html5Qrcode("qr-reader");
      Html5QrcodeRef.current = qrCodeScanner;

      await qrCodeScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 300, height: 300 } }, //
        async (decodedText) => {
          try {
            setQrData(decodedText);
            if (Html5QrcodeRef.current) await Html5QrcodeRef.current.stop();
            setIsScanning(false);

            const [product_id_str, blockchain_hash] = decodedText.split("|");
            const product_id = Number(product_id_str);

            if (!product_id || !blockchain_hash)
              throw new Error("Invalid QR data format");

            let res;
            try {
              res = await axios.post(
                "https://backend1-al4l.onrender.com/api/products/verify",
                { product_id, blockchain_hash }
              );
              setProduct(res.data);
              setError(null);
            } catch (axiosErr) {
              setError(
                axiosErr.response?.data?.message ||
                  "Verification failed. Please try again."
              );
              return;
            }

            if (res.data.verified) {
              try {
                const allRes = await axios.get(
                  "https://backend1-al4l.onrender.com/api/products"
                );
                const matched = allRes.data.find((p) => p.id === product_id);
                if (matched) {
                  setProductDetails(matched);
                  if (matched.business_id) {
                    try {
                      const businessRes = await axios.get(
                        `https://backend1-al4l.onrender.com/api/business/${matched.business_id}`
                      );
                      setBusinessName(businessRes.data.registered_business_name);
                    } catch (err) {
                      console.error("Failed to fetch business:", err);
                      setBusinessName("Unknown Business");
                    }
                  }
                  setModalVisible(true);
                } else setError("Verified but product not found");
              } catch {
                setError("Verified but failed to fetch product details");
              }
            }
          } catch (err) {
            setError(err.message || "Invalid QR or backend error");
          }
        },
        (scanError) => console.warn("Scan error:", scanError)
      );
    } catch (err) {
      setError("Failed to access camera");
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (Html5QrcodeRef.current) {
      await Html5QrcodeRef.current.stop().catch(() => {});
      setIsScanning(false);
    }
  };

  const [fontsLoaded] = useFonts({
    "Garet-Book": require("../../assets/fonts/garet/Garet-Book.ttf"),
    "Garet-Heavy": require("../../assets/fonts/garet/Garet-Heavy.ttf"),
    "Montserrat-Regular": require("../../assets/fonts/Montserrat/static/Montserrat-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  const instructions = [
    "Press START to activate the scanner.",
    "Allow camera permissions if prompted.",
    "Point your camera at the QR code.",
    "Wait for the system to decode automatically.",
    "Product details will pop up if verification succeeds.",
    "If scanning fails, reposition the QR or adjust lighting.",
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      contentContainerStyle={{
        alignItems: "center",
        paddingVertical: 60,
        paddingHorizontal: 40,
      }}
    >
      {/* Header */}
      <Text
        style={{
          fontSize: 32,
          fontFamily: "Garet-Heavy",
          color: "#000",
          textAlign: "center",
          marginBottom: 30,
        }}
      >
        Product Verification
      </Text>

      {/* Scanner and Instructions Container */}
      <View
        style={{
          flexDirection: isMobile ? "column" : "row",
          gap: 20,
          marginBottom: 20,
          alignItems: "center",
        }}
      >
        {/* Scanner Box */}
        <View
          id="qr-reader"
          style={{
            width: isMobile ? 300: 400, // Increased from 250 to 300
            height: isMobile ? 300: 400, // Increased from 250 to 300
            borderWidth: 2,
            borderColor: "#000",
            borderRadius: 16,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f9fafb",
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Text style={{ textAlign: "center", color: "#888" }}>
            {isScanning ? "Scanning..." : "Scanner Inactive"}
          </Text>
        </View>

        {/* Instructions Box */}
        <View
          style={{
            width: isMobile ? 300: 400, // Increased from 250 to 300
            height: isMobile ? 300: 400, // Increased from 250 to 300
            borderWidth: 2,
            borderColor: "#000",
            borderRadius: 16,
            backgroundColor: "#f9fafb",
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            padding: isMobile ? 10  : 40,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Garet-Heavy",
              color: "#000",
              textAlign: "center",
              marginBottom: 15,
            }}
          >
            Instructions
          </Text>
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10 }}
          >
            {instructions.map((instruction, index) => (
              <View key={index} style={{ flexDirection: "row", marginBottom: 10, alignItems: "flex-start" }}>
                <Text style={{ fontSize: 16, color: "#e98669", marginRight: 10, fontWeight: "bold" }}>
                  {index + 1}.
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#333",
                    fontFamily: "Montserrat-Regular",
                    lineHeight: 20,
                    flex: 1,
                  }}
                >
                  {instruction}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Buttons */}
      <View style={{ flexDirection: "row", gap: 15, marginBottom: 20 }}>
        <Pressable
          onPress={startScanner}
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
        >
          <Text
            style={{
              fontFamily: "Montserrat-Regular",
              fontWeight: "700",
              color: "#000",
            }}
          >
            START
          </Text>
        </Pressable>

        <Pressable
          onPress={stopScanner}
          style={{
            backgroundColor: "#444",
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 30,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontFamily: "Montserrat-Regular",
              fontWeight: "700",
              color: "#fff",
            }}
          >
            STOP
          </Text>
        </Pressable>
      </View>

      {/* Error / Success */}
      {error && (
        <View
          style={{
            backgroundColor: "#fde2e2",
            borderWidth: 1,
            borderColor: "#f5c2c2",
            borderRadius: 12,
            padding: 12,
            marginBottom: 20,
            width: "100%",
          }}
        >
          <Text
            style={{
              color: "#b71c1c",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            ❌ {error}
          </Text>
        </View>
      )}

      {product && product.verified && (
        <View
          style={{
            backgroundColor: "#e2f8e2",
            borderWidth: 1,
            borderColor: "#b5e6b5",
            borderRadius: 12,
            padding: 12,
            marginBottom: 20,
            width: "100%",
          }}
        >
          <Text
            style={{
              color: "#2e7d32",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            ✅ {product.message}
          </Text>
        </View>
      )}

      {product && !product.verified && (
        <View
          style={{
            backgroundColor: "#fff7e2",
            borderWidth: 1,
            borderColor: "#ffe6b5",
            borderRadius: 12,
            padding: 12,
            marginBottom: 20,
            width: "100%",
          }}
        >
          <Text
            style={{
              color: "#ff8c00",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            ⚠️ {product.message}
          </Text>
        </View>
      )}

    {/* Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent>
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
      }}
    >
      <View
        style={{
          width: "92%",
          maxWidth: 420,
          maxHeight: "85%", // limit height so modal is scrollable
          borderRadius: 20,
          backgroundColor: "rgba(255,255,255,0.97)",
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 10,
          overflow: "hidden",
        }}
      >
        {productDetails && (
          <>
            {/* Product Image */}
            {productDetails.product_image && (
              <Image
                source={{ uri: productDetails.product_image }}
                style={{ width: "100%", height: 200, borderRadius: 12, resizeMode: "contain" }}
              />
            )}

            {/* Scrollable content */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true} // important for mobile scrolling
            >
              <Text
                style={{
                  fontSize: 24,
                  fontFamily: "Garet-Heavy",
                  marginBottom: 10,
                  textAlign: "center",
                  color: "#333",
                }}
              >
                {productDetails.name}
              </Text>

              <View style={{ height: 1, backgroundColor: "#e0e0e0", marginVertical: 10 }} />

              {/* Registered Artisan */}
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Montserrat-Regular",
                  marginBottom: 10,
                  color: "#555",
                  textAlign: "center",
                  fontWeight: "700",
                }}
              >
                {registered_business_name ? `Registered Artisan: ${registered_business_name}` : ""}
              </Text>

              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 16, color: "#444" }}>
                  <Text style={{ fontWeight: "700" }}>Type: </Text>{productDetails.type}
                </Text>
                <Text style={{ fontSize: 16, color: "#444" }}>
                  <Text style={{ fontWeight: "700" }}>Materials: </Text>{productDetails.materials}
                </Text>
                <Text style={{ fontSize: 16, color: "#444" }}>
                  <Text style={{ fontWeight: "700" }}>Origin: </Text>{productDetails.origin}
                </Text>
                <Text style={{ fontSize: 16, color: "#444" }}>
                  <Text style={{ fontWeight: "700" }}>Production Date: </Text>{productDetails.productionDate}
                </Text>

                <Text style={{ marginTop: 10, fontWeight: "700", fontSize: 16, color: "#333" }}>
                  Description:
                </Text>
                <Text style={{ color: "#555", lineHeight: 20 }}>
                  {productDetails.description}
                </Text>
              </View>

              {/* Process Image Below Details */}
              {productDetails.process_image && (
                <View style={{ marginTop: 20, alignItems: "center" }}>
                  <Text style={{ fontFamily: "Montserrat-Regular", fontWeight: "600", marginBottom: 6 }}>
                    Image of the Process
                  </Text>
                  <Image
                    source={{ uri: productDetails.process_image }}
                    style={{ width: "100%", height: 200, borderRadius: 12, resizeMode: "contain" }}
                  />
                </View>
              )}

              <Pressable
                onPress={() => setModalVisible(false)}
                style={{
                  marginTop: 20,
                  backgroundColor: "#000",
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOpacity: 0.15,
                  shadowRadius: 5,
                  elevation: 5,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: "700",
                    fontFamily: "Montserrat-Regular",
                  }}
                >
                  Close
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
