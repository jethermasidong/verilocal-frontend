import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { useFonts } from "expo-font";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

//REGISTER PRODUCT
export default function RegisterProduct() {
  const [form, setForm] = useState({
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
    quantity: "",
    current_owner: "",
  });

  //FONTS
  const [fontsLoaded] = useFonts({
    "Garet-Book": require("../../assets/fonts/garet/Garet-Book.ttf"),
    "Garet-Heavy": require("../../assets/fonts/garet/Garet-Heavy.ttf"),
    "Montserrat-Regular": require("../../assets/fonts/Montserrat/static/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("../../assets/fonts/Montserrat/static/Montserrat-Bold.ttf"),
  });

  //DATE PICKER
  const [showDatePicker, setShowDatePicker] = useState(false);

  //STATUS MESSAGES
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState("");

  //INDICATORS
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // PRODUCT REGISTRATION INSTRUCTIONS MODAL
  const [showRegistrationInstruction, setShowRegistrationInstruction] =
    useState(false);

  // RESULT MODAL STATE
  const [resultVisible, setResultVisible] = useState(false);
  const [resultType, setResultType] = useState(null);
  const [resultMessage, setResultMessage] = useState("");

  // RESULT ANIMATIONS
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  //IMAGE UPLOAD STATUS MESSAGE
  const [uploadError, setUploadError] = useState("");

  const [dateType, setDateType] = useState(null);

  //DATE FORMAT
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const origins = [
    "Abra",
    "Apayao",
    "Benguet",
    "Ifugao",
    "Kalinga",
    "Mountain Province",
    "Baguio City",
  ];

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (!selectedDate) return;

    if (dateType === "start") {
      if (
        form.productionEndDate &&
        selectedDate > new Date(form.productionEndDate)
      ) {
        handleInputChange("productionEndDate", "");
      }
      handleInputChange("productionStartDate", selectedDate);
    } else if (dateType === "end") {
      if (
        form.productionStartDate &&
        selectedDate < new Date(form.productionStartDate)
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

  //PRODUCT REGISTRATION INSTRUCTIONS MODAL
  const handleConfirmConsent = async () => {
    try {
      await AsyncStorage.setItem("product_consent_given", "true");
      setShowRegistrationInstruction(false);
    } catch (error) {
      console.log("Error saving consent:", error);
    }
  };

  useEffect(() => {
    checkConsent();
  }, []);

  const checkConsent = async () => {
    try {
      const consent = await AsyncStorage.getItem("product_consent_given");

      if (!consent) {
        setShowRegistrationInstruction(true);
      }
    } catch (error) {
      console.log("Error checking consent:", error);
    }
  };

  //IMAGE SIZE LIMIT
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

          setForm((prev) => ({
            ...prev,
            [key]: {
              uri: URL.createObjectURL(file),
              name: file.name,
              type: file.type,
              file,
            },
          }));
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
          const response = await fetch(asset.uri);
          const blob = await response.blob();

          if (blob.size > MAX_FILE_SIZE) {
            setUploadError("File too large. Must be 5MB or less.");
            return;
          } else setUploadError("");

          setForm((prev) => ({
            ...prev,
            [key]: {
              uri: asset.uri,
              name: asset.fileName || "image.jpg",
              type: asset.mimeType || "image/jpeg",
              file: blob,
            },
          }));
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
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled) {
        const selectedImages = await Promise.all(
          result.assets.map(async (asset) => {
            const response = await fetch(asset.uri);
            const blob = await response.blob();

            if (blob.size > MAX_FILE_SIZE) {
              Alert.alert("File too large", "Each image must be 5MB or less");
              return null;
            }

            return {
              uri: asset.uri,
              name: asset.fileName || `process_${Date.now()}.jpg`,
              type: asset.mimeType || "image/jpeg",
              file: blob,
            };
          }),
        );

        setForm((prev) => ({
          ...prev,
          processImages: [
            ...prev.processImages,
            ...selectedImages.filter(Boolean),
          ],
        }));
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error selecting images");
    }
  };

  const handleInputChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const resize = () => setIsMobile(Dimensions.get("window").width < 700);
    resize();
    Dimensions.addEventListener("change", resize);
    return () => Dimensions.removeEventListener("change", resize);
  }, []);

  //SUBMIT FOR REGISTRATION
  const handleSubmit = async () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "Product name is required";
    if (!form.type) newErrors.type = "Product type is required";
    if (!form.materials) newErrors.materials = "Materials are required";
    if (!form.origin) newErrors.origin = "Origin is required";
    if (!form.current_owner)
      newErrors.current_owner = "Current Owner is Required";
    if (!form.quantity) newErrors.quantity = "Quantity is Required";
    if (!form.productionDate)
      newErrors.productionDate = "Start and Finish Date are required";
    if (!form.description) newErrors.description = "Description required";
    if (!form.productImage)
      newErrors.productImage = "Product image is required";
    if (form.processImages.length === 0)
      newErrors.processImages = "At least one process image is required";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    //STATUS MESSAGES
    setErrors({});
    setIsSubmitting(true);
    setIsLoading(true);

    //FORM HANDLING
    try {
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k !== "productImage" && k !== "processImages")
          formData.append(k, v);
      });

      if (Platform.OS === "web") {
        if (form.productImage?.file) {
          formData.append("product_image", form.productImage.file);
        }

        form.processImages.forEach((img) => {
          if (img.file) formData.append("process_images", img.file);
        });
      }

      //BACKEND COMMUNICATION
      await axios.post(
        "https://verilocalph.onrender.com/api/products",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setResultType("success");
      setResultMessage("Product registered successfully!");
      setResultVisible(true);
      //RESET FORM
      setForm({
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
        quantity: "",
        current_owner: "",
      });
    } catch (error) {
      const serverMessage =
        error.response?.data?.message ||
        error.reason ||
        "Product Registration failed. Please try again.";

      setResultType("error");
      setResultMessage(serverMessage);
      setResultVisible(true);
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  //PAGE ANIMATION
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

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
    if (resultVisible) {
      if (resultType === "success") {
        scaleAnim.setValue(0.8);
        opacityAnim.setValue(0);

        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 350,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }

      if (resultType === "error") {
        opacityAnim.setValue(0);
        shakeAnim.setValue(0);

        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 6,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -6,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [resultVisible, resultType]);

  useEffect(() => {
    if (form.productionStartDate && form.productionEndDate) {
      const start = formatDate(form.productionStartDate);
      const end = formatDate(form.productionEndDate);
      setForm((prev) => ({
        ...prev,
        productionDate: `${start} - ${end}`,
      }));
    }
  }, [form.productionStartDate, form.productionEndDate]);

  const STANDARD_INPUT_HEIGHT = 44;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        flex: 1,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {/* MOBILE VIEW */}
      {isMobile ? (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 30,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, { flexDirection: "column" }]}>
            {/* LEFT BANNER IMAGE */}
            <View
              style={[
                styles.leftPanel,
                !isMobile && { width: "35%", height: "100%" },
              ]}
            >
              <Image
                source={require("../../assets/business1.png")}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            </View>
            {/* RIGHT PANEL */}
            <View style={[styles.rightPanel, isMobile && { width: "100%" }]}>
              <Text style={styles.formTitle}>Product Registration</Text>
              <Text style={styles.subtitle}>
                Welcome Artisan, Register your product.
              </Text>
              <View
                style={[styles.row, isMobile && { flexDirection: "column" }]}
              >
                <View style={[styles.col, isMobile && { minWidth: "100%" }]}>
                  {statusMessage !== "" && (
                    <Text style={styles.statusMessage}>{statusMessage}</Text>
                  )}
                  <Text style={styles.label}>Name of the Product*</Text>
                  <InputField
                    label="Product Name"
                    value={form.name}
                    onChange={(v) => handleInputChange("name", v)}
                    maxLength={50}
                    error={errors.name}
                  />

                  <Text style={styles.label}>Type of Product*</Text>
                  <View style={styles.inputContainer}>
                    <Picker
                      selectedValue={form.type}
                      onValueChange={(v) => {
                        handleInputChange("type", v);
                        handleInputChange("materials", "");
                      }}
                      style={[styles.picker, errors.type && styles.errorInput]}
                    >
                      <Picker.Item label="Select Type" value="" />
                      <Picker.Item label="Woodcrafts" value="Woodcraft" />
                      <Picker.Item
                        label="Weaving and Textiles"
                        value="Textile"
                      />
                    </Picker>
                    {errors.type && (
                      <Text style={styles.errorText}>{errors.type}</Text>
                    )}
                  </View>

                  {form.type === "Woodcraft" && (
                    <View style={styles.inputContainer}>
                      <Picker
                        selectedValue={form.materials}
                        onValueChange={(v) => handleInputChange("materials", v)}
                        style={[
                          styles.picker,
                          errors.type && styles.errorInput,
                        ]}
                      >
                        <Picker.Item label="Select Material" value="" />
                        <Picker.Item label="Kamagong" value="Kamagong" />
                        <Picker.Item label="Acacia" value="Acacia" />
                        <Picker.Item label="Narra" value="Narra" />
                        <Picker.Item label="Molave" value="Molave" />
                        <Picker.Item label="Mahogany" value="Mahogany" />
                        <Picker.Item label="Batikuling" value="Batikuling" />
                        <Picker.Item label="Gmelina" value="Gmelina" />
                        <Picker.Item label="Mangga" value="Mangga" />
                        <Picker.Item label="Alnus" value="Alnus" />
                        <Picker.Item label="Langka" value="Langka" />
                      </Picker>
                      {errors.materials && (
                        <Text style={styles.errorText}>{errors.materials}</Text>
                      )}
                    </View>
                  )}

                  {form.type === "Textile" && (
                    <View style={styles.inputContainer}>
                      <Picker
                        selectedValue={form.materials}
                        onValueChange={(v) => handleInputChange("materials", v)}
                        style={[
                          styles.picker,
                          errors.type && styles.errorInput,
                        ]}
                      >
                        <Picker.Item label="Select Material" value="" />
                        <Picker.Item label="Abaca" value="Abaca" />
                        <Picker.Item label="Piña" value="Piña" />
                        <Picker.Item label="Cotton" value="Cotton" />
                        <Picker.Item label="Silk" value="Silk" />
                        <Picker.Item label="Maguay" value="Maguay" />
                      </Picker>
                      {errors.materials && (
                        <Text style={styles.errorText}>{errors.materials}</Text>
                      )}
                    </View>
                  )}

                  <Text style={[styles.label]}>Origin of the Product*</Text>
                  <View style={styles.inputContainer}>
                    <Picker
                      selectedValue={form.origin}
                      style={[styles.picker, errors.type && styles.errorInput]}
                      onValueChange={(value) =>
                        handleInputChange("origin", value)
                      }
                    >
                      <Picker.Item label="Select Origin" value="" />
                      {origins.map((item, index) => (
                        <Picker.Item key={index} label={item} value={item} />
                      ))}
                    </Picker>
                    {errors.origin && (
                      <Text style={styles.errorText}>{errors.origin}</Text>
                    )}
                  </View>
                  <Text style={styles.label}>Current Owner*</Text>
                  <InputField
                    label="Current Owner"
                    value={form.current_owner}
                    onChange={(v) => handleInputChange("current_owner", v)}
                    maxLength={50}
                    error={errors.current_owner}
                  />
                </View>

                <View style={[styles.col, isMobile && { width: "100%" }]}>
                  <Text style={styles.label}>Quantity*</Text>
                  <InputField
                    label="Product Quantity"
                    value={form.quantity}
                    onChange={(v) => handleInputChange("quantity", v)}
                    maxLength={50}
                    error={errors.quantity}
                  />
                  <Text style={[styles.label, { marginTop: 0 }]}>
                    Production Date* (Start to End)
                  </Text>
                  {Platform.OS === "web" ? (
                    <>
                      <input
                        type="date"
                        value={form.productionStartDate}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            productionStartDate: e.target.value,
                          })
                        }
                        style={{
                          ...styles.webDateInput,
                          borderColor: errors.productionDate ? "red" : "red",
                        }}
                      />
                      <input
                        type="date"
                        min={form.productionStartDate}
                        value={form.productionEndDate}
                        onChange={(e) => {
                          const selectedEnd = e.target.value;
                          if (
                            form.productionStartDate &&
                            selectedEnd < form.productionStartDate
                          ) {
                            Alert.alert(
                              "Error",
                              "End date cannot be before start date",
                            );
                            return;
                          }
                          setForm({ ...form, productionEndDate: selectedEnd });
                        }}
                        style={{
                          ...styles.webDateInput,
                          borderColor: errors.productionDate ? "red" : "red",
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <Pressable
                        style={[
                          styles.dateWrapper,
                          errors.productionDate && styles.errorInput,
                        ]}
                        onPress={() => {
                          setDateType("start");
                          setShowDatePicker(true);
                        }}
                      >
                        <Text>
                          {form.productionStartDate
                            ? formatDate(form.productionStartDate)
                            : "Select Start Date"}
                        </Text>
                      </Pressable>

                      <Pressable
                        style={[
                          styles.dateWrapper,
                          errors.productionDate && styles.errorInput,
                        ]}
                        onPress={() => {
                          setDateType("end");
                          setShowDatePicker(true);
                        }}
                      >
                        <Text>
                          {form.productionEndDate
                            ? formatDate(form.productionEndDate)
                            : "Select End Date"}
                        </Text>
                      </Pressable>
                    </>
                  )}

                  {errors.productionDate && (
                    <Text
                      style={[
                        styles.errorText,
                        { marginTop: -6, marginBottom: 10 },
                      ]}
                    >
                      {errors.productionDate}
                    </Text>
                  )}

                  <Text style={styles.label}>Description*</Text>
                  <InputField
                    style={styles.textArea}
                    label="Description"
                    value={form.description}
                    onChange={(v) => handleInputChange("description", v)}
                    multiline
                    error={errors.description}
                  />
                </View>
              </View>
              <Text style={[styles.label, { marginTop: 10 }]}>
                Image of the Product*
              </Text>
              <Pressable
                style={[styles.imagePicker, errors.type && styles.errorInput]}
                onPress={() => pickImage("productImage")}
              >
                {form.productImage ? (
                  <Image
                    source={{ uri: form.productImage.uri }}
                    style={styles.imagePreview}
                  />
                ) : (
                  <Text style={styles.imageText}>Select Product Image</Text>
                )}
              </Pressable>
              {errors.productImage && (
                <Text style={styles.errorText}>{errors.productImage}</Text>
              )}

              <Text style={styles.label}>Images of the Process*</Text>

              <Pressable
                style={[styles.imagePicker, errors.type && styles.errorInput]}
                onPress={pickProcessImages}
              >
                <Text style={styles.imageText}>
                  Upload process photos (e.g., raw materials, artisan at work,
                  finished product){" "}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {form.processImages.map((img, index) => (
                    <View key={index} style={{ marginRight: 10 }}>
                      <Image
                        source={{ uri: img.uri }}
                        style={{
                          width: 120,
                          height: 120,
                          borderRadius: 10,
                        }}
                      />
                      <Pressable
                        onPress={() => {
                          const updatedImages = form.processImages.filter(
                            (_, i) => i !== index,
                          );
                          setForm({
                            ...form,
                            processImages: updatedImages,
                          });
                        }}
                        style={{
                          position: "absolute",
                          top: -6,
                          right: -6,
                          backgroundColor: "#ff4444",
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          justifyContent: "center",
                          alignItems: "center",
                          elevation: 3,
                        }}
                      >
                        <Text style={{ color: "white", fontWeight: "bold" }}>
                          ×
                        </Text>
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              </Pressable>

              {errors.processImages && (
                <Text
                  style={[
                    styles.errorText,
                    { marginTop: -10, marginBottom: 10 },
                  ]}
                >
                  {errors.processImages}
                </Text>
              )}
              <Pressable
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <Text style={styles.submitText}>Submit</Text>
              </Pressable>

              {showDatePicker && (
                <DateTimePicker
                  value={
                    dateType === "start"
                      ? form.productionStartDate
                        ? new Date(form.productionStartDate)
                        : new Date()
                      : form.productionEndDate
                        ? new Date(form.productionEndDate)
                        : new Date()
                  }
                  mode="date"
                  minimumDate={
                    dateType === "end" && form.productionStartDate
                      ? new Date(form.productionStartDate)
                      : undefined
                  }
                  maximumDate={new Date()}
                  onChange={onDateChange}
                />
              )}
            </View>
          </View>
        </ScrollView>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 0,
          }}
        >
          <View style={[styles.card, { flexDirection: "row" }]}>
            {/* DESKTOP VIEW */}
            <View
              style={[
                styles.leftPanel,
                !isMobile && { width: "35%", height: "100%" },
              ]}
            >
              <Image
                source={require("../../assets/business1.png")}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            </View>
            {/* RIGHT PANEL */}
            <View style={[styles.rightPanel, isMobile && { width: "100%" }]}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Text style={styles.formTitle}>Product Registration</Text>
                <Pressable
                  style={{ padding: 5 }}
                  onPress={() => router.push("/business")}
                >
                  {({ hovered }) => (
                    <Ionicons
                      name="arrow-back-circle-outline"
                      size={40}
                      color={hovered ? "#000" : "#375a96"}
                      style={styles.resultIcon}
                    />
                  )}
                </Pressable>
              </View>
              <Text style={styles.subtitle}>
                Welcome Artisan, Register your product.
              </Text>
              <View
                style={[styles.row, isMobile && { flexDirection: "column" }]}
              >
                <View style={[styles.col, isMobile && { minWidth: "100%" }]}>
                  {statusMessage !== "" && (
                    <Text style={styles.statusMessage}>{statusMessage}</Text>
                  )}
                  <Text style={styles.label}>Name of the Product*</Text>
                  <InputField
                    label="Product Name"
                    value={form.name}
                    onChange={(v) => handleInputChange("name", v)}
                    maxLength={50}
                    error={errors.name}
                  />

                  <Text style={styles.label}>Type of Product*</Text>
                  <View style={styles.inputContainer}>
                    <Picker
                      selectedValue={form.type}
                      onValueChange={(v) => {
                        handleInputChange("type", v);
                        handleInputChange("materials", "");
                      }}
                      style={[styles.picker, errors.type && styles.errorInput]}
                    >
                      <Picker.Item label="Select Type" value="" />
                      <Picker.Item label="Woodcrafts" value="Woodcraft" />
                      <Picker.Item
                        label="Weaving and Textiles"
                        value="Textile"
                      />
                    </Picker>
                    {errors.type && (
                      <Text style={styles.errorText}>{errors.type}</Text>
                    )}
                  </View>

                  {form.type === "Woodcraft" && (
                    <View style={styles.inputContainer}>
                      <Picker
                        selectedValue={form.materials}
                        onValueChange={(v) => handleInputChange("materials", v)}
                        style={[
                          styles.picker,
                          errors.type && styles.errorInput,
                        ]}
                      >
                        <Picker.Item label="Select Material" value="" />
                        <Picker.Item label="Kamagong" value="Kamagong" />
                        <Picker.Item label="Acacia" value="Acacia" />
                        <Picker.Item label="Narra" value="Narra" />
                        <Picker.Item label="Molave" value="Molave" />
                        <Picker.Item label="Mahogany" value="Mahogany" />
                        <Picker.Item label="Batikuling" value="Batikuling" />
                        <Picker.Item label="Gmelina" value="Gmelina" />
                        <Picker.Item label="Mangga" value="Mangga" />
                        <Picker.Item label="Alnus" value="Alnus" />
                        <Picker.Item label="Langka" value="Langka" />
                      </Picker>
                      {errors.materials && (
                        <Text style={styles.errorText}>{errors.materials}</Text>
                      )}
                    </View>
                  )}

                  {form.type === "Textile" && (
                    <View style={styles.inputContainer}>
                      <Picker
                        selectedValue={form.materials}
                        onValueChange={(v) => handleInputChange("materials", v)}
                        style={[
                          styles.picker,
                          errors.type && styles.errorInput,
                        ]}
                      >
                        <Picker.Item label="Select Material" value="" />
                        <Picker.Item label="Abaca" value="Abaca" />
                        <Picker.Item label="Piña" value="Piña" />
                        <Picker.Item label="Cotton" value="Cotton" />
                        <Picker.Item label="Silk" value="Silk" />
                        <Picker.Item label="Maguay" value="Maguay" />
                      </Picker>
                      {errors.materials && (
                        <Text style={styles.errorText}>{errors.materials}</Text>
                      )}
                    </View>
                  )}
                  <Text style={styles.label}>Origin of the Product*</Text>
                  <View style={styles.inputContainer}>
                    <Picker
                      selectedValue={form.origin}
                      style={[styles.picker, errors.type && styles.errorInput]}
                      onValueChange={(value) =>
                        handleInputChange("origin", value)
                      }
                    >
                      <Picker.Item label="Select Origin" value="" />
                      {origins.map((item, index) => (
                        <Picker.Item key={index} label={item} value={item} />
                      ))}
                    </Picker>
                    {errors.origin && (
                      <Text style={styles.errorText}>{errors.origin}</Text>
                    )}
                  </View>
                  <Text style={styles.label}>Current Owner*</Text>
                  <InputField
                    label="Current Owner"
                    value={form.current_owner}
                    onChange={(v) => handleInputChange("current_owner", v)}
                    maxLength={50}
                    error={errors.current_owner}
                  />
                </View>

                <View style={[styles.col, isMobile && { minWidth: "100%" }]}>
                  <Text style={styles.label}>Quantity*</Text>
                  <InputField
                    label="Product Quantity"
                    value={form.quantity}
                    onChange={(v) => handleInputChange("quantity", v)}
                    maxLength={50}
                    error={errors.quantity}
                  />
                  <Text style={styles.label}>
                    Production Date* (Start to End)
                  </Text>
                  {Platform.OS === "web" ? (
                    <>
                      <input
                        type="date"
                        value={form.productionStartDate}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            productionStartDate: e.target.value,
                          })
                        }
                        style={{
                          ...styles.webDateInput,
                          borderColor: errors.productionDate ? "red" : "red",
                        }}
                      />
                      <input
                        type="date"
                        min={form.productionStartDate}
                        value={form.productionEndDate}
                        onChange={(e) => {
                          const selectedEnd = e.target.value;
                          if (
                            form.productionStartDate &&
                            selectedEnd < form.productionStartDate
                          ) {
                            Alert.alert(
                              "Error",
                              "End date cannot be before start date",
                            );
                            return;
                          }
                          setForm({ ...form, productionEndDate: selectedEnd });
                        }}
                        style={{
                          ...styles.webDateInput,
                          borderColor: "red",
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <Pressable
                        style={[
                          styles.dateWrapper,
                          errors.productionDate && styles.errorInput,
                        ]}
                        onPress={() => {
                          setDateType("start");
                          setShowDatePicker(true);
                        }}
                      >
                        <Text>
                          {form.productionStartDate
                            ? formatDate(form.productionStartDate)
                            : "Select Start Date"}
                        </Text>
                      </Pressable>

                      <Pressable
                        style={[
                          styles.dateWrapper,
                          errors.productionDate && styles.errorInput,
                        ]}
                        onPress={() => {
                          setDateType("end");
                          setShowDatePicker(true);
                        }}
                      >
                        <Text>
                          {form.productionEndDate
                            ? formatDate(form.productionEndDate)
                            : "Select End Date"}
                        </Text>
                      </Pressable>
                    </>
                  )}

                  {errors.productionDate && (
                    <Text
                      style={[
                        styles.errorText,
                        { marginTop: -6, marginBottom: 10 },
                      ]}
                    >
                      {errors.productionDate}
                    </Text>
                  )}

                  <Text style={styles.label}>Description*</Text>
                  <InputField
                    style={styles.textArea}
                    label="Description"
                    value={form.description}
                    onChange={(v) => handleInputChange("description", v)}
                    multiline
                    error={errors.description}
                  />
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: 16, marginBottom: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Image of the Product*</Text>
                  <Pressable
                    style={[
                      styles.imagePicker,
                      errors.type && styles.errorInput,
                    ]}
                    onPress={() => pickImage("productImage")}
                  >
                    {form.productImage ? (
                      <Image
                        source={{ uri: form.productImage.uri }}
                        style={styles.imagePreview}
                      />
                    ) : (
                      <Text style={styles.imageText}>Select Product Image</Text>
                    )}
                  </Pressable>
                  {errors.productImage && (
                    <Text style={styles.errorText}>{errors.productImage}</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Images of the Process*</Text>

                  <Pressable
                    style={[
                      styles.imagePicker,
                      errors.type && styles.errorInput,
                    ]}
                    onPress={pickProcessImages}
                  >
                    <Text style={styles.imageText}>
                      Upload process photos (e.g., raw materials, artisan at
                      work, finished product){" "}
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      {form.processImages.map((img, index) => (
                        <View key={index} style={{ marginRight: 10 }}>
                          <Image
                            source={{ uri: img.uri }}
                            style={{
                              width: 120,
                              height: 120,
                              borderRadius: 10,
                            }}
                          />
                          <Pressable
                            onPress={() => {
                              const updatedImages = form.processImages.filter(
                                (_, i) => i !== index,
                              );
                              setForm({
                                ...form,
                                processImages: updatedImages,
                              });
                            }}
                            style={{
                              position: "absolute",
                              top: -6,
                              right: -6,
                              backgroundColor: "#ff4444",
                              width: 24,
                              height: 24,
                              borderRadius: 12,
                              justifyContent: "center",
                              alignItems: "center",
                              elevation: 3,
                            }}
                          >
                            <Text
                              style={{ color: "white", fontWeight: "bold" }}
                            >
                              ×
                            </Text>
                          </Pressable>
                        </View>
                      ))}
                    </ScrollView>
                  </Pressable>

                  {errors.processImages && (
                    <Text
                      style={[
                        styles.errorText,
                        { marginTop: -10, marginBottom: 10 },
                      ]}
                    >
                      {errors.processImages}
                    </Text>
                  )}
                </View>
              </View>
              <Pressable
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <Text style={styles.submitText}>Submit</Text>
              </Pressable>

              {showDatePicker && (
                <DateTimePicker
                  value={
                    dateType === "start"
                      ? form.productionStartDate
                        ? new Date(form.productionStartDate)
                        : new Date()
                      : form.productionEndDate
                        ? new Date(form.productionEndDate)
                        : new Date()
                  }
                  mode="date"
                  minimumDate={
                    dateType === "end" && form.productionStartDate
                      ? new Date(form.productionStartDate)
                      : undefined
                  }
                  maximumDate={new Date()}
                  onChange={onDateChange}
                />
              )}
            </View>
          </View>
        </View>
      )}
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
            <Text style={{ marginTop: 10 }}>Registering Product...</Text>
          </View>
        </View>
      )}

      {resultVisible && (
        <View style={styles.resultOverlay}>
          <Animated.View
            style={[
              styles.resultContainer,
              {
                opacity: opacityAnim,
                transform: [
                  { scale: resultType === "success" ? scaleAnim : 1 },
                  { translateX: resultType === "error" ? shakeAnim : 0 },
                ],
              },
            ]}
          >
            <Ionicons
              name={
                resultType === "success" ? "checkmark-circle" : "close-circle"
              }
              size={70}
              color={resultType === "success" ? "#4caf50" : "#d32f2f"}
              style={styles.resultIcon}
            />

            <Text
              style={[
                styles.resultTitle,
                {
                  color: resultType === "success" ? "#2e7d32" : "#c62828",
                },
              ]}
            >
              {resultType === "success" ? "Success" : "Submission Failed"}
            </Text>

            <Text style={styles.resultMessage}>{resultMessage}</Text>

            <Pressable
              onPress={() => setResultVisible(false)}
              style={[
                styles.resultButton,
                {
                  backgroundColor:
                    resultType === "success" ? "#4caf50" : "#d32f2f",
                },
              ]}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>OK</Text>
            </Pressable>
          </Animated.View>
        </View>
      )}
      {/* Product Registration Instructions Modal */}
      {showRegistrationInstruction && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: isMobile ? "flex-end" : "center",
            alignItems: "center",
            padding: 20,
            position: "absolute",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 30,
              borderRadius: 16,
              width: "100%",
              maxWidth: 650,
              minHeight: 250,
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontFamily: "Montserrat-Bold",
                fontSize: 14,
                marginBottom: 5,
                fontWeight: "500",
              }}
            >
              Product Registration Guide
            </Text>

            <Text
              style={{
                fontFamily: "Montserrat-Regular",
                fontSize: 12,
                marginBottom: 20,
                fontWeight: "300",
              }}
            >
              Follow these steps to register your product:
            </Text>

            {/* 1 */}
            <Text
              style={{
                fontFamily: "Montserrat-Bold",
                fontSize: 12,
                marginBottom: 5,
                fontWeight: "500",
              }}
            >
              1. Enter Product Details
            </Text>

            <View style={{ flexDirection: "row", marginBottom: 4 }}>
              <Text style={{ marginRight: 6 }}>•</Text>
              <Text style={{ fontFamily: "Montserrat-Regular", fontSize: 12 }}>
                <Text style={{ fontFamily: "Montserrat-Bold" }}>
                  Product Name
                </Text>{" "}
                – Name of your product
              </Text>
            </View>

            <View style={{ flexDirection: "row", marginBottom: 4 }}>
              <Text style={{ marginRight: 6 }}>•</Text>
              <Text style={{ fontFamily: "Montserrat-Regular", fontSize: 12 }}>
                <Text style={{ fontFamily: "Montserrat-Bold" }}>
                  Type of Product
                </Text>{" "}
                – Select the product category
              </Text>
            </View>

            <View style={{ flexDirection: "row", marginBottom: 16 }}>
              <Text style={{ marginRight: 6 }}>•</Text>
              <Text style={{ fontFamily: "Montserrat-Regular", fontSize: 12 }}>
                <Text style={{ fontFamily: "Montserrat-Bold" }}>Origin</Text> –
                Place where the product was made
              </Text>
            </View>

            {/* 2 */}
            <Text
              style={{
                fontFamily: "Montserrat-Bold",
                fontSize: 12,
                marginBottom: 5,
                fontWeight: "500",
              }}
            >
              2. Set Production Dates
            </Text>

            <View style={{ flexDirection: "row", marginBottom: 16 }}>
              <Text style={{ marginRight: 6 }}>•</Text>
              <Text style={{ fontFamily: "Montserrat-Regular", fontSize: 12 }}>
                Select the{" "}
                <Text style={{ fontFamily: "Montserrat-Bold" }}>
                  start date
                </Text>{" "}
                and{" "}
                <Text style={{ fontFamily: "Montserrat-Bold" }}>end date</Text>{" "}
                of the product’s creation.
              </Text>
            </View>

            {/* 3 */}
            <Text
              style={{
                fontFamily: "Montserrat-Bold",
                fontSize: 12,
                marginBottom: 5,
                fontWeight: "500",
              }}
            >
              3. Add a Description
            </Text>

            <View style={{ flexDirection: "row", marginBottom: 16 }}>
              <Text style={{ marginRight: 6 }}>•</Text>
              <Text style={{ fontFamily: "Montserrat-Regular", fontSize: 12 }}>
                Write a short explanation about the product, including materials
                or crafting process.
              </Text>
            </View>

            {/* 4 */}
            <Text
              style={{
                fontFamily: "Montserrat-Bold",
                fontSize: 12,
                marginBottom: 5,
                fontWeight: "500",
              }}
            >
              4. Upload Images
            </Text>

            <View style={{ flexDirection: "row", marginBottom: 4 }}>
              <Text style={{ marginRight: 6 }}>•</Text>
              <Text style={{ fontFamily: "Montserrat-Regular", fontSize: 12 }}>
                <Text style={{ fontFamily: "Montserrat-Bold" }}>
                  Product Image
                </Text>{" "}
                – Upload{" "}
                <Text style={{ fontFamily: "Montserrat-Bold" }}>1 photo</Text>{" "}
                of the finished product.
              </Text>
            </View>

            <View style={{ flexDirection: "row", marginBottom: 16 }}>
              <Text style={{ marginRight: 6 }}>•</Text>
              <Text style={{ fontFamily: "Montserrat-Regular", fontSize: 12 }}>
                <Text style={{ fontFamily: "Montserrat-Bold" }}>
                  Process Images
                </Text>{" "}
                – Upload{" "}
                <Text style={{ fontFamily: "Montserrat-Bold" }}>
                  up to 5 photos
                </Text>{" "}
                showing how the product is made.
              </Text>
            </View>

            {/* 5 */}
            <Text
              style={{
                fontFamily: "Montserrat-Bold",
                fontSize: 12,
                marginBottom: 5,
                fontWeight: "500",
              }}
            >
              5. Submit
            </Text>

            <View style={{ flexDirection: "row", marginBottom: 16 }}>
              <Text style={{ marginRight: 6 }}>•</Text>
              <Text style={{ fontFamily: "Montserrat-Regular", fontSize: 12 }}>
                Review your information and click{" "}
                <Text style={{ fontFamily: "Montserrat-Bold" }}>Submit</Text> to
                register your product.
              </Text>
            </View>

            <Text
              style={{
                fontFamily: "Montserrat-Regular",
                fontSize: 12,
                fontStyle: "italic",
                marginBottom: 10,
              }}
            >
              Tip: Use clear descriptions and photos to better showcase your
              product.
            </Text>
            <View style={{ marginTop: "auto", paddingTop: 20 }}>
              <Pressable
                onPress={handleConfirmConsent}
                style={{
                  backgroundColor: "#4A70A9",
                  paddingVertical: 10,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Montserrat-Regular",
                    fontWeight: "700",
                    color: "#fff",
                  }}
                >
                  OK
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

