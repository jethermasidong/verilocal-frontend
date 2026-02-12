import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { useFonts } from "expo-font";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  ImageBackground,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import bgImage from "../../assets/bg1.jpg";

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
  const [businessname, setRegisteredBusinessName] = useState(null);
  const [editModalVisible, setEditModalVisible] =useState(false);
  const [profileSidebarVisible, setProfileSidebarVisible] = useState(false);
  const profileBtnOpacity = useRef(new Animated.Value(1)).current;
  const [showProfileBtn, setShowProfileBtn] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState("");
  const [selectedMaterials, setSelectedMaterials] = useState("");

  const hoverAnimReport = useRef(new Animated.Value(0)).current;
  const hoverAnimFilter = useRef(new Animated.Value(0)).current;
  const onHoverIn = () => {
    Animated.spring(hoverAnimReport, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };
  const onHoverOut = () => {
    Animated.spring(hoverAnimReport, {
      toValue: 0, 
      useNativeDriver: true,
    }).start();
  };

  const onHoverIn1 = () => {
    Animated.spring(hoverAnimFilter, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };
  const onHoverOut1 = () => {
    Animated.spring(hoverAnimFilter, {
      toValue: 0, 
      useNativeDriver: true,
    }).start();
  };


  //FILTER AND CATEGORIZATION:
  const typeOptions = [...new Set(products.map(p => p.type).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b));
  const materialOptions = [...new Set(products.map(p => p.materials).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b));

  const toggleFilter = (value, selected, setSelected) => {
    setSelected(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };


  //EDIT FORM
  const [editForm, setEditForm] =useState({
    name: "",
    type: "",
    materials: "",
    origin: "",
    productionDate: "",
    description: "",
  });

  const processImages = Array.isArray(selectedProduct?.process_images)
    ? selectedProduct.process_images
    : typeof selectedProduct?.process_images === "string"
    ? JSON.parse(selectedProduct.process_images)
    : [];

  
  console.log("Process images:", processImages);



  useEffect(() => {
    const loadBusinessesName = async () => {
      const registered_business_name = await AsyncStorage.getItem("registered_business_name");
      if (registered_business_name) setRegisteredBusinessName(registered_business_name);
    };
    loadBusinessesName();
  }, []);

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

   useEffect(() => {
    fetchProducts();
  }, []);

  //Filter Function
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
    p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType =
      selectedTypes.length === 0 || selectedTypes.includes(p.type);

    const matchesMaterials =
      selectedMaterials.length === 0 || selectedMaterials.includes(p.materials);
    
    return matchesSearch && matchesType && matchesMaterials;
});

  const openModal = (product) => {
    setSelectedProduct(product);
    if (product.product_image) {
      Image.getSize(product.product_image, (width, height) => {
        setIsTallImage(height > width * 1.2);
      });
    setActiveIndex(0);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ x: 0, animated: false });
    }, 50);
    }
    setModalVisible(true);
  };

  const updateProduct = async (id) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const res = await axios.put(
      `http://localhost:3000/api/products/${id}`,
      editForm,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    await fetchProducts();
    setSelectedProduct(res.data);
    setEditModalVisible(false);
    setModalVisible(false);

    alert("Product updated successfully!");
  } catch (err) {
    console.error("Update failed:", err);
    alert("Failed to update product");
  }
};

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name || "",
      origin: product.origin || "",
      materials: product.materials || "",
      description: product.description || "",
      type: product.type?.toLowerCase() || "",
      productionDate: product.productionDate || "",
    });
    setEditModalVisible(true);
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
            body { text-align: center; padding: 20px; font-family: Arial; }
            img { width: 220px; height: 220px; margin-top: 20px; }
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

