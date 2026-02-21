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
  Platform,
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

  //Product Count
  const [visibleCount, setVisibleCount] = useState(5);

  //Loading
  const [loading, setLoading] = useState(true);


  const [selectedProduct, setSelectedProduct] = useState(null);

  //Modal
  const [modalVisible, setModalVisible] = useState(false);

  //Search
  const [searchQuery, setSearchQuery] = useState("");


  const [isTallImage, setIsTallImage] = useState(false);

  //Business Name
  const [businessname, setRegisteredBusinessName] = useState(null);

  //Edit Modal
  const [editModalVisible, setEditModalVisible] = useState(false);

  //Profile Sidebar
  const [profileSidebarVisible, setProfileSidebarVisible] = useState(false);
  const profileBtnOpacity = useRef(new Animated.Value(1)).current;
  const [showProfileBtn, setShowProfileBtn] = useState(true);

  //Types and Materials
  const [selectedTypes, setSelectedTypes] = useState("");
  const [selectedMaterials, setSelectedMaterials] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
  const [editForm, setEditForm] = useState({
    name: "",
    type: "",
    materials: "",
    origin: "",
    productionStartDate: "",
    productionEndDate: "",
    productionDate: "",
    description: "",
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (!selectedDate) return;

    if(dateType === "start") {
      if (editForm.productionEndDate && selectedDate > new Date(editForm.productionEndDate)) {
        handleInputChange
      }
      handleInputChange("productionStartDate", selectedDate);
    } else if (dateType === "end") {
        if (editForm.productionStartDate && selectedDate < new Date(editForm.productionStartDate)) {
          Alert.alert("Invalid Date", "End date cannot be earlier than the start date.");
          return;
          }
          handleInputChange("productionEndDate", selectedDate);
        }
      };

    useEffect(() => {
        if (editForm.productionStartDate && editForm.productionEndDate) {
          const start = formatDate(editForm.productionStartDate);
          const end = formatDate(editForm.productionEndDate);
          setEditForm(prev => ({
            ...prev,
            productionDate: `${start} - ${end}`,
          }));
        }
      }, [editForm.productionStartDate, editForm.productionEndDate]);

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
    let start = "";
    let end = "";

    if (product.productionDate?.includes(" - ")) {
      const parts = product.productionDate.split(" - ");
      start = parts[0];
      end = parts[1];
    }
    setSelectedProduct(product);
    setEditForm({
      name: product.name || "",
      origin: product.origin || "",
      materials: product.materials || "",
      description: product.description || "",
      type: product.type?.toLowerCase() || "",
      productionStart: start,
      productionEnd: end,
      productionDate: product.productionDate || "",
    });
    setEditModalVisible(true);
  };

  useEffect(() => {
    if (editForm.productionStart && editForm.productionEnd) {
      setEditForm(prev => ({
        ...prev,
        productionDate: `${prev.productionStart} - ${prev.productionEnd}`,
      }));
    }
  }, [editForm.productionStart, editForm.productionEnd]);


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




  //QRCODE PRINT - using html
  const printQRCode = (qrUrl) => {
    if (!qrUrl) return;

    const printWindow = window.open("", "_blank", "width=350,height=450");

    const html = `
      <html>
        <head>
          <style>
            body { text-align: center; padding: 20px; font-family: Arial; }
            img { width: 250px; height: 250px; margin-top: 50px; }
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




  //REPORT GENERATION PRINT - using html
  const reportGenerator = () => {
    if (!business || products.length === 0) return;
    const today = new Date().toLocaleDateString();

    const html = `
    <html>
    <head>
      <title>Business Report</title>
      <style>
        body {
            font-family: Arial;
            padding: 40px;
            color: #111;
        }
        h1, h2, h3 {
            margin-top: 12px;
            margin-bottom: 5px;
            font-family:Arial, Helvetica, sans-serif;
        }
        .cover {
            text-align:center;
            margin-top: 40px;
        }
        .section {
            margin-top: 30px;
        }
        .information {
            margin-top: 30px;
            border: 1px solid #ccc;
            border-radius: 8px;
            padding-left: 20px;
        }
        .products {
            margin-top: 30px;
            border: 1px solid #ccc;
            border-radius: 8px;
            padding-left: 20px;
            padding-right: 20px;
            padding-bottom: 20px;
        }
        .summary-box {
            display:flex;
            gap: 20px;
            margin-top: 10px;
        }
        .card {
            border: 1px solid #ccc;
            padding: 14px;
            border-radius: 8px;
            flex: 1;
            text-align: center;
        }  
        .product {
            border: 1px solid #ccc;
            padding: 16px;
            border-radius: 10px;
            margin-bottom: 18px;
            page-break-inside: avoid;
        }
        .products img {
            max-width: 100%;
            max-height: 100%;
            object-fit: wrap;
            
        }
        table {
            width: 100%;
            margin-top: 10px;
        }
        td {
            padding: 4px;
        }
        .blockchain {
            background: #f4f4f4;
            padding: 12px;
            border-radius: 8px;
            margin-top: 2px;

        }
        .blockchain img {
            width: 100px;
            height: auto;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #777;
        }
        @media print {
          button {display:none}
        }
        .image-box {
              margin-top: 20px;
              width: 150px;
              height: 100px;     
              border-radius: 12px;
              background: #fff;
              border: 1px solid #ccc;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
        }

        .logo_img {
            display: block;
            margin: 0 auto 25px;
            width: 320px !important;
            max-width: none !important;
            height: auto;
        }

        
        .logo_img {
            margin-bottom: 20px;
            width: 300px;
            height: auto;
        }
        </style>
      </head>
    
      <body>
        <div class="cover">
            <img src="https://i.ibb.co/fVP96C9G/1771116726361-8a57e78d-bdd5-4b52-94f5-a008e1dfcf33.png" class="logo_img">
            <h1>${business.registered_business_name}</h1>
            <h2>Business Report</h2>
            <p>Generated ${today}</p>
            <p><strong>BY: VERILOCAL PH</strong></p>
        </div>

        <div class="information">
            <h1>Business Information</h1>
            <p><strong>Owner:</strong>${business.name || "-"} </p>
            <p><strong>Email:</strong>${business.email || "-"} </p>
            <p><strong>Address:</strong>${business.address || "-"} </p>
            <p><strong>Contact Number:</strong>${business.contact_no || "-"} </p>
        </div>

        <div class="section">
            <h2>Business Summary</h2>
            <div class="summary-box">
                <div class="card">
                    <h3>${products.length}</h3>
                    <p>Total Products</p>
                </div>
                <div class="card">
                    <h3>${[...new Set(products.map(p => p.type))].length}</h3>
                    <p>Product Types</p>
                </div>
                <div class="card">
                    <h3>${[...new Set(products.map(p => p.materials))].length}</h3>
                    <p>Materials</p>
                </div>
            </div>
        </div>

        <div class="products">
            <h2>Product Catalog</h2>
            ${products.map(p => `<div class="products">
                <div class="image-box">
                ${p.product_image ? `<img src="${p.product_image}"/>` : ""}
                </div>
                <h3>${p.name}</h3>
                <table>
                    <tr><td><strong>Type:</strong></td><td>${p.type}</td></tr>
                    <tr><td><strong>Materials:</strong></td><td>${p.materials}</td></tr>
                    <tr><td><strong>Origin:</strong></td><td>${p.origin}</td></tr>
                    <tr><td><strong>Production Date:</strong></td><td>${p.productionDate}</td></tr>
                </table>
                <p><strong>Description:</strong></p>
                <p>${p.description}</p>
                <p><strong>Transaction Hash:</strong></p>
                <p>${p.tx_hash  || "-"}</p>

                <div class="blockchain">
                    ${p.qr_code ? ` <img src="${p.qr_code}"/>` : ""}
                </div>

            </div>
            `).join("")}
            </div>

            <div class="footer">
                <p>Confidential - Generated by VERILOCAL.</p>
            </div>
            
            <script>
                window.onload = () => window.print();           
            </script>
      </body>
      </html>
      `;

      const win = window.open("", "_blank");
      win.document.write(html);
      win.document.close();
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
        setShowProfileBtn(false);
      });
    } else {
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

  const ITEM_WIDTH = 350 + 10; 

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
            onPress={reportGenerator}
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
                            setShowDeleteModal(true);
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

                  {/* Delete Modal */}
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
                            fontFamily: "Montserrat-Regular",
                            fontWeight: "bold",
                            marginBottom: 10,
                          }}
                        >
                          Delete Product
                        </Text>

                        <Text style={{ marginBottom: 20, fontFamily: "Montserrat-Regular"}}>
                          Are you sure you want to delete this product?
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
                            <Text style={{fontFamily: "Montserrat-Regular"}}>Cancel</Text>
                          </Pressable>

                          <Pressable
                            style={{
                              padding: 10,
                              backgroundColor: "#be4848",
                              borderRadius: 8,
                            }}
                            onPress={() => {
                              deleteProduct(selectedProduct.id);
                              setShowDeleteModal(false);
                            }}
                          >
                            <Text style={{ color: "#fff", fontFamily: "Montserrat-Regular" }}>Delete</Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  </Modal>


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
            <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12, fontFamily: 'Montserrat-Bold' }}>
              Edit Product
            </Text>

            <View style={{marginBottom: 7 }}>
              <Text style={{fontWeight: "600", marginTop: 0, marginBottom: 4, fontSize: 13, fontFamily: 'Montserrat-Regular',}}>Product Name*</Text>
              <TextInput
                placeholder="Product Name"
                value={editForm.name}
                onChangeText={(t) => setEditForm({ ...editForm, name: t })}
                style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 8, backgroundColor: "#fafafa", width: "100%",fontFamily: "Montserrat-Regular", fontSize: 13}}
              />
            </View>

            <View
              style={{marginBottom: 7 }}>
              <Text style={{fontWeight: "600", marginTop: 0, marginBottom: 4, fontSize: 13, fontFamily: 'Montserrat-Regular',}}>Type*</Text>
              <Picker
                selectedValue={editForm.type}
                onValueChange={(v) => {
                handleInputChange("type", v);
                handleInputChange("materials", "");
              }}
              style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 8, backgroundColor: "#fafafa", width: "100%",fontFamily: "Montserrat-Regular", fontSize: 13}}
            >
              <Picker.Item label="Select Type" value="" />
              <Picker.Item label="Woodcrafts" value="woodcraft" />
              <Picker.Item label="Weaving and Textiles" value="textile" />
              <Picker.Item label="Pottery" value="pottery" />
            </Picker>
            <Text style={{fontWeight: "600", marginTop: 6, marginBottom: 1, fontSize: 13, fontFamily: 'Montserrat-Regular',}}>Materials*</Text>
            </View>
            {editForm.type === "woodcraft" && (
              <View style={{marginBottom: 7 }}>
                <Picker 
                selectedValue={editForm.materials}
                onValueChange={(v) => handleInputChange("materials", v)}
                style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 8, backgroundColor: "#fafafa", width: "100%",fontFamily: "Montserrat-Regular", fontSize: 13 }}
                >
                  <Picker.Item label="Select Material" value="" />
                  <Picker.Item label="Kamagong" value="Kamagong" />
                  <Picker.Item label="Acacia" value="Acacia" />
                  <Picker.Item label="Narra" value="Narra" />
                  <Picker.Item label="Molave" value="Molave" />
                  <Picker.Item label="Mahogany" value="Mahogany" />
                  <Picker.Item label="Batikuling" value="Batikuling" />
                  <Picker.Item label="Gmelina" value="Gmelina" />
                </Picker>
                </View>
            )}  
            {editForm.type === "textile" && (
              <View style={{marginBottom: 7 }}>
                <Picker 
                selectedValue={editForm.materials}
                onValueChange={(v) => handleInputChange("materials", v)}
                style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 8, backgroundColor: "#fafafa", width: "100%",fontFamily: "Montserrat-Regular", fontSize: 13 }}
                >
                  <Picker.Item label="Select Material" value="" />
                  <Picker.Item label="Abaca" value="Abaca" />
                  <Picker.Item label="Piña" value="Piña" />
                  <Picker.Item label="Cotton" value="Cotton" />
                  <Picker.Item label="Silk" value="Silk" />
                  <Picker.Item label="Maguay" value="Maguay" />
                </Picker>
                </View>
            )} 
            {editForm.type === "pottery" && (
              <View style={{marginBottom: 7 }}>
                <Picker 
                selectedValue={editForm.materials}
                onValueChange={(v) => handleInputChange("materials", v)}
                style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 8, backgroundColor: "#fafafa", width: "100%",fontFamily: "Montserrat-Regular", fontSize: 13 }}
                >
                  <Picker.Item label="Select Material" value="" />
                  <Picker.Item label="Red Clay (Lutang Pula)" value="Stoneware Clay" />
                  <Picker.Item label="White Clay (Kaolin" value="White Clay (Kaolin)" />
                  <Picker.Item label="Stoneware Clay" value="Stoneware Clay" />
                </Picker>
                </View>
            )}    

            <View style={{marginBottom: 7 }}>
              <Text style={{fontWeight: "600", marginTop: 0, marginBottom: 4, fontSize: 13, fontFamily: 'Montserrat-Regular',}}>Origin*</Text>
              <TextInput
                placeholder="Origin"
                value={editForm.origin}
                onChangeText={(t) => setEditForm({ ...editForm, origin: t })}
                style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 8, backgroundColor: "#fafafa", width: "100%",fontFamily: "Montserrat-Regular", fontSize: 13}}
              />
            </View>

            <View style={{marginBottom: 7 }}>
              <Text style={{fontWeight: "600", marginTop: 0, marginBottom: 4, fontSize: 13, fontFamily: 'Montserrat-Regular',}}>Production Date* (Start to End)</Text>
                {Platform.OS === "web" ? (
                  <>
                  <input
                    type="date"
                    value={editForm.productionStartDate}
                    onChange={(e) =>
                    setEditForm({...editForm, productionStartDate: e.target.value})
                    }
                    style={{borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 8, backgroundColor: "#fafafa", width: "95%",fontFamily: "Montserrat-Regular", fontSize: 13, marginBottom: 7}}
                  />
                   <input
                    type="date"
                    min={editForm.productionStartDate}
                    value={editForm.productionEndDate}
                    onChange={(e) => {
                      const selectedEnd = e.target.value;
                      if (editForm.productionStartDate && selectedEnd < editForm.productionStartDate) {
                        Alert.alert("Error", "End date cannot be before start date");
                        return;
                      }
                      setEditForm({...editForm, productionEndDate: selectedEnd });
                    }}s
                    style={{borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 8, backgroundColor: "#fafafa", width: "95%",fontFamily: "Montserrat-Regular", fontSize: 13}}
                  />
                </>
                ) : (
                  <>
                  <Pressable
                    style={{flexDirection: "row", alignItems: "center", padding: 8, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, backgroundColor: "#fafafa", marginBottom: 10}}
                    onPress={() => {
                      setDateType("start");
                      setShowDatePicker(true);
                    }}
                  >
                    <Text>
                      {editForm.productionStartDate
                        ? formatDate(editForm.productionStartDate)
                        : "Select Start Date"}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={{flexDirection: "row", alignItems: "center", padding: 8, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, backgroundColor: "#fafafa", marginBottom: 10}}
                    onPress={() => {
                      setDateType("end");
                      setShowDatePicker(true);
                    }}
                  >
                    <Text>
                      {editForm.productionEndDate
                        ? formatDate(editForm.productionEndDate)
                        : "Select End Date"}
                    </Text>
                  </Pressable>
                </>
                )}
            </View>
            
            <View style={{marginBottom: 7 }}>
              <Text style={{fontWeight: "600", marginTop: 0, marginBottom: 4, fontSize: 13, fontFamily: 'Montserrat-Regular',}}>Description*</Text>
              <TextInput
                placeholder="Description"
                multiline
                value={editForm.description}
                onChangeText={(t) =>
                  setEditForm({ ...editForm, description: t })
                }
                style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 8, backgroundColor: "#fafafa", width: "100%",fontFamily: "Montserrat-Regular", fontSize: 14, height: 220,}}
              />
            </View>

            <View style={{ flex: 1 , flexDirection: "row", alignSelf: "flex-end", gap: 8, }}>
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
                  padding: 10,
                  minWidth: 70,
                }}
              >
                <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600", fontFamily: 'Montserrat-Regular'}}>
                  SAVE
                </Text>
              </Pressable>

              <Pressable
                style={{
                  backgroundColor: "#000",
                  paddingVertical: 10,
                  borderRadius: 8,
                  padding: 10,
                  minWidth: 70,
                }}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600", fontFamily: 'Montserrat-Regular' }}>
                  CANCEL
                </Text>
              </Pressable>
            </View>
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
            shadowOpacity: 0.1,
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