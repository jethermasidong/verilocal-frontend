import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useFonts } from "expo-font";
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Image, Modal, Pressable, ScrollView, Text, View } from "react-native";
export default function ProductScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [qrData, setQrData] = useState(null);

  //MODAL
  const [product, setProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [registered_business_name, setBusinessName] = useState("");

  //CAROUSEL
  const ITEM_WIDTH = 350;
  const scrollRef = useRef(null);
  const isProgrammaticScroll = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const leftScale = useRef(new Animated.Value(1)).current;
  const rightScale = useRef(new Animated.Value(1)).current;

  //PROCESS IMAGES
  const processImages = Array.isArray(productDetails?.process_images)
    ? productDetails.process_images
    : typeof productDetails?.process_images === "string"
    ? JSON.parse(productDetails.process_images)
    : [];

  //MOBILE DIMENSION
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(Dimensions.get("window").width < 600);
    handleResize();
    Dimensions.addEventListener("change", handleResize);
    return () => Dimensions.removeEventListener("change", handleResize);
  }, []);

  //HOVER CLOSE BUTTON
  const [hoverClose, setHoverClose] = useState(false);

  //QRCODE SCANNER
  const Html5QrcodeRef = useRef(null);
  const startScanner = async () => {
    setError(null);
    setProduct(null);
    setQrData(null);
    setProductDetails(null);
    setIsScanning(true);

  //QR CODE FUNCTION
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
                "http://localhost:3000/api/products/verify",
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
                  "http://localhost:3000/api/products"
                );
                const matched = allRes.data.find((p) => p.id === product_id);
                if (matched) {
                  setProductDetails(matched);
                  if (matched.business_id) {
                    try {
                      const businessRes = await axios.get(
                        `http://localhost:3000/api/business/${matched.business_id}`
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

  //PAGE ANIMATION
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  //FONTS
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

  //RIGHTBOX 
  const instructions = [
    "Press START to activate the scanner.",
    "Allow camera permissions if prompted.",
    "Point your camera at the QR code.",
    "Wait for the system to decode automatically.",
    "Product details will pop up if verification succeeds.",
    "If scanning fails, reposition the QR or adjust lighting.",
  ];


  //PAGE ANIMATION
  useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    //PROCESS IMAGE LEFT AND RIGHT BUTTONS
    const pressIn = (anim) => {
      Animated.spring(anim, {
        toValue: 0.92,
        useNativeDriver: true,
      }).start();
    };
  
    const pressOut = (anim) => {
      Animated.spring(anim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    };
  
    //PROCESS IMAGE LEFT AND RIGHT BUTTONS ANIMATION
    const [hoverLeft, setHoverLeft] = useState(false);
    const [hoverRight, setHoverRight] = useState(false);



  return (
    <Animated.View style = 
      {{ 
        opacity: fadeAnim,
        flex: 1,
        transform: [{ translateY: slideAnim }],
        }}>
    
    <ScrollView
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      contentContainerStyle={{
        alignItems: "center",
        paddingVertical: 60,
        paddingHorizontal: 40,
      }}
    >

      {/* HEADER */}
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

      {/* SCANNER AND INSTRUCTION BOX*/}
      <View
        style={{
          flexDirection: isMobile ? "column" : "row",
          gap: 20,
          marginBottom: 20,
          alignItems: "center",
        }}
      >
        {/* SCANNER BOX */}
        <View
          id="qr-reader"
          style={{
            width: isMobile ? 300: 400, 
            height: isMobile ? 300: 400,
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

        {/* INSTRUCTION BOX */}
        <View
          style={{
            width: isMobile ? 300: 400, 
            height: isMobile ? 300: 400,
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
                <Text style={{ fontSize: 16, color: "#4A70A9", marginRight: 10, fontWeight: "bold" }}>
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

      {/* BUTTONS */}
      <View style={{ flexDirection: "row", gap: 15, marginBottom: 20 }}>
        <Pressable
          onPress={startScanner}
          style={{
            backgroundColor: "#4A70A9",
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
              color: "#ffffffff",
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

      {/* ALERT MESSAGES*/}
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
              color: "#4A70A9",
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
            borderColor: "#4A70A9",
            borderRadius: 12,
            padding: 12,
            marginBottom: 20,
            width: "100%",
          }}
        >
          <Text
            style={{
              color: "#4A70A9",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            ⚠️ {product.message}
          </Text>
        </View>
      )}

    {/* MODAL */}
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
          maxHeight: "85%", 
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
            {/* PRODUCT IMAGE */}
            {productDetails.product_image && (
              <Image
                source={{ uri: productDetails.product_image }}
                style={{ width: "100%", height: 280, borderRadius: 12, resizeMode: "wrap" }}
              />
            )}
            {/* NEW CODE */}
            {/* Close Button */}
            <View style={{position: "absolute", top: 15, right: 15, zIndex: 10,}}>
              <Pressable
                onHoverIn={() => setHoverClose(true)}
                onHoverOut={() => setHoverClose(false)}
                onPress={() => setModalVisible(false)}
                style={{
                borderWidth: 1,
                borderColor: "#000",
                backgroundColor: hoverClose
                  ? "#C0392B"
                  : "#fff",
                borderRadius: 50,
                paddingVertical: 8,
                paddingHorizontal: 12,
                
              }}
              >
              <Ionicons name="close" size={18} color="#000" />
              </Pressable>
            </View>

            {/* Registered Product Name */}
              <View style={{ paddingHorizontal: 20, paddingVertical: 10, alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontFamily: "Garet-Heavy",
                    marginBottom: 1,
                    textAlign: "center",
                    color: "#333",
                  }}
                >
                  {productDetails.name}
                </Text>
              </View>
            {/* END NEW CODE */}

            {/* SCROLL FUNCTION */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 20, paddingBottom: 10, paddingTop: 0 }}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true} 
            >

              <View style={{ height: 1, backgroundColor: "#e0e0e0", marginVertical: 5, }} />

              {/* REGISTERED ARTISAN NAME*/}
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Montserrat-Regular",
                  marginBottom: 2,
                  color: "#555",
                  textAlign: "left",
                  fontWeight: "700",
                }}
              >
                Registered Artisan:
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Montserrat-Regular",
                  marginBottom: 10,
                  color: "#000000",
                  textAlign: "left",
                  fontWeight: "700",
                }}
              >
                {registered_business_name ? `${registered_business_name}` : ""}
              </Text>
              
              { /* */}
              <View style={{ gap: 6, borderColor: "#706d6d", borderWidth: 1, borderRadius: 5, }}>
                <Text style={{ fontSize: 16, fontFamily: "Montserrat-Regular", color: "#444" }}>
                  <Text style={{ fontWeight: "700" }}>Type: </Text>{productDetails.type}
                </Text>
                <Text style={{ fontSize: 16, fontFamily: "Montserrat-Regular", color: "#444" }}>
                  <Text style={{ fontWeight: "700" }}>Materials: </Text>{productDetails.materials}
                </Text>
                <Text style={{ fontSize: 16, fontFamily: "Montserrat-Regular", color: "#444" }}>
                  <Text style={{ fontWeight: "700" }}>Origin: </Text>{productDetails.origin}
                </Text>
                <Text style={{ fontSize: 16, fontFamily: "Montserrat-Regular", color: "#444" }}>
                  <Text style={{ fontWeight: "700" }}>Production Date: </Text>{productDetails.productionDate}
                </Text>
              </View>
              <View style={{ gap: 6 }}>
                <Text style={{ marginTop: 10, fontWeight: "700", fontSize: 16, fontFamily: "Montserrat-Regular", color: "#000000" }}>
                  Description:
                </Text>
                <Text style={{ color: "#000000", fontFamily: "Montserrat-Regular", lineHeight: 20, borderColor: "#706d6d", borderWidth: 1, borderRadius: 5, }}>
                  {productDetails.description}
                </Text>
              </View>
              {processImages.length > 0 && (
                    <View style={{ marginBottom: 20, marginTop: 20,}}>
                      <Text
                        style={{
                          fontFamily: "Montserrat-Regular",
                          fontWeight: "600",
                          marginBottom: 8,
                        }}
                      >
                        Images of the Process
                      </Text>

                      <View style={{ position: "relative" }}>
                        {/* LEFT BUTTON */}
                        {activeIndex > 0 && (
                          <Animated.View
                            style={{
                              transform: [{ scale: leftScale }],
                              position: "absolute",
                              left: 6,
                              top: "45%",
                              zIndex: 10,
                            }}
                          >
                            <Pressable
                              onHoverIn={() => setHoverLeft(true)}
                              onHoverOut={() => setHoverLeft(false)}
                              onPressIn={() => pressIn(leftScale)}
                              onPressOut={() => pressOut(leftScale)}
                              onPress={() => {
                                const newIndex = activeIndex - 1;
                                isProgrammaticScroll.current = true;
                                setActiveIndex(newIndex);

                                scrollRef.current?.scrollTo({
                                  x: newIndex * ITEM_WIDTH,
                                  animated: true,
                                });

                                setTimeout(() => {
                                  isProgrammaticScroll.current = false;
                                }, 300);
                              }}
                              style={{
                                backgroundColor: hoverLeft
                                  ? "rgba(0,0,0,0.65)"
                                  : "rgba(0,0,0,0.4)",
                                borderRadius: 20,
                                padding: 6,
                              }}
                            >
                              <Ionicons
                                name="chevron-back"
                                size={22}
                                color={hoverLeft ? "#fff" : "#e6e6e6"}
                              />
                            </Pressable>
                          </Animated.View>
                        )}

                        {/* RIGHT BUTTON */}
                        {activeIndex < processImages.length - 1 && (
                          <Animated.View
                            style={{
                              transform: [{ scale: rightScale }],
                              position: "absolute",
                              right: 6,
                              top: "45%",
                              zIndex: 10,
                            }}
                          >
                            <Pressable
                              onHoverIn={() => setHoverRight(true)}
                              onHoverOut={() => setHoverRight(false)}
                              onPressIn={() => pressIn(rightScale)}
                              onPressOut={() => pressOut(rightScale)}
                              onPress={() => {
                                const newIndex = activeIndex + 1;
                                isProgrammaticScroll.current = true;
                                setActiveIndex(newIndex);

                                scrollRef.current?.scrollTo({
                                  x: newIndex * ITEM_WIDTH,
                                  animated: true,
                                });

                                setTimeout(() => {
                                  isProgrammaticScroll.current = false;
                                }, 300);
                              }}
                              style={{
                                backgroundColor: hoverRight
                                  ? "rgba(0,0,0,0.65)"
                                  : "rgba(0,0,0,0.4)",
                                borderRadius: 20,
                                padding: 6,
                              }}
                            >
                              <Ionicons
                                name="chevron-forward"
                                size={22}
                                color={hoverRight ? "#fff" : "#e6e6e6"}
                              />
                            </Pressable>
                          </Animated.View>
                        )}

                      
                        <ScrollView
                          ref={scrollRef}
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          snapToInterval={ITEM_WIDTH}
                          decelerationRate="fast"
                          contentContainerStyle={{ paddingRight: 10 }}
                          onScroll={(e) => {
                            if (isProgrammaticScroll.current) return;

                            const offsetX = e.nativeEvent.contentOffset.x;
                            const index = Math.round(offsetX / ITEM_WIDTH);

                            setActiveIndex(
                              Math.max(0, Math.min(index, processImages.length - 1))
                            );
                          }}
                          scrollEventThrottle={16}


                        >
                          {processImages.map((img, index) => (
                            <View
                              key={index}
                              style={{
                                width: 350,
                                height: 350,
                                marginRight: 10,
                                borderRadius: 16,
                                overflow: "hidden",
                                backgroundColor: "#f2f2f2",
                              }}
                            >
                              <Image
                                source={{ uri: img }}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  resizeMode: "cover",
                                }}
                              />
                            </View>
                          ))}
                       
                        </ScrollView>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            marginTop: 10,
                          }}
                        >
                          {processImages.map((_, index) => (
                            <View
                              key={index}
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                marginHorizontal: 4,
                                backgroundColor:
                                  activeIndex === index ? "#000" : "#cfcfcf",
                              }}
                            />
                          ))}
                        </View>
                      </View>
                    </View>
                  )}
            </ScrollView>
          </>
        )}
      </View>
    </View>
  </Modal>
</ScrollView>
</Animated.View>
  );
}