const deleteProduct = async (productId) => {
  try {
    const token = await AsyncStorage.getItem("token");
    await axios.delete(
      `http://localhost:3000/api/products/${productId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setModalVisible(false);
    alert("Product deleted successfully!");
  } catch (error) {
    console.error("Delete Failed", error);
    alert("Failed to delete product");
  }
};

 const handleInputChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const [fontsLoaded] = useFonts({
    "Garet-Book": require("../../assets/fonts/garet/Garet-Book.ttf"),
    "Garet-Heavy": require("../../assets/fonts/garet/Garet-Heavy.ttf"),
    "Montserrat-Regular": require("../../assets/fonts/Montserrat/static/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("../../assets/fonts/Montserrat/static/Montserrat-Bold.ttf"),
    "Montserrat-Black": require("../../assets/fonts/Montserrat/static/Montserrat-Black.ttf"),
  });




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

    useEffect(() => {
      const fetchBusinessProfile = async () => {
        try {
          const token = await AsyncStorage.getItem("token");

          const res = await axios.get(
            "http://localhost:3000/api/business/profile",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          setBusiness(res.data);
        } catch (err) {
          console.error("Failed to load business profile:", err);
        }
      };
      fetchBusinessProfile();
    }, []);

  const SIDEBAR_WIDTH = 280;
  const slideX = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;
  const [sidebarMounted, setSidebarMounted] = useState(false);

    useEffect(() => {
      if (profileSidebarVisible) {
        slideX.setValue(SIDEBAR_WIDTH);

        Animated.timing(slideX, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(slideX, {
          toValue: SIDEBAR_WIDTH,
          duration: 500,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }).start(() => {
          setSidebarMounted(false);
        });
      }
    }, [profileSidebarVisible]);

     useEffect(() => {
    if (profileSidebarVisible) {
      // fade OUT
      Animated.timing(profileBtnOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setShowProfileBtn(false); // unmount after fade-out
      });
    } else {
      // mount first, then fade IN
      setShowProfileBtn(true);
      Animated.timing(profileBtnOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [profileSidebarVisible]);

  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isProgrammaticScroll = useRef(false);

  const ITEM_WIDTH = 350 + 10; // image width + marginRight

  {/* Register Button Hover Animations */}
  const [hoverRegister, setHoverRegister] = useState(false);

  {/* Image Carousel Scroll and Button on Click Animations */}
  const leftAnim = useRef(new Animated.Value(1)).current;
  const rightAnim = useRef(new Animated.Value(1)).current;

  const leftScale = useRef(new Animated.Value(1)).current;
  const rightScale = useRef(new Animated.Value(1)).current;

  //Product Modal Left and Right Button Animations 
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

  //Product Modal Left and Right Button Hover Animation 
  const [hoverLeft, setHoverLeft] = useState(false);
  const [hoverRight, setHoverRight] = useState(false);

  //Close, Edit, Delete, Print, Download Button Product Modal Hover Animation 
  const [hoverClose, setHoverClose] = useState(false);
  const [hoverEdit, setHoverEdit] = useState(false);
  const [hoverDelete, setHoverDelete] = useState(false);
  const [hoverPrint, setHoverPrint] = useState(false);
  const [hoverDownload, setHoverDownload] = useState(false);


  const filterRef = useRef(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterPos, setFilterPos] = useState({ x: 0, y: 0, width: 0 });

  return (

    <ImageBackground
      source={bgImage} 
      style={{flex: 1, width: '100%', height: '100%',}}
      imageStyle={{ opacity: 0.3}}
      resizeMode="cover"
    >

    <Animated.View style = 
      {{ 
        opacity: fadeAnim,
        flex: 1,
        transform: [{ translateY: slideAnim }],
      }}>
    <ScrollView
      style={{ flex: 1, }}
      contentContainerStyle={{ alignItems: "center", paddingVertical: 40, paddingHorizontal: 20 }}
    >
      {/* Welcome Section */}
      <View style={{ 
        width: "100%", 
        maxWidth: 900, 
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
            fontSize: isMobile ? 22 : 32,
            fontFamily: "Garet-Heavy",
            color: "#000",
            textAlign: isMobile ? "center" : "left",
          }}
        >
          Welcome,
        </Text>
        <Text
          style={{
            fontSize: isMobile ? 20 : 28,
            fontFamily: "Montserrat-Black",
            color: "#4A70A9",
            textAlign: isMobile ? "center" : "left",
            marginTop: 5,
          }}
        >
          {businessname || ""}
        </Text>
      </View>

      {/* Header Controls */}
      <View
        style={{
          width: "100%",
          maxWidth: 900,
          borderWidth: 2,
          borderColor: "#000",
          borderRadius: 20,
          paddingVertical: 15,
          paddingHorizontal: 20,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 4,
          marginBottom: 20,
          gap: 10,
        }}
      >
        <Text
          style={{
            fontSize: isMobile ? 18 : 28,
            fontFamily: "Garet-Heavy",
            color: "#000",
            letterSpacing: 1,
            textAlign: isMobile ? "center" : "left",
          }}
        >
          Business Dashboard
        </Text>
      </View>
        <View
          style={{
            width: "100%",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            maxWidth: 900,
            alignSelf: "center",
            marginBottom: 15,
          }}
        >
        {/* New Code */}
        <View 
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            width: isMobile ? "100%" : "70%",
            position: "relative",
          }}>
          <TextInput
            placeholder="Search products..."
            placeholderTextColor="#000000"
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 18,
              borderWidth: 2,
              borderColor: "#000",
              borderRadius: 32,
              fontFamily: "Montserrat-Regular",
            }}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setVisibleCount(9999);
            }}
          />
          <Animated.View 
            style={{
              transform: [
                {
                  translateY: hoverAnimFilter.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -6],
                  }),
                },
              ],
            }}
          >
          <Pressable
            onHoverIn={onHoverIn1}
            onHoverOut={onHoverOut1}
            style={{
              paddingVertical: 14,
              paddingHorizontal: 10,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer", 
            }}
            ref={filterRef}
            onPress={() => {
              filterRef.current?.measureInWindow((x, y, width, height) => {
                setFilterPos({
                  x,
                  y: y + height, 
                  width,
                });
                setShowFilter(true);
              });
            }}
          >
            <Ionicons name="funnel-outline" size={30} />
          </Pressable>
          </Animated.View>

          {/* Report Generation Button */}
          <Animated.View 
            style={{
              transform: [
                {
                  translateY: hoverAnimReport.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -6],
                  }),
                },
              ],
            }}
          >
          <Pressable
          onHoverIn={onHoverIn}
          onHoverOut={onHoverOut}
          style={{
            paddingVertical: 14,
            paddingHorizontal: 10,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer", 
          }}
            ref={filterRef}
            onPress={() => {
            }}
          >
            <Ionicons name="archive-outline" size={30} />
          </Pressable>
          </Animated.View>
        </View>
        <Pressable
          style={{
            width: isMobile ? "100%" : "29%",
            backgroundColor: "#4A70A9",
            paddingVertical: 14,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 3,
            borderColor: "#000",
            borderWidth: 2,
            elevation: 3,
            borderRadius: 20,
          }}
          onPress={() => router.push("/business/productRegistration")}
        >
          <Text
            style={{
              color: "#fff",
              fontFamily: "Montserrat-Bold",
              fontSize: 14,
              letterSpacing: 0.5
            }}
          >
            + Register
          </Text>
        </Pressable>
      </View>

      {/* Product List */}
      <View style={{ width: "100%", maxWidth: 900 }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Montserrat-Regular",
            marginBottom: 10,
            textAlign: isMobile ? "center" : "left",
          }}
        >
          Total Products: {filteredProducts.length}
        </Text>

        <FlatList
          data={filteredProducts.slice(0, visibleCount)}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View
              style={{
                borderWidth: 2,
                borderColor: "#000",
                borderRadius: 14,
                padding: 16,
                marginBottom: 16,
                width: "100%",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {item.product_image && (
                  <Image
                    source={{ uri: item.product_image }}
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: 10,
                      resizeMode: "cover",
                    }}
                  />
                )}

                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "bold", fontSize: 14 }}>
                    {item.name}
                  </Text>
                </View>

                <Pressable
                  onPress={() => openModal(item)}
                  style={{
                    borderWidth: 2,
                    borderColor: "#000",
                    borderRadius: 20,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="eye-outline" size={18} color="#000" />
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

       {/* Profile Button */}
          <View
            style={{
              position: "absolute",
              right: 20,
              top: 20,
              zIndex: 999,
            }}
          >
            {showProfileBtn && (
              <Animated.View style={{ opacity: profileBtnOpacity }}>
                <Pressable
                  onPress={() => {
                    setSidebarMounted(true);
                    setProfileSidebarVisible(true);
                  }}
                >
                  {business?.logo ? (
                    <Image
                      source={{ uri: business.logo }}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 50,
                        resizeMode: "contain",
                        borderWidth: 1,
                        borderColor: "#000",
                        backgroundColor: "#fff",
                      }}
                    />
                  ) : (
                    <Ionicons
                      name="person-circle-outline"
                      size={60}
                      color="#000"
                    />
                  )}
                </Pressable>
              </Animated.View>
            )}
          </View>

      {/* BUSINESS PROFILE SIDEBAR */}
      <Modal visible={sidebarMounted} animationType="none" transparent>
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
          onPress={() => setProfileSidebarVisible(false)}
        >
          {/* Sidebar Animation */}
          <Animated.View
            style={{
              width: 280,
              height: 600,
              backgroundColor: "#fff",
              padding: 20,
              borderTopLeftRadius: 16,
              borderBottomLeftRadius: 16,
              marginTop: 170,
              transform: [{ translateX: slideX }],
            }}
          >
            <View
              style={{
                width:250,
                backgroundColor: "#fff",
                padding: 20,
                borderTopRightRadius: 16,
                borderBottomRightRadius: 16,
              }}
            >
              {/* PROFILE */}
              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <Ionicons
                  name="storefront-outline"
                  size={60}
                  color="#4A70A9"
                  style={{ marginBottom: 6 }}
                />
                <Text style={{ fontSize: 16, fontWeight: "700" }}>
                  {businessname || "Your Business"}
                </Text>
                <Text style={{ fontSize: 12, color: "#666" }}>
                  Business Account
                </Text>
              </View>

              {/* ACTIONS */}
              <Pressable
                style={{
                  borderWidth: 1,
                  borderRadius: 10,
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  marginBottom: 10,
                }}
                onPress={() => {
                  setProfileSidebarVisible(false);
                  router.push("/business/manageAccount");
                }}
              >
                <Text style={{ textAlign: "center", fontWeight: "600" }}>
                  Manage Account
                </Text>
              </Pressable>

              <Pressable
                style={{
                  backgroundColor: "#000",
                  borderRadius: 10,
                  paddingVertical: 12,
                }}
                onPress={async () => {
                  await AsyncStorage.clear();
                  router.replace("/login-business");
                }}
              >
                <Text style={{ color: "#fff", textAlign: "center", fontWeight: "700" }}>
                  Logout
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </Pressable>
      </Modal>

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
            {/* CLOSE BUTTON */}
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
                borderRadius: 100,
                paddingVertical: 8,
                paddingHorizontal: 12,
                
              }}
              >
              <Ionicons name="close" size={18} color="#000" />
              </Pressable>
            </View>
            {selectedProduct && (
              <>
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

                <ScrollView
                  style={{ flexGrow: 1 }}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={{ fontSize: 24, fontFamily: "Garet-Heavy", marginBottom: 6, }}>
                    {selectedProduct.name}
                    <View style={{ flexDirection: "row", gap: 3, position: "absolute", right: 0, top: 0, }}>
                      <View style={{position: "auto", }}>
                        {/* EDIT PRODUCT BUTTON */}
                        <Pressable
                        onPress={() => openEditModal(selectedProduct)}
                        onHoverIn={() => setHoverEdit(true)}
                        onHoverOut={() => setHoverEdit(false)}
                        style={{
                          borderWidth: 1,
                          borderColor: "rgb(139, 132, 132)",
                          borderRadius: 50,
                          backgroundColor: hoverEdit
                            ? "#a7a5a5"
                            : "#fff",
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          
                        }}
                        >
                        <Ionicons name="create-outline" size={18} color="#000" />
                        </Pressable>
                      </View>
                    <View style={{position: "auto",}}>
                        {/* DELETE PRODUCT BUTTON */}
                        <Pressable
                          onPress={() => {
                            if (window.confirm("Are you sure you want to delete this product?")) {
                              deleteProduct(selectedProduct.id);
                            }
                          }}
                          onHoverIn={() => setHoverDelete(true)}
                          onHoverOut={() => setHoverDelete(false)}
                          style={{
                            borderWidth: 1,
                            borderColor: "rgb(139, 132, 132)",
                            backgroundColor: hoverDelete
                              ? "#a7a5a5"
                              : "#fff",
                            borderRadius: 50,
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                          }} 
                        >
                        <Ionicons name="trash-outline" size={18} color="#000" />
                        </Pressable>
                      </View>
                    </View>
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
                  {Array.isArray(processImages) && processImages.length > 0 && (
                    <View style={{ marginBottom: 20 }}>
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
                  <View 
                    style={{
                      flexDirection: "row", gap: 3, position: "absolute", right: 5, top: 5,
                    }}
                  >
                    <Pressable
                      onHoverIn={() => setHoverPrint(true)}
                      onHoverOut={() => setHoverPrint(false)}
                      onPress={() => printQRCode(selectedProduct.qr_code)}
                      style={{
                        borderWidth: 1,
                        borderColor: "rgb(139, 132, 132)",
                        borderRadius: 50,
                        backgroundColor: hoverPrint
                          ? "#a7a5a5"
                          : "#fff",
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="print-outline" size={16} color="#000" />
                    </Pressable>

                    <Pressable
                      onHoverIn={() => setHoverDownload(true)}
                      onHoverOut={() => setHoverDownload(false)}
                      onPress={() => downloadQRCode(selectedProduct.qr_code)}
                      style={{
                        borderWidth: 1,
                        borderColor: "rgb(139, 132, 132)",
                        borderRadius: 20,
                        backgroundColor: hoverDownload
                          ? "#a7a5a5"
                          : "#fff",
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="download-outline" size={16} color="#000" />
                    </Pressable>
                    </View>

                    {selectedProduct?.qr_code && (
                      <Image
                        source={{ uri: selectedProduct.qr_code }}
                        style={{ width: 200, height: 220, borderRadius: 8 }}
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
                          backgroundColor: "#4A70A9",
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
                            color: "#ffffffff",
                          }}
                        >
                          VIEW BLOCKCHAIN
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
      {/* EDIT PRODUCT MODAL */}
      <Modal visible={editModalVisible} animationType="fade" transparent>
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
              borderRadius: 16,
              width: "90%",
              maxWidth: 420,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>
              Edit Product
            </Text>

            <TextInput
              placeholder="Product Name"
              value={editForm.name}
              onChangeText={(t) => setEditForm({ ...editForm, name: t })}
              style={{ borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 8 }}
            />

            <View
              style={{ borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 8 }}>
              <Picker
                selectedValue={editForm.type}
                onValueChange={(v) => {
                handleInputChange("type", v);
                handleInputChange("materials", "");
              }}
              style={{ borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, backgroundColor: "#fafafa", width: "100%",fontFamily: "Montserrat-Regular", fontSize: 16}}
            >
              <Picker.Item label="Select Type" value="" />
              <Picker.Item label="Woodcraft" value="woodcraft" />
              <Picker.Item label="Textile" value="textile" />
              <Picker.Item label="Jewelry" value="jewelry" />
            </Picker>
            </View>
            {editForm.type === "woodcraft" && (
              <View style={{ borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 8 }}>
                <Picker 
                selectedValue={editForm.materials}
                onValueChange={(v) => handleInputChange("materials", v)}
                style={{ borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, backgroundColor: "#fafafa", width: "100%",fontFamily: "Montserrat-Regular", fontSize: 16 }}
                >
                  <Picker.Item label="Select Material" value="" />
                  <Picker.Item label="Kamagong Wood" value="Kamagong Wood" />
                  <Picker.Item label="Acacia Wood" value="Acacia Wood" />
                  <Picker.Item label="Pine Wood" value="Pine Wood" />
                </Picker>
                </View>
            )}  

            <TextInput
              placeholder="Origin"
              value={editForm.origin}
              onChangeText={(t) => setEditForm({ ...editForm, origin: t })}
              style={{ borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 8 }}
            />

            <TextInput
              placeholder="Production Date"
              value={editForm.productionDate}
              onChangeText={(t) =>
                setEditForm({ ...editForm, productionDate: t })
              }
              style={{ borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 8 }}
            />

            <TextInput
              placeholder="Description"
              multiline
              value={editForm.description}
              onChangeText={(t) =>
                setEditForm({ ...editForm, description: t })
              }
              style={{
                borderWidth: 1,
                borderRadius: 8,
                padding: 10,
                height: 80,
                marginBottom: 12,
              }}
            />

            <Pressable
              onPress={() => {
                if (selectedProduct?.id) {
                  updateProduct(selectedProduct.id);
                } else {
                  alert("No product selected!");
                }
              }}
              style={{
                backgroundColor: "#4A70A9",
                paddingVertical: 10,
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: "#fff", textAlign: "center", fontWeight: "700" }}>
                SAVE
              </Text>
            </Pressable>

            <Pressable
              style={{
                backgroundColor: "#000",
                paddingVertical: 10,
                borderRadius: 8,
              }}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={{ color: "#fff", textAlign: "center", fontWeight: "700" }}>
                CANCEL
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>

     {/* New Code */}
    <Modal visible={showFilter} transparent animationType="fade">
      {/* Click outside to close */}
      <Pressable
        style={{ flex: 1 }}
        onPress={() => setShowFilter(false)}
      >
        <View
          style={{
            position: "absolute",
            top: filterPos.y + 6,
            left: filterPos.x - 140,
            width: 180,
            backgroundColor: "#fff",
            borderWidth: 2,
            borderColor: "#000",
            borderRadius: 12,
            paddingVertical: 6,
            marginTop: 5,
            elevation: 50,
            zIndex: 99999,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 6,
          }}
        >
          <View style={{ marginBottom: 10, marginLeft: 10, }}>
            {/* TYPE FILTER */}
            <Text style={{ fontWeight: "600", marginBottom: 6, fontFamily: "Montserrat-Regular", }}>Type</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {typeOptions.map(type => (
                <Pressable
                  key={type}
                  onPress={() => toggleFilter(type, selectedTypes, setSelectedTypes)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <Ionicons
                    name={
                      selectedTypes.includes(type)
                        ? "checkbox"
                        : "square-outline"
                    }
                    size={18}
                  />
                  <Text style={{fontFamily: "Montserrat-Regular",}}>{type}</Text>
                </Pressable>
              ))}
            </View>

            {/* MATERIAL FILTER */}
            <Text style={{ fontWeight: "600", marginVertical: 6, fontFamily: "Montserrat-Regular",}}>Material</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {materialOptions.map(mat => (
                <Pressable
                  key={mat}
                  onPress={() =>
                    toggleFilter(mat, selectedMaterials, setSelectedMaterials)
                  }
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <Ionicons
                    name={
                      selectedMaterials.includes(mat)
                        ? "checkbox"
                        : "square-outline"
                    }
                    size={18}
                  />
                  <Text style={{fontFamily: "Montserrat-Regular",}}>{mat}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Pressable>
    </Modal>
  </Animated.View>
</ImageBackground>
  );
}