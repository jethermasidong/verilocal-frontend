import { Ionicons } from "@expo/vector-icons";
import { faFileUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

export default function RegisterBusiness() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [business_name, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [permit, setPermit] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [logo, setLogo] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contact_no, setContactNo] = useState("");
  const [social_link, setSocialLink] = useState("");

  const [errors, setErrors] = useState({});

  const [isMobile, setIsMobile] = useState(false);

  const [consent, setConsent] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [submitting, setIsSubmitting] = useState(false);

  const [suggestions, setSuggestions] = useState([]);

  const searchAddress = async (text) => {
    setAddress(text);

    if (text.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          text
        )}.json`,
        {
          params: {
            access_token: process.env.PUBLIC_MAP_TOKEN,
            autocomplete: true,
            country: "ph",
            limit: 5,
          },
        }
      );

      setSuggestions(res.data.features);
    } catch (err) {
      console.error("Mapbox error:", err);
    }
  };

  const pickImage = async (setter) => {
    try {
      if (Platform.OS === "web") {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            setter({
              file,
              uri: URL.createObjectURL(file),
              name: file.name,
              type: file.type,
            });
          }
        };
        input.click();
      } else {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1,
        });
        if (!result.canceled) {
          const f = result.assets[0];
          setter({
            uri: f.uri,
            name: f.fileName || "image.jpg",
            type: f.mimeType || "image/jpeg",
          });
        }
      }
    } catch {
      Alert.alert("Error", "Image picking failed");
    }
  };

  const multipleImages = async () => {
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

            return {
              uri: asset.uri,
              name: asset.fileName || `certificates${Date.now()}.jpg`,
              type: asset.mimeType || "image/jpeg",
              file: blob,
            };
          }),
        );

        setCertificates((prev) => [...prev, ...selectedImages]);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error selecting images");
    }
  };

  useEffect(() => {
    const resize = () => {
      const w = Dimensions.get("window").width;
      setIsMobile(w < 768);
    };
    resize();
    Dimensions.addEventListener("change", resize);
    return () => Dimensions.removeEventListener("change", resize);
  }, []);

  const validateField = (field, value) => {
  let error = "";

  switch (field) {
    case "name":
      if (!value) error = "Owner name is required";
      else if (value.length > 50) error = "Name must be 0-50 characters";
      break;

    case "business_name":
      if (!value) error = "Business name is required";
      break;

    case "email":
      if (!value) error = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = "Please enter a valid email address";
      }
      break;

    case "password":
      if (!value) error = "Password is required";
      else if (
        !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+=[\]{};':"\\|,.<>/?~-]{8,}$/.test(
          value
        )
      ) {
        error =
          "Password must be at least 8 characters with letters & numbers";
      }
      break;

    case "contact_no":
      if (!value) error = "Contact number is required";
      else if (!/^09\d{9}$/.test(value)) {
        error = "Invalid PH number (09XXXXXXXXX)";
      }
      break;

    case "address":
      if (!value) error = "Address is required";
      break;

    case "description":
      if (!value) error = "Description is required";
      break;

    case "permit":
      if (!value) error = "Permit is required";
      break;

    case "certificates":
      if (!value) error = "Certificate is required";
      break;
  }
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const validate = () => {
    const e = {};
    if (!name) e.name = "Owner name is required";
    else {
      if (name.length > 50) {
        e.name = "Name must be 0-50 characters";
      }
    }
    if (!business_name) e.business_name = "Business name is required";

    if (!email) e.email = "Email is required";
    else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        e.email = "Please enter a valid email address";
      }
    }

    if (!password) e.password = "Password is required";
    else {
      const passwordRegex =
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+=[\]{};':"\\|,.<>/?~-]{8,}$/;
      if (!passwordRegex.test(password)) {
        e.password =
          "Password must be at least 8 characters long and include at least one letter & number";
      }
    }

    if (!address) e.address = "Address is required";
    if (!contact_no) {
      e.contact_no = "Contact number is required";
    } else if (!/^09\d{9}$/.test(contact_no)) {
      e.contact_no =
        "Enter a valid 11-digit Philippine mobile number starting with 09";
    }
    if (!description) e.description = "Description is required";
    if (!permit) e.permit = "Permit is required";
    if (!certificates || certificates.length === 0)
      e.certificates = "Certificate is required";
    return e;
  };

  const handleRegisterClick = () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      Alert.alert("Incomplete Form", "Please fill all required fields.");
      setIsSubmitting(false);
      return;
    }
    setShowConsentModal(true);
  };

  const handleConfirmConsent = async () => {
    setConsent(true);
    setShowConsentModal(false);
    await handleSubmit();
  };

  const [resultVisible, setResultVisible] = useState(false);
  const [resultType, setResultType] = useState(null);
  const [resultMessage, setResultMessage] = useState("");
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      const token = await AsyncStorage.getItem("token");

      const formData = new FormData();
      formData.append("name", name);
      formData.append("registered_business_name", business_name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("address", address);
      formData.append("contact_no", contact_no);
      formData.append("social_link", social_link);
      formData.append("description", description);

      const appendFile = (key, file) => {
        if (!file) return;
        if (Platform.OS === "web") formData.append(key, file.file, file.name);
        else
          formData.append(key, {
            uri: file.uri,
            name: file.name,
            type: file.type,
          });
      };

      appendFile("permit", permit);
      certificates.forEach((file) => {
        if (Platform.OS === "web") {
          formData.append("certificates", file.file, file.name);
        } else {
          formData.append("certificates", {
            uri: file.uri,
            name: file.name,
            type: file.type,
          });
        }
      });
      appendFile("logo", logo);

      await axios.post(
        "https://verilocalph.onrender.com/api/business",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setResultType("success");
      setResultMessage(
        "Your business registration has been submitted successfully.",
      );
      setResultVisible(true);
      setName("");
      setBusinessName("");
      setAddress("");
      setDescription("");
      setPermit(null);
      setCertificates([]);
      setLogo(null);
      setEmail("");
      setPassword("");
      setContactNo("");
      setSocialLink("");
      setErrors({});
      setConsent(false);
    } catch (error) {
      const serverMessage =
        error.response?.data?.message || "Submission failed. Please try again.";

      setResultType("error");
      setResultMessage(serverMessage);
      setResultVisible(true);

      if (serverMessage.toLowerCase().includes("email")) {
        setErrors((prev) => ({
          ...prev,
          email: "This email is already registered!",
        }));
      }

      if (serverMessage.toLowerCase().includes("registered_business_name")) {
        setErrors((prev) => ({
          ...prev,
          business_name: "This business name is already taken!",
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const [fontsLoaded] = useFonts({
    "Montserrat-Regular": require("../../assets/fonts/Montserrat/static/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("../../assets/fonts/Montserrat/static/Montserrat-Bold.ttf"),
  });

  if (!fontsLoaded) return null;


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


  const HoverButton = ({
    children,
    style,
    hoverStyle,
    pressedStyle,
    onPress,
    disabled,
  }) => {
    const [hovered, setHovered] = useState(false);

    return (
      <Pressable
        disabled={disabled}
        onPress={onPress}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={({ pressed }) => [
          style,
          hovered && hoverStyle,
          pressed && pressedStyle,
          disabled && { opacity: 0.5 },
        ]}
      >
        {children}
      </Pressable>
    );
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        flex: 1,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1, marginTop: 100 }}
        contentContainerStyle={{ alignItems: "center", paddingVertical: 20 }}
      >
        <View style={[styles.card, isMobile && { flexDirection: "column" }]}>
          {/* LEFT IMAGE */}
          <View
            style={[
              styles.leftPanel,
              isMobile && { width: "100%", height: 200 },
            ]}
          >
            <Image
              source={
                isMobile
                  ? require("../../assets/images/mobile.png")
                  : require("../../assets/business.png")
              }
              style={styles.leftImage}
              resizeMode={isMobile ? "cover" : "wrap"}
            />
          </View>

          {/* RIGHT FORM */}
          <View style={[styles.rightPanel, isMobile && { width: "100%" }]}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 16,
                width: "100%",
              }}
            >
              <View style={{ flexDirection: "column" }}>
                <Text style={styles.title}>Create An Account</Text>
                <Text style={styles.subtitle}>
                  Join a community of verified artisans protecting local heritage through digital innovation.
                </Text>
              </View>
              {Platform.OS === "web" && (
                <Pressable
                  style={{ padding: 5 }}
                  onPress={() => router.push("/login-business")}
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
              )}
            </View>

            <View style={[styles.row, isMobile && { flexDirection: "column" }]}>
              <View style={[styles.col, isMobile && { minWidth: "100%" }]}>
                <Text style={styles.label}>Owner Name<Text style={{color: "#ff5757", marginLeft: 2,}}>*</Text></Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  value={name}
                  placeholder="Enter owner full name"
                  maxLength={64}
                  onChangeText={(text) => {
                    setName(text);
                    validateField("name", text);
                  }}
                />
                {errors.name && <Text style={styles.error}>{errors.name}</Text>}

                <Text style={styles.label}>Business Name<Text style={{color: "#ff5757", marginLeft: 2,}}>*</Text></Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.business_name && styles.inputError,
                  ]}
                  value={business_name}
                  placeholder="Enter your Business Registered Name"
                  maxLength={64}
                  onChangeText={(text) => {
                    setBusinessName(text);
                    validateField("business_name", text);
                  }}
                />
                {errors.business_name && (
                  <Text style={styles.error}>{errors.business_name}</Text>
                )}

                <Text style={styles.label}>Address<Text style={{color: "#ff5757", marginLeft: 2,}}>*</Text></Text>
                <View style={{ position: "relative", zIndex: 9999 }}>
                  {Platform.OS === "web" ? (
                    <TextInput
                      style={[
                        styles.input,
                        errors.address && styles.inputError,
                      ]}
                      value={address}
                      onChange={(e) => {
                        const value = e.target.value;
                        setAddress(value);
                        searchAddress(value);
                        validateField("address", value);
                      }}
                      placeholder="Enter your complete business address"
                      className="web-address-input"
                    />
                  ) : (
                    <TextInput
                      style={[styles.input]}
                      value={address}
                      onChangeText={(text) => {
                        searchAddress(text);
                        setAddress(text);
                        validateField("address", text);
                      }}
                    />
                  )}
                  {errors.address && (
                    <Text style={styles.error}>{errors.address}</Text>
                  )}
                </View>
                {suggestions.length > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: 60,
                      width: "100%",
                      backgroundColor: "#fff",
                      borderWidth: 1,
                      borderColor: "#ccc",
                      borderRadius: 10,
                      zIndex: 9999,
                    }}
                  >
                    {suggestions.map((item) => (
                      <Pressable
                        key={item.id}
                        onPress={() => {
                          setAddress(item.place_name);
                          setSuggestions([]);
                          validateField("address", item.place_name);
                        }}
                        style={{ padding: 10 }}
                      >
                        <Text>{item.place_name}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>


              <View style={[styles.col, isMobile && { minWidth: "100%" }]}>
                <Text style={[styles.label]}>Email<Text style={{color: "#ff5757", marginLeft: 2,}}>*</Text></Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  value={email}
                  placeholder="Enter your professional email address"
                  onChangeText={(text) => {
                    setEmail(text);
                    validateField("email", text);
                  }}
                  maxLength={64}
                  keyboardType="email-address"
                />
                {errors.email && (
                  <Text style={styles.error}>{errors.email}</Text>
                )}

                <Text style={styles.label}>Password<Text style={{color: "#ff5757", marginLeft: 2,}}>*</Text></Text>
                <TextInput
                  secureTextEntry
                  style={[styles.input, errors.password && styles.inputError]}
                  value={password}
                  placeholder="Enter your strong password"
                  maxLength={64}
                  onChangeText={(text) => {
                    setPassword(text);
                    validateField("password", text);
                  }}
                />
                {errors.password && (
                  <Text style={styles.error}>{errors.password}</Text>
                )}

                <Text style={styles.label}>Contact Number<Text style={{color: "#ff5757", marginLeft: 2,}}>*</Text></Text>
                <TextInput
                  style={[styles.input, errors.contact_no && styles.inputError]}
                  value={contact_no}
                  keyboardType="numeric"
                  placeholder="09XXXXXXXXX"
                  maxLength={11}
                   onChangeText={(t) => {
                    const clean = t.replace(/[^0-9]/g, "");
                    setContactNo(clean);
                    validateField("contact_no", clean);
                  }}
                />
                {errors.contact_no && (
                  <Text style={styles.error}>{errors.contact_no}</Text>
                )}
              </View>

              <View style={[styles.col, isMobile && { minWidth: "100%" }]}>
                <Text style={styles.label}>
                  Social Media Account (Optional)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.social_link && styles.inputError,
                    { borderColor: "#ccc" },
                  ]}
                  value={social_link}
                  placeholder="Paste your Facebook, Instagram, or LinkedIn profile URL"
                  onChangeText={setSocialLink}
                  maxLength={64}
                  keyboardType="social_link"
                />
                {errors.social_link && (
                  <Text style={styles.error}>{errors.social_link}</Text>
                )}

                <Text style={styles.label}>Description<Text style={{color: "#ff5757", marginLeft: 2,}}>*</Text></Text>
                <TextInput
                  multiline
                  style={[
                    styles.textArea,
                    errors.description && styles.inputError,
                  ]}
                  value={description}
                  placeholder="Tell us a little bit about what your business does..."
                 onChangeText={(text) => {
                    setDescription(text);
                    validateField("description", text);
                  }}
                />
                {errors.description && (
                  <Text style={styles.error}>{errors.description}</Text>
                )}
              </View>
            </View>

            <Text style={styles.label}>Business Permit (Mayor's Permit)<Text style={{color: "#ff5757", marginLeft: 2,}}>*</Text> </Text>
            <Pressable
              style={[styles.upload, errors.permit && styles.inputError]}
              onPress={() => pickImage(setPermit)}
            >
              <Text>
                {permit ? (
                  permit.name
                ) : (
                  <FontAwesomeIcon icon={faFileUpload} size="2x" />
                )}
              </Text>
            </Pressable>
            {errors.permit && <Text style={styles.error}>{errors.permit}</Text>}

            <Text style={styles.label}>Certificates (DENR / DTI)<Text style={{color: "#ff5757", marginLeft: 2,}}>*</Text></Text>
            <Pressable
              style={[styles.upload, errors.certificates && styles.inputError]}
              onPress={multipleImages}
            >
              <Text>
                {certificates.length > 0 ? (
                  `${certificates.length} files selected`
                ) : (
                  <FontAwesomeIcon icon={faFileUpload} size="2x" />
                )}
              </Text>
            </Pressable>
            {errors.certificates && (
              <Text style={styles.error}>{errors.certificates}</Text>
            )}

            <Text style={styles.label}>Business Logo (Optional)</Text>
            <Pressable
              style={[styles.upload, { borderColor: "#ccc" }]}
              onPress={() => pickImage(setLogo)}
            >
              <Text>
                {logo ? (
                  logo.name
                ) : (
                  <FontAwesomeIcon icon={faFileUpload} size="2x" />
                )}
              </Text>
            </Pressable>

            <HoverButton
              style={[styles.submitBtn, isMobile && { minWidth: "100%" }]}
              onPress={handleRegisterClick}
              hoverStyle={styles.hoverPrimary}
              pressedStyle={styles.pressedButton}
            >
              <Text style={styles.submitText}>Submit</Text>
            </HoverButton>
          </View>
        </View>

        {/* Consent Modal */}
        {showConsentModal && (
          <View
            style={[
              styles.consentContainer,
              isMobile && { justifyContent: "flex-end" },
            ]}
          >
            <View style={styles.consentCard}>
              <Text style={styles.consentTitle}>
                VeriLocal Terms and Conditions
              </Text>
              <Text style={styles.consentText}>
                Welcome to VeriLocal. By registering for an artisan account, you
                agree to the following terms regarding the use of our platform
                to verify and record local woodcrafts.
              </Text>
              <Text style={styles.consentHeading}>
                1. Accuracy of Business Information
              </Text>
              <Text style={styles.consentText}>
                To maintain the integrity of the platform, you agree to provide
                accurate, current, and complete business credentials during
                registration. This includes submitting valid business permits,
                accurate contact details, and true shop locations. VeriLocal
                reserves the right to suspend accounts found to be using
                falsified documents.
              </Text>
              <Text style={styles.consentHeading}>
                2. Blockchain and Data Permanence
              </Text>
              <Text style={styles.consentText}>
                VeriLocal utilizes blockchain technology to create secure
                digital records for your woodcrafts. You acknowledge that once a
                product is "minted" to the blockchain, the record becomes
                permanent and immutable (unchangeable). You are solely
                responsible for ensuring that all product details, materials,
                and process images are accurate before finalizing a
                registration.
              </Text>
              <Text style={styles.consentHeading}>
                3. Data Storage and Privacy
              </Text>
              <Text style={styles.consentText}>
                By uploading files to the platform, you consent to the storage
                of your media (such as business permits and process images) on
                secure off-chain cloud servers. Your business profile
                information and product provenance data will be made publicly
                accessible via QR code scans to facilitate tourist verification.
              </Text>
              <Text style={styles.consentHeading}>4. Acceptable Use</Text>
              <Text style={styles.consentText}>
                You agree to use the platform exclusively for registering
                genuine, locally crafted goods. You may not upload prohibited
                items, plagiarized designs, or inappropriate media.
              </Text>
              <View style={{ marginTop: "auto", paddingTop: 20 }}>
                <Pressable
                  onPress={handleConfirmConsent}
                  style={{
                    backgroundColor: "#e98669",
                    padding: 8,
                    borderRadius: 10,
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Montserrat-Regular",
                      fontWeight: "700",
                      textAlign: "center",
                    }}
                  >
                    I Agree / Confirm
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowConsentModal(false)}
                  style={{ padding: 2 }}
                >
                  <Text
                    style={{
                      fontFamily: "Montserrat-Regular",
                      textAlign: "center",
                      color: "#444",
                    }}
                  >
                    Cancel
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Loading */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#5177b0" />
              <Text style={{ marginTop: 10 }}>Submitting Business.....</Text>
            </View>
          </View>
        )}
      </ScrollView>
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
                { color: resultType === "success" ? "#2e7d32" : "#c62828" },
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "90%",
    maxWidth: 1300,
    minHeight: 400,
    backgroundColor: "#f2f8fc",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#cae2f3",
    overflow: "hidden",
    flexDirection: "row",
    elevation: 6,
    alignSelf: "center",
  },
  leftPanel: {
    width: "25%",
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
    height: "100%",
    backgroundColor: "#f0f0f0",
  },
  leftImage: {
    width: "100%",
    height: "100%",
  },
  rightPanel: {
    flex: 1,
    padding: 28,
    backgroundColor: "#f3f7fb",
  },
  successMessage: {
    backgroundColor: "#d4edda",
    color: "#155724",
    fontFamily: "Montserrat-Regular",
  },
  errorMessage: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    fontFamily: "Montserrat-Regular",
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: -5,
    textAlign: "left",
    color: "#223049",
    fontFamily: "Garet-Heavy  ",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#223049",
    marginBottom: 14,
    textAlign: "left",
    fontWeight: "100",
    fontFamily: "Garet-Book",
  },
  hoverPrimary: {
  backgroundColor: "#1e3a5f",
  transform: [{ scale: 1.01 }],
  },

  hoverSecondary: {
    backgroundColor: "#F3F4F6 ",
    transform: [{ scale: 1.01 }],
  },

  pressedButton: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
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
    marginTop: 5,
    color: "#223049",
    marginBottom: 4,
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
    alignItems: "center",
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
  },
  textArea: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 16,
    height: 125,
    textAlignVertical: "top",
    marginBottom: 4,
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
  },
  inputError: {
    borderColor: "red",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginBottom: 5,
  },
  upload: {
    borderWidth: 1,
    width: "97%",
    borderStyle: "dashed",
    borderColor: "#ccc",
    padding: 25,
    borderRadius: 12,
    marginTop: 6,
    alignItems: "center",
  },
  submitBtn: {
    backgroundColor: "#375a96",
    padding: 12,
    borderRadius: 14,
    marginTop: 25,
    alignItems: "center",
    marginBottom: 5,
  },
  submitText: {
    color: "#fff",
    fontWeight: "600",
    fontFamily: "Montserrat-Regular",
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
    zIndex: 999,
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
  consentContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  consentCard: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 16,
    width: "100%",
    maxWidth: 650,
    minHeight: 250,
    flexDirection: "space-between",
  },
  consentTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    marginBottom: 5,
    fontWeight: "500",
  },
  consentText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    marginBottom: 20,
    fontWeight: "300",
  },
  consentHeading: {
    fontFamily: "Montserrat-Bold",
    fontSize: 12,
    marginBottom: 5,
    fontWeight: "500",
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
});
