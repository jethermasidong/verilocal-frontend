import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useFonts } from "expo-font";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Dimensions, Image, Modal, Pressable, ScrollView, Text, View } from "react-native";
import BackButton from "../../components/BackButton";
export default function ProductScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [qrData, setQrData] = useState(null);

  //MODAL
  const [product, setProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [registered_business_name, setBusinessName] = useState("");
  const [businessLogo, setBusinessLogo] = useState("");
  

  const [isLoading, setIsLoading] = useState(false);

  // RESULT MODAL SYSTEM
  const [resultVisible, setResultVisible] = useState(false);
  const [resultType, setResultType] = useState(null);
  const [resultMessage, setResultMessage] = useState("");

  const resultScale = useRef(new Animated.Value(0.8)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;

  //PROCESS IMAGES
  const processImages = Array.isArray(productDetails?.process_images)
    ? productDetails.process_images
    : typeof productDetails?.process_images === "string"
    ? (() => {
      try {
        return JSON.parse(productDetails.process_images);
      } catch {
        return [];
      }
    }) ()
    : [];

  //MOBILE DIMENSION
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(Dimensions.get("window").width < 600);
    handleResize();
    Dimensions.addEventListener("change", handleResize);
    return () => Dimensions.removeEventListener("change", handleResize);
  }, []);

  //CAROUSEL
  const IMAGE_SIZE = isMobile ? 270 : 340;
  const ITEM_WIDTH = IMAGE_SIZE + 10;
  const scrollRef = useRef(null);
  const isProgrammaticScroll = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const leftScale = useRef(new Animated.Value(1)).current;
  const rightScale = useRef(new Animated.Value(1)).current;


  //HOVER CLOSE BUTTON
  const [hoverClose, setHoverClose] = useState(false);



  const uploadQrImage = async () => {
    await stopScanner();
    try{
      const {Html5Qrcode} = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode("qr-reader");
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);

        try {
          const decodedText = await html5QrCode.scanFile(file, false);
          handleDecodedQR(decodedText);
        } catch (err) {
          console.error(err);
          setError("Invalid QR image or unreadable.");
          setIsLoading(false);
        }
      };  
      input.click();
    } catch (err) {
      setError("Failed to upload image");
    }
  };

  //QRCODE SCANNER
  const Html5QrcodeRef = useRef(null);
  const startScanner = async () => {
    setError(null);
    setProduct(null);
    setQrData(null);
    setProductDetails(null);
    setIsScanning(true);
  
  //QR CODE FUNCTIONS
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const qrCodeScanner = new Html5Qrcode("qr-reader");
      Html5QrcodeRef.current = qrCodeScanner;

      await qrCodeScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 300, height: 300 } }, 
        async (decodedText) => {
          try {
            await Html5QrcodeRef.current.stop();
          } catch {}
          setIsScanning(false);
          handleDecodedQR(decodedText);
        },
        (scanError) => {
          console.warn("Scan error:", scanError);
        }
      );

    } catch (err) {
      setError("Failed to access camera");
      setIsScanning(false);
    }
  };

    const handleDecodedQR = async (decodedText) => {
      try {
        setQrData(decodedText);
        setIsScanning(false);
        setIsLoading(true);

        const [product_id_str, blockchain_hash] = decodedText.split("|");
        const product_id = Number(product_id_str);

        if (!product_id || !blockchain_hash)
          throw new Error("Invalid QR data format");

        let res;

        try {
          res = await axios.post(
            "https://verilocalph.onrender.com/api/products/verify",
            { product_id, blockchain_hash }
          );

          setProduct(res.data);
          setError(null);

        } catch (axiosErr) {

          const errorMessage =
            axiosErr.response?.data?.message ||
            "Verification failed. Please try again.";

          setError(errorMessage);
          showResult("error", errorMessage);
          return;
        }

        if (res.data.verified) {

          showResult(
            "success",
            res.data.message || "Product Verified!",
            () => {
              setModalVisible(true);
            }
          );

          const allRes = await axios.get(
            "https://verilocalph.onrender.com/api/products"
          );

          const matched = allRes.data.find((p) => p.id === product_id);

          if (matched) {
            setProductDetails(matched);

            if (matched.business_id) {
              try {
                const businessRes = await axios.get(
                  `https://verilocalph.onrender.com/api/business/${matched.business_id}`
                );
                setBusinessName(businessRes.data.registered_business_name);
                setBusinessLogo(businessRes.data.logo);
              } catch {
                setBusinessName("Unknown Business");
              }
            }
            setTimeout(() => {
              setModalVisible(true);
            }, 1200);
          }

        } else {

          showResult("error", res.data.message || "Product not verified.");
        }

      } catch (err) {

        const errorMessage = err.message || "Invalid QR or backend error";
        setError(errorMessage);
        showResult("error", errorMessage);
      } finally {
        setIsLoading(false);
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

    const showResult = (type, message, onSuccessDone = null) => {
      setResultType(type);
      setResultMessage(message);
      setResultVisible(true);

      resultScale.setValue(0.8);
      resultOpacity.setValue(0);

      Animated.parallel([
        Animated.spring(resultScale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(resultOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // ✅ If success → auto close after 3 seconds
      if (type === "success") {
        setTimeout(() => {
          setResultVisible(false);
          if (onSuccessDone) onSuccessDone();
        }, 3000);
      } else {
          showResult("error", res.data.message || "Product QR not Verified!");
      }
    };

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
    <BackButton fallback="/" forceFallback />

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
      <View style={{ flexDirection: isMobile? "column": "row", gap: 15, marginBottom: 20 }}>
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
              textAlign: "center",
            }}
          >
            START QR
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
              textAlign: "center",
            }}
          >
            STOP
          </Text>
        </Pressable>
        <Pressable
        onPress={uploadQrImage}
        style={{
          backgroundColor: "#656c75",
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
            textAlign: "center",
          }}
        >
          UPLOAD QR
        </Text>
      </Pressable> 
      </View>

      {/* Add this above the Button View */}
      {error && (
        <Text style={{ color: "red", marginBottom: 10, textAlign: "center", fontFamily: "Montserrat-Regular" }}>
          {error}
        </Text>
      )}
           
      

    {/* PRODUCT MODAL */}
      <Modal visible={modalVisible} animationType="fade" transparent>
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
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
          padding: 10,
        }}
      >
        {productDetails && (
          <>
            {/* PRODUCT IMAGE */}
            {productDetails.product_image && (
              <Image
                source={{ uri: productDetails.product_image }}
                style={{ width: "100%", height: isMobile? 240: 280, borderRadius: 12, resizeMode: "cover", }}
              />
            )}
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

            {/* SCROLL FUNCTION */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 20, paddingBottom: 10, paddingTop: 0 }}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true} 
            >

              <View style={{ height: 1, backgroundColor: "#e0e0e0", marginVertical: 5, }} />

              {/* REGISTERED ARTISAN NAME*/}
              <View style={{flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 10}}>
              {businessLogo && (
              <Pressable onPress={() => router.push(`/buyer/publicProfile?business_id=${productDetails.business_id}`)}>
              <Image
                source={ businessLogo ? { uri: businessLogo } : require("../../assets/images/placeholder.png")}
                style={{
                  borderRadius: 25,
                  borderWidth: 2,
                  width: 40,
                  height: 40,
                  borderColor: "#000000",
                }}
                resizeMode="cover"
              />
              </Pressable>
              )}
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Montserrat-Regular",
                  marginBottom: 2,
                  color: "#555",
                  textAlign: "left",
                  fontWeight: "700",
                }}
              >
              {registered_business_name ? `${registered_business_name}` : "Unknown"}
              </Text>
              </View>

              <View style={{ gap: 6, backgroundColor: "#f4f4f4", padding: 13, borderRadius: 12, borderWidth: 1, borderColor: "#d9d9d9"}}>
                <Text style={{ fontSize: 14, fontFamily: "Montserrat-Regular", color: "#444" }}>
                  <Text style={{ fontWeight: "700" }}>Type: </Text>{productDetails.type}
                </Text>
                <Text style={{ fontSize: 14, fontFamily: "Montserrat-Regular", color: "#444" }}>
                  <Text style={{ fontWeight: "700" }}>Materials: </Text>{productDetails.materials}
                </Text>
                <Text style={{ fontSize: 14, fontFamily: "Montserrat-Regular", color: "#444" }}>
                  <Text style={{ fontWeight: "700" }}>Origin: </Text>{productDetails.origin}
                </Text>
                <Text style={{ fontSize: 14, fontFamily: "Montserrat-Regular", color: "#444" }}>
                  <Text style={{ fontWeight: "700" }}>Production Date: </Text>{productDetails.productionDate}
                </Text>
              </View>
              <View style={{ gap: 6, backgroundColor: "#f4f4f4", padding: 13, borderRadius: 12, borderWidth: 1, borderColor: "#d9d9d9", marginTop: 15}}>
                <Text style={{ marginTop: 3, fontWeight: "700", fontSize: 14, fontFamily: "Montserrat-Regular", color: "#000000" }}>
                  Description:
                </Text>
                <Text style={{ color: "#000000", fontFamily: "Montserrat-Regular"}}>
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
                    Images of the Process:
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
                      snapToAlignment="center"
                      decelerationRate="fast"
                      contentContainerStyle={{
                        paddingHorizontal: 0,
                      }}
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
                            width: IMAGE_SIZE,
                            height: IMAGE_SIZE,
                            marginHorizontal: 5,
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
{isLoading && (
        <View
          style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
        }}
      >
        <View
          style={{
          backgroundColor: "#fff",
          padding: 20,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#5177b0" />
        <Text style={{ marginTop: 10 }}>Verifying Product, Please wait.</Text>
      </View>
    </View>
  )}
{resultVisible && (
  <View
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}
  >
    <Animated.View
      style={{
        backgroundColor: "#fff",
        padding: 30,
        borderRadius: 20,
        width: "85%",
        maxWidth: 380,
        alignItems: "center",
        transform: [{ scale: resultScale }],
        opacity: resultOpacity,
      }}
    >
      <Ionicons
        name={resultType === "success" ? "checkmark-circle" : "close-circle"}
        size={70}
        color={resultType === "success" ? "#2e7d32" : "#c62828"}
        style={{ marginBottom: 15 }}
      />

      <Text
        style={{
          fontSize: 20,
          fontWeight: "700",
          marginBottom: 10,
          color: resultType === "success" ? "#2e7d32" : "#c62828",
        }}
      >
        {resultType === "success" ? "Verified" : "Verification Failed"}
      </Text>

      <Text
        style={{
          textAlign: "center",
          marginBottom: 20,
          fontSize: 14,
          color: "#444",
        }}
      >
        {resultMessage}
      </Text>
      <Pressable
        onPress={() => {
          setResultVisible(false);

          if (resultType === "success") {
            setModalVisible(true);
          }
        }}
        style={{
          backgroundColor:
            resultType === "success" ? "#2e7d32" : "#c62828",
          paddingVertical: 10,
          paddingHorizontal: 25,
          borderRadius: 12,
          marginTop: 10,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>
          OK
        </Text>
      </Pressable>

    </Animated.View>
  </View>
)}
</Animated.View>
  );
}