function InputField({ label, value, onChange, multiline, maxLength, error }) {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        placeholder={label}
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        maxLength={maxLength}
        style={[
          styles.input,
          multiline && styles.textArea,
          error && styles.errorInput,
        ]}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  card: {
    width: "95%",
    maxWidth: 1200,
    backgroundColor: "#fff",
    borderRadius: 25,
    overflow: "hidden",
    elevation: 6,
    borderColor: "#cae2f3",
    borderWidth: 1,
  },
  rightPanel: {
    flex: 1,
    padding: 28,
    backgroundColor: "#f2f8fc",
  },
  infoPanel: {
    flex: 1,
    backgroundColor: "#4A70A9",
    padding: 20,
    justifyContent: "center",
    marginBottom: 20,
  },
  accountButton: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  accountButtonText: { color: "#4A70A9", fontWeight: "700" },

  row: {
    flexDirection: "row",
    gap: 20,
  },
  col: {
    flex: 1,
    minWidth: 280,
    width: "100%",
  },
  label: {
    fontWeight: "600",
    marginTop: 0,
    color: "#223049",
    marginBottom: 4,
    fontSize: 13,
    fontFamily: "Montserrat-Regular",
  },
  leftPanel: {
    width: "100%",
    height: 220,
  },

  statusMessage: { fontSize: 12, color: "#67AA61", marginBottom: 10 },

  formTitle: {
    fontSize: 34,
    fontWeight: "700",
    marginBottom: 4,
    color: "#223049",
    textAlign: "left",
    fontFamily: "Montserrat-Bold",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#223049",
    marginBottom: 12,
    textAlign: "left",
    fontFamily: "Montserrat-Regular",
  },

  columnsWrapper: { justifyContent: "space-between", gap: 20 },
  column: { flex: 1, minWidth: 0, marginBottom: 20 },

  inputContainer: { marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "red",
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#fafafa",
    width: "100%",
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
  },
  picker: {
    height: 44,
    borderWidth: 1,
    borderColor: "red",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fafafa",
    width: "100%",
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
  },
  errorInput: { borderColor: "red" },
  errorText: {
    color: "red",
    marginTop: 1,
    marginBottom: 3,
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
  },

  dateWrapper: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "red",
    borderRadius: 8,
    height: 44,
    width: "100%",
    backgroundColor: "#fafafa",
    marginBottom: 10,
    ...(Platform.OS === "web" && { boxSizing: "border-box" }),
  },
  webDateWrapper: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  webDateInput: {
    borderWidth: 1,
    borderColor: "red",
    marginBottom: 10,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#fafafa",
    width: "100%",
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
  },

  textArea: {
    width: "100%",
    borderWidth: 1,
    borderColor: "red",
    borderRadius: 12,
    padding: 10,
    height: 116,
    textAlignVertical: "top",
    marginBottom: 5,
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: "red",
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
    paddingBottom: 20,
  },

  resultOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 9999,
  },

  resultContainer: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },

  resultTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },

  resultMessage: {
    fontSize: 14,
    textAlign: "center",
    color: "#4B5563",
    marginBottom: 24,
    lineHeight: 20,
  },

  resultButton: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  resultIcon: {
    marginBottom: 15,
  },

  submitButton: {
    backgroundColor: "#375a96",
    padding: 14,
    borderRadius: 50,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
