import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { useFonts } from "expo-font";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import bgImage from "../../assets/bg1.jpg";

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

  //Edit Confirmation Modal
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Product image (single)
  const [editProductImage, setEditProductImage] = useState(null);

  // Process images (multiple)
  const [editProcessImages, setEditProcessImages] = useState([]);

  //Profile Sidebar
  const [profileSidebarVisible, setProfileSidebarVisible] = useState(false);
  const profileBtnOpacity = useRef(new Animated.Value(1)).current;
  const [showProfileBtn, setShowProfileBtn] = useState(true);

  //Types and Materials
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);

  //Delete Confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  //Filter and Report Generation Animation
  const hoverAnimReport = useRef(new Animated.Value(0)).current;
  const hoverAnimFilter = useRef(new Animated.Value(0)).current;
  const hoverAnimTransfer = useRef(new Animated.Value(0)).current;

  //Loading State
  const [isLoading, setIsLoading] = useState(false);

  // Result Modal (Success / Error)
  const [resultVisible, setResultVisible] = useState(false);
  const [resultType, setResultType] = useState(null); // "success" | "error"
  const [resultMessage, setResultMessage] = useState("");

  const resultOpacity = useRef(new Animated.Value(0)).current;
  const resultScale = useRef(new Animated.Value(0.8)).current;

  //Product Modal Left and Right Button Hover Animation
  const [hoverLeft, setHoverLeft] = useState(false);
  const [hoverRight, setHoverRight] = useState(false);

  //Close, Edit, Delete, Print, Download Button Product Modal Hover Animation
  const [hoverClose, setHoverClose] = useState(false);
  const [hoverEdit, setHoverEdit] = useState(false);
  const [hoverDelete, setHoverDelete] = useState(false);
  const [hoverPrint, setHoverPrint] = useState(false);
  const [hoverDownload, setHoverDownload] = useState(false);

  //Filter Function
  const filterRef = useRef(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterPos, setFilterPos] = useState({ x: 0, y: 0, width: 0 });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateType, setDateType] = useState(null);

  const [types, setTypes] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [origins, setOrigins] = useState([]);  

  const [errors, setErrors] = useState({});

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

  const onHoverIn2 = () => {
    Animated.spring(hoverAnimTransfer, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };
  const onHoverOut2 = () => {
    Animated.spring(hoverAnimTransfer, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const [windowWidth, setWindowWidth] = useState(
    Dimensions.get("window").width,
  );
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setWindowWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);
  const isMobile = windowWidth < 768;

  //FILTER AND CATEGORIZATION:
  const typeOptions = [
    ...new Set(products.map((p) => p.type).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b));
  const materialOptions = [
    ...new Set(products.map((p) => p.materials).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b));
  const statusOptions = [
    ...new Set(products.map((p) => p.status).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b));

  const toggleFilter = (value, selected, setSelected) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
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
    productImage: null,
    processImages: [],
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

    if (dateType === "start") {
      if (
        editForm.productionEndDate &&
        selectedDate > new Date(editForm.productionEndDate)
      ) {
        Alert.alert(
          "Invalid Date",
          "Start date cannot be later than the end date.",
        );
        return;
      }
      handleInputChange("productionStartDate", selectedDate);
    } else if (dateType === "end") {
      if (
        editForm.productionStartDate &&
        selectedDate < new Date(editForm.productionStartDate)
      ) {
        Alert.alert(
          "Invalid Date",
          "End date cannot be earlier than the start date.",
        );
        return;
      }
      handleInputChange("productionEndDate", selectedDate);
    }
  };

  useEffect(() => {
    if (editForm.productionStartDate && editForm.productionEndDate) {
      const start = formatDate(editForm.productionStartDate);
      const end = formatDate(editForm.productionEndDate);
      setEditForm((prev) => ({
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

  useEffect(() => {
    const loadBusinessesName = async () => {
      const registered_business_name = await AsyncStorage.getItem(
        "registered_business_name",
      );
      if (registered_business_name)
        setRegisteredBusinessName(registered_business_name);
    };
    loadBusinessesName();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await axios.get(
          "https://verilocalph.onrender.com/api/products/my-products",
          { headers: { Authorization: `Bearer ${token}` } },
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
        "https://verilocalph.onrender.com/api/products/my-products",
        { headers: { Authorization: `Bearer ${token}` } },
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
    const matchesSearch = p.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesType =
      selectedTypes.length === 0 || selectedTypes.includes(p.type);

    const matchesMaterials =
      selectedMaterials.length === 0 || selectedMaterials.includes(p.materials);

    const matchesStatus =
      selectedStatus.length === 0 || selectedStatus.includes(p.status);

    return matchesSearch && matchesType && matchesMaterials && matchesStatus;
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

  const updateProduct = async (uid) => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();

      formData.append("name", editForm.name);
      formData.append("type", editForm.type);
      formData.append("materials", editForm.materials);
      formData.append("origin", editForm.origin);
      formData.append("description", editForm.description);
      formData.append("productionDate", editForm.productionDate);

      if (
        editProductImage &&
        (editProductImage.startsWith("blob:") ||
          editProductImage.startsWith("file"))
      ) {
        if (Platform.OS === "web") {
          const response = await fetch(editProductImage);
          const blob = await response.blob();
          formData.append("product_image", blob, `product_${uid}.jpg`);
        } else {
          const uriParts = editProductImage.split(".");
          const fileType = uriParts[uriParts.length - 1];
          formData.append("product_image", {
            uri: editProductImage,
            name: `product_${uid}.${fileType}`,
            type: `image/${fileType}`,
          });
        }
      }

      const keptImages = editProcessImages.filter(
        (uri) => !uri.startsWith("blob:") && !uri.startsWith("file"),
      );

      const newImages = editProcessImages.filter(
        (uri) => uri.startsWith("blob:") || uri.startsWith("file"),
      );

      keptImages.forEach((uri) => {
        formData.append("kept_process_images", uri);
      });

      for (let index = 0; index < newImages.length; index++) {
        const uri = newImages[index];
        if (uri.startsWith("blob:") || uri.startsWith("file")) {
          if (Platform.OS === "web") {
            const response = await fetch(uri);
            const blob = await response.blob();
            formData.append("process_images", blob, `process_${index}.jpg`);
          } else {
            const uriParts = uri.split(".");
            const fileType = uriParts[uriParts.length - 1];
            formData.append("process_images", {
              uri,
              name: `process_${index}.${fileType}`,
              type: `image/${fileType}`,
            });
          }
        }
      }

      const res = await axios.put(
        `https://verilocalph.onrender.com/api/products/${uid}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      await fetchProducts();
      setSelectedProduct(res.data);
      setEditModalVisible(false);
      setModalVisible(false);
      setIsLoading(false);

      showResult("success", "Product updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      setIsLoading(false);
      showResult("error", "Failed to update product. Please try again.");
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

    setErrors({});
    setSelectedProduct(product);
    setEditForm({
      name: product.name || "",
      origin: product.origin || "",
      materials: product.materials || "",
      description: product.description || "",
      type: product.type || "",
      productionStart: start,
      productionEnd: end,
      productionDate: product.productionDate || "",
    });

    setEditProductImage(product.product_image);

    let existingProcess = [];
    try {
      if (Array.isArray(product.process_images)) {
        existingProcess = product.process_images;
      } else if (typeof product.process_images === "string") {
        existingProcess = JSON.parse(product.process_images);
      }
    } catch (e) {
      console.error("Failed to parse process images", e);
      existingProcess = [];
    }

    setEditProcessImages(existingProcess);
    setEditModalVisible(true);
  };

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  //IMAGE PICKER - PRODUCT IMAGE
  const pickImage = async (key) => {
    try {
      if (Platform.OS === "web") {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) return;

          if (file.size > MAX_FILE_SIZE) {
            Alert.alert("File too large", "Image must be 5MB or less");
            return;
          }

          setEditProductImage(URL.createObjectURL(file));
        };
        input.click();
      } else {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });

        if (!result.canceled) {
          const asset = result.assets[0];

          if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
            setUploadError("File too large. Must be 5MB or less.");
            return;
          } else setUploadError("");

          setEditProductImage(asset.uri);
          setErrors((prev) => ({ ...prev, productImage: null }));
        }
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error selecting image");
    }
  };

  //PROCESS IMAGE PICKER - MULTIPLE UPLOAD
  const pickProcessImages = async () => {
    try {
      if (Platform.OS === "web") {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.multiple = true;
        input.onchange = (e) => {
          const files = Array.from(e.target.files);
          const validFiles = files.filter((f) => {
            if (f.size > MAX_FILE_SIZE) {
              Alert.alert("File too large", "Each image must be 5MB or less");
              return false;
            }
            return true;
          });
          const uris = validFiles.map((f) => URL.createObjectURL(f));
          setEditProcessImages((prev) => [
            ...(Array.isArray(prev) ? prev : []),
            ...uris,
          ]);
        };
        input.click();
      } else {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: true,
          quality: 1,
        });

        if (!result.canceled) {
          const validAssets = result.assets.filter((asset) => {
            if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
              Alert.alert("File too large", "Each image must be 5MB or less");
              return false;
            }
            return true;
          });
          const newUris = validAssets.map((asset) => asset.uri);
          setEditProcessImages((prev) => [
            ...(Array.isArray(prev) ? prev : []),
            ...newUris,
          ]);
          setErrors((prev) => ({ ...prev, processImages: null }));
        }
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error selecting images");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!editForm.name) newErrors.name = "Product name is required";
    if (!editForm.type) newErrors.type = "Product type is required";
    if (!editForm.materials) newErrors.materials = "Materials are required";
    if (!editForm.origin) newErrors.origin = "Origin is required";
    if (!editForm.productionDate)
      newErrors.productionDate = "Finish date is required";
    if (!editForm.description) newErrors.description = "Description required";

    if (!editProductImage) newErrors.productImage = "Product image is required";

    if (!editProcessImages || editProcessImages.length === 0)
      newErrors.processImages = "At least one process image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
            <p><strong>Owner: </strong>${business.name || "-"} </p>
            <p><strong>Email: </strong>${business.email || "-"} </p>
            <p><strong>Address: </strong>${business.address || "-"} </p>
            <p><strong>Contact Number: </strong>${business.contact_no || "-"} </p>
        </div>

        <div class="section">
            <h2>Business Summary</h2>
            <div class="summary-box">
                <div class="card">
                    <h3>${products.length}</h3>
                    <p>Total Products</p>
                </div>
                <div class="card">
                    <h3>${[...new Set(products.map((p) => p.type))].length}</h3>
                    <p>Product Types</p>
                </div>
                <div class="card">
                    <h3>${[...new Set(products.map((p) => p.materials))].length}</h3>
                    <p>Materials</p>
                </div>
            </div>
        </div>

        <div class="products">
            <h2>Product Catalog</h2>
            ${products
              .filter((p) => p.status === "approved")
              .map(
                (p) => `<div class="products">
                <div class="image-box">
                ${p.product_image ? `<img src="${p.product_image}"/>` : ""}
                </div>
                <h3>${p.name}</h3>
                <p><strong>Type: </strong>${p.type} </p>
                <p><strong>Materials: </strong>${p.materials} </p>
                <p><strong>Origin: </strong>${p.origin} </p>
                <p><strong>Production Date: </strong>${p.productionDate} </p>
                <p><strong>Current Owner: </strong>${p.current_owner} </p>  
                <p><strong>Description:</strong></p>
                <p>${p.description}</p>
                <p><strong>Transaction Hash:</strong></p>
                <p>${p.tx_hash || "-"}</p>

                <div class="blockchain">
                    ${p.qr_code ? ` <img src="${p.qr_code}"/>` : ""}
                </div>

            </div>
            `,
              )
              .join("")}
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

  const deleteProduct = async (id) => {
    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");

      await axios.delete(
        `https://verilocalph.onrender.com/api/products/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await fetchProducts();

      setModalVisible(false);
      setIsLoading(false);

      showResult("success", `${selectedProduct?.name} deleted successfully!`);
    } catch (err) {
      console.error("Delete failed:", err);
      setIsLoading(false);

      showResult("error", "Failed to delete product. Please try again.");
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const showResult = (type, message) => {
    setResultType(type);
    setResultMessage(message);
    setResultVisible(true);

    resultOpacity.setValue(0);
    resultScale.setValue(0.8);

    Animated.parallel([
      Animated.timing(resultOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(resultScale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
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
          "https://verilocalph.onrender.com/api/business/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        setBusiness(res.data);

        if (res.data.registered_business_name) {
          setRegisteredBusinessName(res.data.registered_business_name);
        }
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
    if (editForm.type) {
      fetchMaterials(editForm.type);
    }
  }, [editForm.type])

  const fetchMaterials = async (type) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(
        `https://verilocalph.onrender.com/api/materials/type/${type}`,
        {
          headers: { Authorization: `Bearer ${token}`},
        }
      );
      if (type === editForm.type) {
        setMaterials(res.data);
      }
    } catch (err) {
      console.error("Error fetching materials", err);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      console.log("FETCHING TYPES...");
      const res = await axios.get(
        "https://verilocalph.onrender.com/api/materials/types",
        {
          headers: { Authorization: `Bearer ${token}`},
        }
      );
      setTypes(res.data);
    } catch (err) {
      console.error("Error fetching types", err);
    }
  };

  useEffect(() => {
    fetchOrigins();
  }, []);

  const fetchOrigins = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(
        "https://verilocalph.onrender.com/api/origin",
        {
          headers: { Authorization: `Bearer ${token}`},
        }
      );
      setOrigins(res.data);
    } catch (err) {
      console.error("Error fetching origin", err);
    }
  };



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

  const CARD_WIDTH = isMobile ? 300 : 350;
  const CARD_MARGIN = 10;
  const ITEM_WIDTH = CARD_WIDTH + CARD_MARGIN;

  {
    /* Register Button Hover Animations */
  }
  const [hoverRegister, setHoverRegister] = useState(false);

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

  return (
    <ImageBackground
      source={bgImage}
      style={styles.dashboard_bg}
      imageStyle={styles.dashboard_bgImage}
      resizeMode="cover"
    >
      <Animated.View
        style={[
          styles.dashboard_animatedContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView
          style={styles.dashboard_scroll}
          contentContainerStyle={styles.dashboard_scrollContent}
        >
          {/* Search Products */}
          <View style={[styles.searchProducts_container]}>
            <View
              style={[
                styles.searchProducts_wrapper,
                isMobile && {
                  alignItems: "flex-start",
                  width: "100%",
                  justifyConten: "center",
                  alignItems: "center",
                },
              ]}
            >
              <TextInput
                placeholder="Search products..."
                placeholderTextColor="#000000"
                style={styles.dashboard_searchInput}
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  setVisibleCount(9999);
                }}
              />
              {/* Filter Products Button */}
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
                  style={styles.filterProducts_btn}
                  ref={filterRef}
                  onPress={() => {
                    filterRef.current?.measureInWindow(
                      (x, y, width, height) => {
                        setFilterPos({
                          x,
                          y: y + height,
                          width,
                        });
                        setShowFilter(true);
                      },
                    );
                  }}
                >
                  <Ionicons name="funnel-outline" size={30} />
                  {!isMobile && onHoverIn1 && (
                    <Text style={styles.hoverText}>Filter Products</Text>
                  )}
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
                  style={styles.reportGeneration_btn}
                  ref={filterRef}
                  onPress={reportGenerator}
                >
                  <Ionicons name="archive-outline" size={30} />
                  {!isMobile && onHoverIn && (
                    <Text style={styles.hoverText}>Report Generation</Text>
                  )}
                </Pressable>
              </Animated.View>

              <Animated.View
                style={{
                  transform: [
                    {
                      translateY: hoverAnimTransfer.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -6],
                      }),
                    },
                  ],
                }}
              >
                <Pressable
                  onHoverIn={onHoverIn2}
                  onHoverOut={onHoverOut2}
                  style={styles.filterProducts_btn}
                  onPress={() => router.push("/business/transferOwnership")}
                >
                  <Ionicons name="swap-horizontal-outline" size={30} />
                  {!isMobile && onHoverIn2 && (
                    <Text style={styles.hoverText}>Transfer Ownership</Text>
                  )}
                </Pressable>
              </Animated.View>
            </View>
          </View>
          {/* Welcome Section */}
          <LinearGradient
            colors={["#f4f6fb", "#4A70A9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dashboard_welcomeCard}
          >
            <Text
              style={[
                styles.dashboard_headerText,
                isMobile && { fontSize: 22, textAlign: "center" },
              ]}
            >
              Artisan Dashboard
            </Text>

            <Text
              style={[
                styles.dashboard_welcomeText,
                isMobile && { fontSize: 22, textAlign: "center" },
              ]}
            >
              Greetings,
            </Text>

            <Text
              style={[
                styles.dashboard_welcomeBusinessText,
                isMobile && { fontSize: 20, textAlign: "center" },
              ]}
            >
              {business?.registered_business_name || "Loading..."}!
            </Text>
          </LinearGradient>

          {/* Summary Cards */}
          <View style={styles.summaryCardContainer}>
            {/* Total Products Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryCardContent}>
                <View
                  style={[
                    styles.summaryIconBox,
                    { backgroundColor: "#d8e2f0" },
                  ]}
                >
                  <Ionicons name="cube-outline" size={24} color="#3C6CB4" />
                </View>
                <View style={styles.summaryTextContainer}>
                  <Text style={styles.summaryCardTitle}>Total Products</Text>
                  <Text style={styles.summaryProgress}>
                    {filteredProducts.length} items
                  </Text>
                </View>
              </View>
            </View>

            {/* Registered Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryCardContent}>
                <View
                  style={[
                    styles.summaryIconBox,
                    { backgroundColor: "#e8f5e4" },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={24}
                    color="#8acc78"
                  />
                </View>
                <View style={styles.summaryTextContainer}>
                  <Text style={styles.summaryCardTitle}>Approved</Text>
                  <Text style={styles.summaryProgress}>
                    {products.filter((p) => p.status === "approved").length}{" "}
                    Items
                  </Text>
                </View>
              </View>
            </View>

            {/* Pending Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryCardContent}>
                <View
                  style={[
                    styles.summaryIconBox,
                    { backgroundColor: "#f3f3dc" },
                  ]}
                >
                  <Ionicons
                    name="reload-circle-outline"
                    size={24}
                    color="#c4c251"
                  />
                </View>
                <View style={styles.summaryTextContainer}>
                  <Text style={styles.summaryCardTitle}>Pending</Text>
                  <Text style={styles.summaryProgress}>
                    {products.filter((p) => p.status === "pending").length}{" "}
                    Items
                  </Text>
                </View>
              </View>
            </View>

            {/* Failed Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryCardContent}>
                <View
                  style={[
                    styles.summaryIconBox,
                    { backgroundColor: "#faf0ef" },
                  ]}
                >
                  <Ionicons name="alert-outline" size={24} color="#c74242" />
                </View>
                <View style={styles.summaryTextContainer}>
                  <Text style={styles.summaryCardTitle}>Failed</Text>
                  <Text style={styles.summaryProgress}>
                    {products.filter((p) => p.status === "failed").length} Items
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Product List */}
          <View style={{ width: "100%", maxWidth: 1200, marginVertical: 10 }}>
            <FlatList
              data={[
                { __isAddButton: true },
                ...filteredProducts.slice(0, visibleCount),
              ]}
              keyExtractor={(item) =>
                item.__isAddButton ? "add-btn" : item.id.toString()
              }
              key="grid-4"
              numColumns={4}
              scrollEnabled={false}
              columnWrapperStyle={{ gap: 14, justifyContent: "flex-start" }}
              contentContainerStyle={{ paddingBottom: 20, gap: 14 }}
              renderItem={({ item }) => {
                if (item.__isAddButton) {
                  return (
                    <Pressable
                      onHoverIn={() => setHoverRegister(true)}
                      onHoverOut={() => setHoverRegister(false)}
                      onPress={() =>
                        router.push("/business/productRegistration")
                      }
                      style={styles.dashboard_addProductCard}
                    >
                      <Ionicons
                        name="bag-add-outline"
                        size={40}
                        color="#4A70A9"
                      />
                      <Text style={styles.dashboard_addProductText}>
                        Add Product
                      </Text>
                    </Pressable>
                  );
                }

                return (
                  <View style={styles.dashboard_productCard}>
                    {/* Image */}
                    {item.product_image ? (
                      <Image
                        source={{ uri: item.product_image }}
                        style={styles.dashboard_productImage}
                      />
                    ) : (
                      <View style={styles.dashboard_productImagePlaceholder}>
                        <Ionicons
                          name="image-outline"
                          size={36}
                          color="#b0bec5"
                        />
                      </View>
                    )}

                    {/* Info */}
                    <View style={styles.dashboard_productCardBody}>
                      <Text
                        style={styles.dashboard_productCardName}
                        numberOfLines={2}
                      >
                        {item.name}
                      </Text>
                      {item.status ? (
                        <View
                          style={[
                            styles.dashboard_productTypeBadge,
                            {
                              backgroundColor:
                                item.status === "approved"
                                  ? "#e8f5e4"
                                  : item.status === "failed"
                                    ? "#faf0ef"
                                    : "#f3f3dc",
                            },
                          ]}
                        >
                          <Text style={styles.dashboard_productTypeText}>
                            {item.status}
                          </Text>
                        </View>
                      ) : null}
                      {item.materials ? (
                        <Text
                          style={styles.dashboard_productMaterialText}
                          numberOfLines={1}
                        >
                          {item.materials}
                        </Text>
                      ) : null}
                    </View>

                    {/* View Button */}
                    <Pressable
                      onPress={() => openModal(item)}
                      style={styles.dashboard_viewButton}
                    >
                      <Ionicons name="eye-outline" size={14} color="#fff" />
                      <Text style={styles.dashboard_viewButtonText}>View</Text>
                    </Pressable>
                  </View>
                );
              }}
            />
          </View>

          {/* Show More */}
          {products.length > visibleCount && (
            <Pressable
              onPress={() => setVisibleCount(products.length)}
              style={{ marginTop: 5, marginBottom: 20 }}
            >
              <Text style={styles.showMore_text}>Show More</Text>
            </Pressable>
          )}

          {/* PRODUCT MODAL */}
          <Modal visible={modalVisible} animationType="fade" transparent={true}>
            <View style={styles.dashboard_modalOverlay}>
              <View style={styles.dashboard_modalCard}>
                {/* CLOSE BUTTON */}
                <View
                  style={{
                    position: "absolute",
                    top: 15,
                    right: 15,
                    zIndex: 10,
                  }}
                >
                  <Pressable
                    onHoverIn={() => setHoverClose(true)}
                    onHoverOut={() => setHoverClose(false)}
                    onPress={() => setModalVisible(false)}
                    style={[
                      styles.closeBtn,
                      { backgroundColor: hoverClose ? "#C0392B" : "#fff" },
                    ]}
                  >
                    <Ionicons name="close" size={18} color="#000" />
                  </Pressable>
                </View>

                {/* Product Image */}
                {selectedProduct && (
                  <>
                    {selectedProduct?.product_image && (
                      <View style={styles.productImage_container}>
                        <Image
                          source={{ uri: selectedProduct.product_image }}
                          blurRadius={25}
                          style={styles.blurredBackground}
                        />
                        <Image
                          source={{ uri: selectedProduct.product_image }}
                          style={styles.productImage}
                        />

                        {/* Product Name */}
                        <View style={styles.productName_background}>
                          <Text
                            style={styles.productName_text}
                            numberOfLines={1}
                          >
                            {selectedProduct.name}
                          </Text>
                          {/*
                    :{
                      
                    */}
                        </View>
                      </View>
                    )}

                    <ScrollView
                      style={{ flexGrow: 1 }}
                      contentContainerStyle={{ paddingBottom: 20 }}
                      showsVerticalScrollIndicator={false}
                    >
                    {selectedProduct?.current_owner === business?.registered_business_name && (
                      <View style={styles.buttonContainer}>
                        <View style={{ position: "auto" }}>
                          {/* EDIT PRODUCT BUTTON */}
                          <Pressable
                            onPress={() => openEditModal(selectedProduct)}
                            onHoverIn={() => setHoverEdit(true)}
                            onHoverOut={() => setHoverEdit(false)}
                            style={[
                              styles.edit_delete_btn,
                              {
                                backgroundColor: hoverEdit ? "#a7a5a5" : "#fff",
                              },
                            ]}
                          >
                            <Ionicons
                              name="create-outline"
                              size={18}
                              color="#000"
                            />
                          </Pressable>
                        </View>
                        <View style={{ position: "auto" }}>
                          {/* DELETE PRODUCT BUTTON */}
                          <Pressable
                            onPress={() => {
                              setShowDeleteModal(true);
                            }}
                            onHoverIn={() => setHoverDelete(true)}
                            onHoverOut={() => setHoverDelete(false)}
                            style={[
                              styles.edit_delete_btn,
                              {
                                backgroundColor: hoverDelete
                                  ? "#a7a5a5"
                                  : "#fff",
                              },
                            ]}
                          >
                            <Ionicons
                              name="trash-outline"
                              size={18}
                              color="#000"
                            />
                          </Pressable>
                        </View>
                      </View>
                    )}

                      {/* Delete Modal */}
                      <Modal
                        transparent
                        visible={showDeleteModal}
                        animationType="fade"
                      >
                        <View style={styles.modalOverlay}>
                          <View style={styles.modalBox}>
                            <Text style={styles.modalTitle}>
                              Delete Product
                            </Text>

                            <Text
                              style={{
                                marginBottom: 20,
                                fontFamily: "Montserrat-Regular",
                              }}
                            >
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
                                style={styles.confirm_cancelButton}
                                onPress={() => setShowDeleteModal(false)}
                              >
                                <Text style={styles.confirm_cancelText}>
                                  Cancel
                                </Text>
                              </Pressable>

                              <Pressable
                                style={styles.confirm_deleteButton}
                                onPress={() => {
                                  deleteProduct(selectedProduct.id);
                                  setShowDeleteModal(false);
                                }}
                              >
                                <Text style={styles.confirm_deleteText}>
                                  Delete
                                </Text>
                              </Pressable>
                            </View>
                          </View>
                        </View>
                      </Modal>

                      <View style={[styles.productInfoBox, selectedProduct?.current_owner !== business?.registered_business_name && { marginTop: 0 }]}>
                        <Text style={styles.infoText}>
                          <Text style={{ fontWeight: "600" }}>Type:</Text>{" "}
                          {selectedProduct.type}
                        </Text>
                        <Text style={styles.infoText}>
                          <Text style={{ fontWeight: "600" }}>Materials:</Text>{" "}
                          {selectedProduct.materials}
                        </Text>
                        <Text style={styles.infoText}>
                          <Text style={{ fontWeight: "600" }}>Origin:</Text>{" "}
                          {selectedProduct.origin}
                        </Text>
                        <Text style={styles.infoText}>
                          <Text style={{ fontWeight: "600" }}>Current Owner:</Text>{" "}
                          {selectedProduct.current_owner}
                        </Text>
                        <Text style={styles.infoText}>
                          <Text style={{ fontWeight: "600" }}>
                            Production Date:
                          </Text>{" "}
                          {selectedProduct.productionDate}
                        </Text>
                      </View>
                      <Text style={[styles.infoText, { marginTop: 8 }]}>
                        <Text style={{ fontWeight: "600" }}>Description:</Text>
                      </Text>
                      <View style={styles.descriptionBox}>
                        <Text style={styles.descriptionText}>
                          {selectedProduct.description}
                        </Text>
                      </View>
                      {Array.isArray(processImages) &&
                        processImages.length > 0 && (
                          <View style={styles.processContainer}>
                            <Text
                              style={[
                                styles.infoText,
                                { fontWeight: "600", marginBottom: 10 },
                              ]}
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
                                pagingEnabled={false}
                                snapToAlignment="start"
                                disableIntervalMomentum={true}
                                decelerationRate="fast"
                                contentContainerStyle={{
                                  paddingRight: CARD_MARGIN,
                                }}
                                onScroll={(e) => {
                                  if (isProgrammaticScroll.current) return;

                                  const offsetX = e.nativeEvent.contentOffset.x;
                                  const index = Math.round(
                                    offsetX / ITEM_WIDTH,
                                  );

                                  setActiveIndex(
                                    Math.max(
                                      0,
                                      Math.min(index, processImages.length - 1),
                                    ),
                                  );
                                }}
                                scrollEventThrottle={16}
                              >
                                {processImages.map((img, index) => (
                                  <View
                                    key={index}
                                    style={[
                                      styles.processCard,
                                      {
                                        width: CARD_WIDTH,
                                        height: isMobile ? 310 : 300,
                                        marginRight: CARD_MARGIN,
                                      },
                                    ]}
                                  >
                                    <Image
                                      source={{ uri: img }}
                                      blurRadius={25}
                                      style={styles.blurredBackground}
                                    />
                                    <Image
                                      source={{ uri: img }}
                                      style={styles.processImage}
                                    />
                                  </View>
                                ))}
                              </ScrollView>
                              <View style={styles.dotsContainer}>
                                {processImages.map((_, index) => (
                                  <View
                                    key={index}
                                    style={[
                                      styles.dot,
                                      {
                                        backgroundColor:
                                          activeIndex === index
                                            ? "#000"
                                            : "#cfcfcf",
                                      },
                                    ]}
                                  />
                                ))}
                              </View>
                            </View>
                          </View>
                        )}

                      {/* QR + PRINT + DOWNLOAD */}
                      <View style={styles.qrContainer}>
                        <View style={styles.qrButtons}>
                          <Pressable
                            onHoverIn={() => setHoverPrint(true)}
                            onHoverOut={() => setHoverPrint(false)}
                            onPress={() => printQRCode(selectedProduct.qr_code)}
                            style={[
                              styles.qrIconButton,
                              {
                                backgroundColor: hoverPrint
                                  ? "#a7a5a5"
                                  : "#fff",
                              },
                            ]}
                          >
                            <Ionicons
                              name="print-outline"
                              size={16}
                              color="#000"
                            />
                          </Pressable>

                          <Pressable
                            onHoverIn={() => setHoverDownload(true)}
                            onHoverOut={() => setHoverDownload(false)}
                            onPress={() =>
                              downloadQRCode(selectedProduct.qr_code)
                            }
                            style={[
                              styles.qrIconButton,
                              {
                                backgroundColor: hoverDownload
                                  ? "#a7a5a5"
                                  : "#fff",
                              },
                            ]}
                          >
                            <Ionicons
                              name="download-outline"
                              size={16}
                              color="#000"
                            />
                          </Pressable>
                        </View>

                        {selectedProduct?.qr_code && (
                          <Image
                            source={{ uri: selectedProduct.qr_code }}
                            style={styles.qrImage}
                            resizeMode="contain"
                          />
                        )}
                      </View>

                      {/* BLOCKCHAIN INFO */}
                      <View style={styles.blockchainBox}>
                        <Text style={styles.blockchainTitle}>
                          Blockchain Information
                        </Text>
                        <Text style={styles.blockchainText}>
                          <Text style={{ fontWeight: "600" }}>
                            Transaction Hash:
                          </Text>{" "}
                          {selectedProduct.tx_hash}
                        </Text>

                        {selectedProduct.tx_hash && (
                          <Pressable
                            onPress={() =>
                              Linking.openURL(
                                `https://sepolia.etherscan.io//tx/${selectedProduct.tx_hash}`,
                              )
                            }
                            style={styles.viewBlockchainButton}
                          >
                            <Text style={styles.viewBlockchainText}>
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
            <View style={styles.modalOverlay}>
              <View style={styles.editModalCard}>
                <View style={styles.editHeader}>
                  <Text style={styles.editTitle}>Edit Product</Text>
                </View>

                <ScrollView
                  style={{ width: "100%" }}
                  contentContainerStyle={{
                    flexGrow: 1,
                    alignItems: "center",
                    paddingVertical: 20,
                  }}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Product Name*</Text>
                    <TextInput
                      placeholder="Product Name"
                      value={editForm.name}
                      maxLength={50}
                      onChangeText={(t) => {
                        setEditForm({ ...editForm, name: t });
                        if (errors.name) setErrors({ ...errors, name: null });
                      }}
                      style={[
                        styles.input,
                        ,
                        errors.name && {
                          borderColor: "#E74C3C",
                          borderWidth: 1,
                        },
                      ]}
                    />

                    <View style={{ marginBottom: 7 }}>
                      <Text
                        style={{
                          fontWeight: "600",
                          marginTop: 0,
                          marginBottom: 4,
                          fontSize: 13,
                          fontFamily: "Montserrat-Regular",
                        }}
                      >
                        Type*
                      </Text>
                      <Picker
                        selectedValue={editForm.type}
                        onValueChange={(v) => {
                          handleInputChange("type", v);
                          handleInputChange("materials", "");
                        }}
                        style={{
                          borderWidth: 1,
                          borderColor: "#ccc",
                          padding: 8,
                          borderRadius: 8,
                          backgroundColor: "#fafafa",
                          width: "100%",
                          fontFamily: "Montserrat-Regular",
                          fontSize: 13,
                        }}
                      >
                        <Picker.Item label="Select Type" value="" />
                        {types.map((type, index) => (
                        <Picker.Item key={index} label={type} value={type} />
                      ))}
                      </Picker>
                    </View>
                    {editForm.type !== "" && (
                      <View style={{
                        fontWeight: "600",
                        marginTop: 0,
                        marginBottom: 4,
                        fontSize: 13,
                        fontFamily: "Montserrat-Regular",
                      }}>
                        <Picker
                          selectedValue={editForm.materials}
                          onValueChange={(v) => handleInputChange("materials", v)}
                          style={{
                            borderWidth: 1,
                            borderColor: "#ccc",
                            padding: 8,
                            borderRadius: 8,
                            backgroundColor: "#fafafa",
                            width: "100%",
                            fontFamily: "Montserrat-Regular",
                            fontSize: 13,
                          }}
                          >
                        <Picker.Item label="Select Material" value="" />
                          {materials.map((mat, index) => (
                            <Picker.Item key={index} label={mat.name} value={mat.name} />
                          ))}
                          </Picker>
                            {errors.materials && (
                              <Text style={styles.errorText}>{errors.materials}</Text>
                            )}
                      </View>
                    )}
                    <Text
                      style={{
                        fontWeight: "600",
                        marginTop: 6,
                        marginBottom: 4,
                        fontSize: 13,
                        fontFamily: "Montserrat-Regular",
                      }}
                    >
                      Origin*
                    </Text>
                    <View style={{ marginBottom: 7 }}>
                      <Picker
                        selectedValue={editForm.origin}
                        style={{
                          borderWidth: 1,
                          borderColor: "#ccc",
                          padding: 8,
                          borderRadius: 8,
                          backgroundColor: "#fafafa",
                          width: "100%",
                          fontFamily: "Montserrat-Regular",
                          fontSize: 13,
                        }}
                        onValueChange={(value) =>
                          handleInputChange("origin", value)
                        }
                      >
                        <Picker.Item label="Select Origin" value="" />
                          {origins.map((item, index) => (
                            <Picker.Item
                              key={index}
                              label={item.name || item}
                              value={item.name || item}
                            />
                          ))}   
                      </Picker>
                    </View>

                    <View style={{ marginBottom: 7 }}>
                      <Text
                        style={{
                          fontWeight: "600",
                          marginTop: 0,
                          marginBottom: 4,
                          fontSize: 13,
                          fontFamily: "Montserrat-Regular",
                        }}
                      >
                        Production Date* (Start to End)
                      </Text>
                      {Platform.OS === "web" ? (
                        <>
                          <input
                            type="date"
                            value={editForm.productionStartDate}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                productionStartDate: e.target.value,
                              })
                            }
                            style={{
                              borderWidth: 1,
                              borderColor: "#ccc",
                              padding: 8,
                              borderRadius: 8,
                              backgroundColor: "#fafafa",
                              width: "95%",
                              fontFamily: "Montserrat-Regular",
                              fontSize: 13,
                              marginBottom: 7,
                            }}
                          />
                          <input
                            type="date"
                            min={editForm.productionStartDate}
                            value={editForm.productionEndDate}
                            onChange={(e) => {
                              const selectedEnd = e.target.value;
                              if (
                                editForm.productionStartDate &&
                                selectedEnd < editForm.productionStartDate
                              ) {
                                Alert.alert(
                                  "Error",
                                  "End date cannot be before start date",
                                );
                                return;
                              }
                              setEditForm({
                                ...editForm,
                                productionEndDate: selectedEnd,
                              });
                            }}
                            style={{
                              borderWidth: 1,
                              borderColor: "#ccc",
                              padding: 8,
                              borderRadius: 8,
                              backgroundColor: "#fafafa",
                              width: "95%",
                              fontFamily: "Montserrat-Regular",
                              fontSize: 13,
                            }}
                          />
                        </>
                      ) : (
                        <>
                          <Pressable
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              padding: 8,
                              borderWidth: 1,
                              borderColor: "#ccc",
                              borderRadius: 8,
                              backgroundColor: "#fafafa",
                              marginBottom: 10,
                            }}
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
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              padding: 8,
                              borderWidth: 1,
                              borderColor: "#ccc",
                              borderRadius: 8,
                              backgroundColor: "#fafafa",
                              marginBottom: 10,
                            }}
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

                    <View style={{ marginBottom: 5 }}>
                      <Text
                        style={{
                          fontWeight: "600",
                          marginTop: 0,
                          marginBottom: 4,
                          fontSize: 13,
                          fontFamily: "Montserrat-Regular",
                        }}
                      >
                        Description*
                      </Text>
                      <TextInput
                        placeholder="Description"
                        multiline
                        value={editForm.description}
                        onChangeText={(t) => {
                          setEditForm({ ...editForm, description: t });
                          if (errors.description) {
                            setErrors({ ...errors, description: false });
                          }
                        }}
                        style={[
                          {
                            borderWidth: 1,
                            borderColor: "#ccc",
                            padding: 8,
                            borderRadius: 8,
                            backgroundColor: "#fafafa",
                            width: "100%",
                            fontFamily: "Montserrat-Regular",
                            fontSize: 14,
                            height: 180,
                          },
                          errors.description && {
                            borderColor: "#E74C3C",
                            borderWidth: 1.5,
                          },
                        ]}
                      />
                    </View>
                    {/* PRODUCT IMAGE BOX */}
                    <Text style={styles.label}>Image of the Product*</Text>
                    <Pressable onPress={() => pickImage("productImage")}>
                      <View
                        style={[
                          styles.imagePicker,
                          errors.productImage && {
                            borderColor: "#E74C3C",
                            borderWidth: 1.5,
                          },
                        ]}
                      >
                        {editProductImage ? (
                          <View style={{ width: "100%", height: "100%" }}>
                            <Image
                              source={{ uri: editProductImage }}
                              style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: 8,
                                resizeMode: "cover",
                              }}
                            />
                            <View
                              style={{
                                position: "absolute",
                                bottom: 5,
                                right: 5,
                                backgroundColor: "rgba(0,0,0,0.5)",
                                padding: 4,
                                borderRadius: 4,
                              }}
                            >
                              <Text style={{ color: "white", fontSize: 10 }}>
                                Change Photo
                              </Text>
                            </View>
                          </View>
                        ) : (
                          <Text style={styles.imageText}>
                            Select Product Image
                          </Text>
                        )}
                      </View>
                    </Pressable>
                    {errors.productImage && (
                      <Text style={styles.errorText}>
                        {errors.productImage}
                      </Text>
                    )}

                    {/* PROCESS IMAGES BOX */}
                    <Text style={styles.label}>Images of the Process*</Text>
                    <Pressable
                      onPress={() => pickProcessImages("processImages")}
                    >
                      <View
                        style={[
                          styles.imagePicker,
                          errors.processImages && {
                            borderColor: "#E74C3C",
                            borderWidth: 1.5,
                            borderStyle: "dashed",
                          },
                        ]}
                      >
                        <Text style={styles.imageText}>Add Process Images</Text>
                        <Text
                          style={[
                            styles.imageText,
                            { fontSize: 10, marginTop: 3 },
                          ]}
                        >
                          (Tap to select multiple)
                        </Text>
                        {errors.processImages && (
                          <Text style={styles.errorText}>
                            {errors.processImages}
                          </Text>
                        )}
                      </View>
                    </Pressable>
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 10,
                        marginTop: 10,
                        marginBottom: 15,
                      }}
                    >
                      {editProcessImages.map((uri, index) => (
                        <View key={index} style={{ position: "relative" }}>
                          <Image
                            source={{ uri }}
                            style={{
                              width: 70,
                              height: 70,
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: "#ccc",
                            }}
                          />
                          <Pressable
                            onPress={() =>
                              setEditProcessImages((prev) =>
                                prev.filter((_, i) => i !== index),
                              )
                            }
                            style={{
                              position: "absolute",
                              top: -5,
                              right: -5,
                              backgroundColor: "white",
                              borderRadius: 12,
                            }}
                          >
                            <Ionicons
                              name="close-circle"
                              size={22}
                              color="#E74C3C"
                            />
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.buttonRow}>
                    <Pressable
                      style={styles.cancelButton}
                      onPress={() => {
                        setEditModalVisible(false);
                        setErrors({});
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          textAlign: "center",
                          fontWeight: "600",
                          fontFamily: "Montserrat-Regular",
                        }}
                      >
                        CANCEL
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => {
                        if (validateForm()) {
                          if (selectedProduct?.uid) {
                            setShowSaveModal(true);
                          } else {
                            alert("No product selected!");
                          }
                        } else {
                          Alert.alert(
                            "Error",
                            "Please fill in all required fields.",
                          );
                        }
                      }}
                      style={styles.saveButton}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          textAlign: "center",
                          fontWeight: "600",
                          fontFamily: "Montserrat-Regular",
                        }}
                      >
                        SAVE
                      </Text>
                    </Pressable>
                  </View>
                </ScrollView>
                <Modal transparent visible={showSaveModal} animationType="fade">
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                      <Text style={styles.modalTitle}>Confirm Update</Text>

                      <Text
                        style={{
                          marginBottom: 20,
                          fontFamily: "Montserrat-Regular",
                        }}
                      >
                        Are you sure you want to save the changes to this
                        product?
                      </Text>

                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "flex-end",
                          gap: 10,
                        }}
                      >
                        <Pressable
                          style={styles.confirm_cancelButton}
                          onPress={() => setShowSaveModal(false)}
                        >
                          <Text style={styles.confirm_cancelText}>Cancel</Text>
                        </Pressable>

                        <Pressable
                          style={styles.confirm_Button}
                          onPress={() => {
                            setShowSaveModal(false);
                            updateProduct(selectedProduct.uid);
                          }}
                        >
                          <Text style={styles.confirm_deleteText}>Confirm</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </Modal>
                {isLoading && (
                  <View style={styles.loadingContainer}>
                    <View style={styles.loadingCard}>
                      <ActivityIndicator size="large" color="#5177b0" />
                      <Text style={{ marginTop: 10 }}>
                        Updating Product Information...
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </Modal>
        </ScrollView>

        <Modal visible={showFilter} transparent animationType="fade">
          <Pressable style={{ flex: 1 }} onPress={() => setShowFilter(false)}>
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
                paddingRight: 15,
                marginTop: 5,
                elevation: 50,
                zIndex: 99999,
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 6,
              }}
            >
              <View style={{ marginBottom: 10, marginLeft: 10 }}>
                {/* TYPE FILTER */}
                <Text
                  style={{
                    fontWeight: "600",
                    marginBottom: 6,
                    fontFamily: "Montserrat-Regular",
                  }}
                >
                  Type
                </Text>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}
                >
                  {typeOptions.map((type) => (
                    <Pressable
                      key={type}
                      onPress={() =>
                        toggleFilter(type, selectedTypes, setSelectedTypes)
                      }
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Ionicons
                        name={
                          selectedTypes.includes(type)
                            ? "checkbox"
                            : "square-outline"
                        }
                        size={18}
                      />
                      <Text style={{ fontFamily: "Montserrat-Regular" }}>
                        {type}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* MATERIAL FILTER */}
                <Text
                  style={{
                    fontWeight: "600",
                    marginVertical: 6,
                    fontFamily: "Montserrat-Regular",
                  }}
                >
                  Material
                </Text>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}
                >
                  {materialOptions.map((mat) => (
                    <Pressable
                      key={mat}
                      onPress={() =>
                        toggleFilter(
                          mat,
                          selectedMaterials,
                          setSelectedMaterials,
                        )
                      }
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Ionicons
                        name={
                          selectedMaterials.includes(mat)
                            ? "checkbox"
                            : "square-outline"
                        }
                        size={18}
                      />
                      <Text style={{ fontFamily: "Montserrat-Regular" }}>
                        {mat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                {/* STATUS FILTER */}
                <Text
                  style={{
                    fontWeight: "600",
                    marginBottom: 6,
                    marginTop: 4,
                    fontFamily: "Montserrat-Regular",
                  }}
                >
                  Status
                </Text>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}
                >
                  {statusOptions.map((status) => (
                    <Pressable
                      key={status}
                      onPress={() =>
                        toggleFilter(status, selectedStatus, setSelectedStatus)
                      }
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Ionicons
                        name={
                          selectedStatus.includes(status)
                            ? "checkbox"
                            : "square-outline"
                        }
                        size={18}
                      />
                      <Text style={{ fontFamily: "Montserrat-Regular" }}>
                        {status?.charAt(0).toUpperCase() + status?.slice(1)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </Pressable>
        </Modal>
        {/* RESULT MODAL (SUCCESS / ERROR) */}
        <Modal visible={resultVisible} transparent animationType="none">
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Animated.View
              style={{
                opacity: resultOpacity,
                transform: [{ scale: resultScale }],
                backgroundColor: "#fff",
                padding: 25,
                borderRadius: 16,
                width: "85%",
                maxWidth: 350,
                alignItems: "center",
              }}
            >
              <Ionicons
                name={
                  resultType === "success" ? "checkmark-circle" : "close-circle"
                }
                size={70}
                color={resultType === "success" ? "#2ECC71" : "#E74C3C"}
              />

              <Text
                style={{
                  marginTop: 15,
                  fontSize: 16,
                  fontWeight: "600",
                  textAlign: "center",
                  fontFamily: "Montserrat-Regular",
                }}
              >
                {resultMessage}
              </Text>

              <Pressable
                onPress={() => setResultVisible(false)}
                style={{
                  marginTop: 20,
                  backgroundColor:
                    resultType === "success" ? "#2ECC71" : "#E74C3C",
                  paddingVertical: 10,
                  paddingHorizontal: 25,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "600",
                    fontFamily: "Montserrat-Regular",
                  }}
                >
                  OK
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </Modal>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  dashboard_bg: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#eaf2f5",
  },

  dashboard_bgImage: {
    opacity: 0,
  },

  dashboard_animatedContainer: {
    flex: 1,
  },

  dashboard_scroll: {
    flex: 1,
  },

  dashboard_scrollContent: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  dashboard_welcomeCard: {
    width: "100%",
    marginVertical: 10,
    maxWidth: 1200,
    borderRadius: 40,
    paddingVertical: 20,
    paddingHorizontal: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(200, 210, 230, 0.6)",
    shadowColor: "#1a2f5a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
  },

  dashboard_searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 32,
    fontFamily: "Garet-Book",
    borderColor: "rgba(200, 210, 230, 0.6)",
    shadowColor: "#1a2f5a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
  },

  dashboard_addProductCard: {
    width: "24%",
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "transparent",
    shadowColor: "#1a2f5a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: "#4A70A9",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
    gap: 10,
    cursor: "pointer",
  },

  dashboard_addProductText: {
    color: "#4A70A9",
    fontWeight: "700",
    fontSize: 13,
    fontFamily: "Montserrat-Regular",
  },

  dashboard_productCard: {
    width: "24%",
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#1a2f5a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(200, 210, 230, 0.5)",
  },

  dashboard_productImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },

  dashboard_productImagePlaceholder: {
    width: "100%",
    height: 150,
    backgroundColor: "#f0f4f8",
    alignItems: "center",
    justifyContent: "center",
  },

  dashboard_productCardBody: {
    padding: 12,
    paddingBottom: 8,
  },

  dashboard_productCardName: {
    fontWeight: "700",
    fontSize: 13,
    fontFamily: "Montserrat-Regular",
    color: "#1a2f5a",
    marginBottom: 7,
    lineHeight: 18,
  },

  dashboard_productTypeBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 5,
  },

  dashboard_productTypeText: {
    fontSize: 11,
    color: "#000",
    fontFamily: "Montserrat-Regular",
    fontWeight: "400",
  },

  dashboard_productMaterialText: {
    fontSize: 11,
    backgroundColor: "#eef2ff",
    borderRadius: 20,
    paddingHorizontal: 9,
    alignSelf: "flex-start",
    paddingVertical: 3,
    color: "#4A70A9",
    fontFamily: "Montserrat-Regular",
    marginTop: 2,
  },

  dashboard_viewButton: {
    backgroundColor: "#4A70A9",
    margin: 12,
    marginTop: 8,
    paddingVertical: 9,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  dashboard_viewButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "Montserrat-Regular",
  },

  dashboard_modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  dashboard_modalCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 16,
    width: "90%",
    maxWidth: 400,
    elevation: 5,
    maxHeight: "85%",
  },
  dashboard_welcomeText: {
    fontFamily: "Garet-Heavy",
    color: "#2a323c",
    fontSize: 40,
    textAlign: "left",
    fontWeight: "600",
  },
  dashboard_welcomeBusinessText: {
    fontSize: 40,
    fontFamily: "Garet-Heavy",
    color: "#4A70A9",
    textAlign: "left",
    marginTop: 1,
    fontWeight: "600",
  },
  dashboard_headerText: {
    fontSize: 22,
    fontFamily: "Garet-Book",
    color: "#2a323c",
    letterSpacing: 1,
    textAlign: "left",
    fontWeight: "600",
  },
  searchProducts_container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    maxWidth: 1200,
    alignSelf: "center",
    marginTop: 50,
  },
  searchProducts_wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
    position: "relative",
  },
  filterProducts_btn: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  reportGeneration_btn: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  productRegistration_btn: {
    width: "25%",
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
    flexDirection: "row",
    elevation: 3,
    gap: 10,
  },
  productRegistration_btnText: {
    color: "#fff",
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },

  closeBtn: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  showMore_text: {
    fontSize: 14,
    color: "#444",
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  productImage_container: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f2f2f2",
    marginBottom: 15,
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  productName_background: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  productName_text: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 3,
    position: "absolute",
    left: 0,
    top: 0,
  },
  edit_delete_btn: {
    borderWidth: 1,
    borderColor: "#d8e6ed",
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  blurredBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    transform: [{ scale: 1.2 }],
  },
  modalBox: {
    width: 300,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Montserrat-Regular",
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    marginBottom: 20,
    fontFamily: "Montserrat-Regular",
  },
  rowButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  confirm_deleteButton: {
    padding: 10,
    backgroundColor: "#be4848",
    borderRadius: 8,
    justifyContent: "center",
  },
  confirm_deleteText: {
    color: "#fff",
    fontFamily: "Montserrat-Regular",
  },
  confirm_cancelButton: {
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  confirm_Button: {
    padding: 10,
    backgroundColor: "#2ECC71",
    borderRadius: 8,
    justifyContent: "center",
  },
  confirm_cancelText: {
    fontFamily: "Montserrat-Regular",
  },
  productInfoBox: {
    marginBottom: 12,
    marginTop: 50,
    backgroundColor: "#f4f4f4",
    padding: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d8e6ed",
  },
  infoText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
  },
  descriptionBox: {
    backgroundColor: "#f4f4f4",
    padding: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d8e6ed",
    marginBottom: 15,
    marginTop: 5,
  },
  descriptionText: {
    fontFamily: "Montserrat-Regular",
    marginBottom: 20,
  },
  qrContainer: {
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d8e6ed",
    marginBottom: 20,
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  blockchainBox: {
    backgroundColor: "#f4f4f4",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d8e6ed",
    marginBottom: 20,
  },
  blockchainTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    fontFamily: "Montserrat-Regular",
  },
  viewBlockchainButton: {
    backgroundColor: "#4A70A9",
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 5,
  },
  viewBlockchainText: {
    fontWeight: "700",
    fontFamily: "Montserrat-Regular",
    textAlign: "center",
    color: "#fff",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },

  qrContainer: {
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d8e6ed",
    marginBottom: 20,
  },

  qrImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },

  qrButtons: {
    gap: 3,
    position: "absolute",
    right: 5,
    top: 5,
  },

  qrIconButton: {
    borderWidth: 1,
    borderColor: "#d8e6ed",
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  blockchainBox: {
    backgroundColor: "#f4f4f4",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d8e6ed",
    marginBottom: 20,
  },

  blockchainTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    fontFamily: "Montserrat-Regular",
  },

  blockchainText: {
    fontFamily: "Montserrat-Regular",
    marginBottom: 10,
  },

  viewBlockchainButton: {
    backgroundColor: "#4A70A9",
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 5,
  },

  viewBlockchainText: {
    fontWeight: "700",
    fontFamily: "Montserrat-Regular",
    textAlign: "center",
    color: "#fff",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  loadingCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },

  editModalCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    width: "90%",
    maxWidth: 420,
    maxHeight: "90%",
  },

  editHeader: {
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderColor: "#486d8f",
    borderWidth: 1,
    borderRadius: 10,
    borderStyle: "dotted",
    marginBottom: 5,
  },

  editTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Montserrat-Bold",
    includeFontPadding: false,
  },

  formGroup: {
    marginBottom: 7,
    width: "100%",
  },

  label: {
    fontWeight: "600",
    marginBottom: 4,
    fontSize: 13,
    fontFamily: "Montserrat-Regular",
  },

  input: {
    borderWidth: 1,
    borderColor: "#d8e6ed",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#fafafa",
    width: "100%",
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
  },

  multilineInput: {
    borderWidth: 1,
    borderColor: "#d8e6ed",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#fafafa",
    width: "100%",
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    height: 180,
  },

  buttonRow: {
    flexDirection: "row",
    alignSelf: "flex-end",
    gap: 8,
  },

  saveButton: {
    backgroundColor: "#4A70A9",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    minWidth: 90,
    justifyContent: "center",
    alignItems: "center",
  },

  cancelButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    minWidth: 90,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontFamily: "Montserrat-Regular",
  },
  processImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  processCard: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f2f2f2",
  },
  hoverText: {
    marginTop: 5,
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: "#d8e6ed",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#fafafa",
    height: 140,
    justifyContent: "center",
    marginBottom: 15,
    width: "100%",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    objectFit: "cover",
  },
  imageText: {
    color: "#666",
    fontFamily: "Montserrat-Regular",
  },
  errorText: {
    color: "#E74C3C",
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
    marginTop: 3,
    marginBottom: 10,
    marginLeft: 5,
  },
  summaryCardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    maxWidth: 1200,
    width: "100%",
    gap: 10,
    marginVertical: 5,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 30,
    padding: 10,
    alignItems: "flex-start",
    flexDirection: "row",
    borderColor: "rgba(200, 210, 230, 0.6)",
    shadowColor: "#1a2f5a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
  },
  summaryCardContent: {
    flexDirection: "row",
    gap: 10,
  },

  summaryIconBox: {
    backgroundColor: "#ede9fe",
    padding: 8,
    borderRadius: 10,
    margin: 5,
  },
  summaryTextContainer: {
    flexDirection: "column",
    textAlign: "center",
  },
  summaryProgress: {
    fontSize: 16,
    fontFamily: "Garet-Book",
    color: "#9ca3af",
    marginBottom: 2,
  },

  summaryCardTitle: {
    fontSize: 20,
    fontFamily: "Garet-Book",
    fontWeight: "600",
    color: "#111827",
  },
});
