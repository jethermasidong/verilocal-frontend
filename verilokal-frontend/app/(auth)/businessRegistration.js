import { faFileUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFonts } from "expo-font";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
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
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");
  const [errors, setErrors] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [submitting, setIsSubmitting] = useState(false);
  
  const loadGooglePlaces = () =>
  new Promise((resolve, reject) => {
    if (
      window.google?.maps?.places ||
      document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')
    ) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyA493-QTAo8nnU_qzSNEXhc5sQDINRz2TU&libraries=places";
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;

    document.head.appendChild(script);
  });
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null); 

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
            })
          );
  
          setCertificates(prev => [...prev, ...selectedImages]);
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

  const validate = () => {
    const e = {};
    if (!name) e.name = "Owner name is required";
    if (!business_name) e.business_name = "Business name is required";
    if (!email) e.email = "Email is required";
    if (!password) e.password = "Password is required";
    if (!address) e.address = "Address is required";
    if (!contact_no) e.contact_no = "Contact number is required";
    if (!description) e.description = "Description is required";
    if (!permit) e.permit = "Permit is required";
    if (!certificates || certificates.length === 0) e.certificates = "Certificate is required";
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
        else formData.append(key, { uri: file.uri, name: file.name, type: file.type });
      };

      appendFile("permit", permit);
      certificates.forEach(file => {
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

      await axios.post("http://localhost:3000/api/business", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      
      Alert.alert("Success", "Registration submitted.");
      setStatusMessage("✅ Business Submitted, Wait for the confirmation on your email account!");
      setStatusType("success");
      setName(""); setBusinessName(""); setAddress(""); setDescription("");
      setPermit(null); setCertificates([]); setLogo(null);
      setEmail(""); setPassword(""); setContactNo(""); setSocialLink(""); setErrors({}); setConsent(false);

    } catch (error){
      const serverMessage = error.response?.data?.message || "Submission failed. Please try again.";
      Alert.alert("Error", "Submission failed.");
      setStatusMessage("Failed to register business!");
      setStatusType(error);

      if (serverMessage.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: "This email is already registered!"}));
      }
      if (serverMessage.toLowerCase().includes('registered_business_name')) {
        setErrors(prev => ({ ...prev, email: "This business name is already taken!"}));
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
    if (Platform.OS !== "web") return;

    let listener;

    loadGooglePlaces().then(() => {
      if (!addressInputRef.current) return;

      autocompleteRef.current =
        new window.google.maps.places.Autocomplete(
          addressInputRef.current,
          {
            types: ["address"],
            componentRestrictions: { country: "ph" },
          }
        );

      listener = autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();
        if (!place?.formatted_address) return;
        setAddress(place.formatted_address);
      });
    });

    return () => {
      if (listener) listener.remove();
    };
  }, []);

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

  return (
    <Animated.View style = 
      {{ 
        opacity: fadeAnim,
        flex: 1,
        transform: [{ translateY: slideAnim }],
      }}>
    <ScrollView
      keyboardShouldPersistTaps="handled"
      style={{ flex: 1, backgroundColor: "#f6f7fb" }}
      contentContainerStyle={{ alignItems: "center", paddingVertical: 20 }}
    >
      <View style={[styles.card, isMobile && { flexDirection: "column" }]}>
        {/* LEFT IMAGE */}
        <View style={[styles.leftPanel, isMobile && { width: "100%", height: 200 }]}>
          <Image
            source={require("../../assets/business.png")}
            style={styles.leftImage}
            resizeMode="cover"
          />
        </View>

        {/* RIGHT FORM */}
        <View style={[styles.rightPanel, isMobile && { width: "100%" }]}>
          <Text style={styles.title}>Business Registration</Text>
          <Text style={styles.subtitle}>Register your business to be part of our community</Text>
          <View style={[styles.row, isMobile && { flexDirection: "column" }]}>
            <View style={[styles.col, isMobile && { minWidth: "100%"}]}>
              <Text style={styles.label}>Owner Name*</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={name}
                placeholder='Enter owner full name'
                onChangeText={setName}
              />
              {errors.name && <Text style={styles.error}>{errors.name}</Text>}

              <Text style={styles.label}>Business Name*</Text>
              <TextInput
                style={[styles.input, errors.business_name && styles.inputError]}
                value={business_name}
                placeholder='Enter your registered business name'
                onChangeText={setBusinessName}
              />
              {errors.business_name && <Text style={styles.error}>{errors.business_name}</Text>}

              <Text style={styles.label}>Address*</Text>
                <View style={{ position: "relative", zIndex: 9999 }}>
                  {Platform.OS === "web" ? (
                    <TextInput
                      style={[ styles.input, errors.address && styles.inputError ]}
                      ref={addressInputRef}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your complete business address"
                      className="web-address-input"
                      autoComplete="off"
                    />
                  ) : (
                    <TextInput
                      style={[styles.input]}
                      value={address}
                      onChangeText={setAddress}
                    />
                  )}
                  {errors.address && <Text style={styles.error}>{errors.address}</Text>}
                </View>
              </View>
            <View style={[styles.col, isMobile && { minWidth: "100%"}]}>
              <Text style={[styles.label,isMobile && { marginTop: -10}]}>Email*</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={email}
                placeholder='Enter your professional email address'
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              {errors.email && <Text style={styles.error}>{errors.email}</Text>}

              <Text style={styles.label}>Password*</Text>
              <TextInput
                secureTextEntry
                style={[styles.input, errors.password && styles.inputError]}
                value={password}
                placeholder='Enter your strong password'
                onChangeText={setPassword}
              />
              {errors.password && <Text style={styles.error}>{errors.password}</Text>}

              <Text style={styles.label}>Contact Number*</Text>
              <TextInput
                style={[styles.input, errors.contact_no && styles.inputError]}
                value={contact_no}
                keyboardType="numeric"
                placeholder='Enter your mobile or landline number'
                maxLength={11}
                onChangeText={(t) => setContactNo(t.replace(/[^0-9]/g, ""))}
              />
              {errors.contact_no && <Text style={styles.error}>{errors.contact_no}</Text>}
            </View>

            <View style={[styles.col, isMobile && { minWidth: "100%"}]}>
              <Text style={[styles.label,isMobile && { marginTop: -22}]}>Social Link*</Text>
              <TextInput
                style={[styles.input, errors.social_link && styles.inputError]}
                value={social_link}
                placeholder='Paste your Facebook, Instagram, or LinkedIn profile URL'
                onChangeText={setSocialLink}
                keyboardType="social_link"
              />
              {errors.social_link && <Text style={styles.error}>{errors.social_link}</Text>}

              <Text style={styles.label}>Description*</Text>
              <TextInput
                multiline
                style={[styles.textArea, errors.description && styles.inputError]}
                value={description}
                placeholder='Tell us a little bit about what your business does...'
                onChangeText={setDescription}
              />
              {errors.description && <Text style={styles.error}>{errors.description}</Text>}
            </View>
          </View>


          <Text style={styles.label}>Business Permit* (Mayor's Permit) </Text>
          <Pressable style={styles.upload} onPress={() => pickImage(setPermit)}>
            <Text>{permit ? permit.name : <FontAwesomeIcon icon={faFileUpload} size="2x" />}</Text>
          </Pressable>
          {errors.permit && <Text style={styles.error}>{errors.permit}</Text>}
          
          <Text style={styles.label}>Certificates* (DENR / DTI)</Text>
          <Pressable style={styles.upload} onPress={multipleImages}>
            <Text>
              {certificates.length > 0
                ? `${certificates.length} files selected`
                : <FontAwesomeIcon icon={faFileUpload} size="2x" />}
            </Text>
          </Pressable>
          {errors.certificates && <Text style={styles.error}>{errors.certificates}</Text>}

          <Text style={styles.label}>Business Logo (Optional)</Text>
          <Pressable style={styles.upload} onPress={() => pickImage(setLogo)}>
            <Text>{logo ? logo.name : <FontAwesomeIcon icon={faFileUpload} size="2x" />}</Text>
          </Pressable>

          <Pressable style={[styles.submitBtn, isMobile && { minWidth: "100%"}]} onPress={handleRegisterClick}>
            <Text style={styles.submitText}>Submit</Text>
          </Pressable>

          {statusMessage ? (
        <Text style={[styles.statusMessage, statusType === "success" ? styles.successMessage : styles.errorMessage]}>
          {statusMessage}
        </Text>  
      ) : null}
        </View>
      </View>
      

      {/* Consent Modal */}
      {showConsentModal && (
        <View style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: isMobile ? "flex-end" : "center",
          alignItems: "center",
          padding: 20,
        }}>
          <View style={{
            backgroundColor: "#fff",
            padding: 20,
            borderRadius: 16,
            width: "100%",
            maxWidth: 400,
          }}>
            <Text style={{ fontFamily: "Montserrat-Regular", fontSize: 16, marginBottom: 20 }}>
              By submitting this business registration, you consent to the collection and processing of your personal data for verification purposes.
            </Text>
            <Pressable onPress={handleConfirmConsent} style={{ backgroundColor: "#e98669", padding: 12, borderRadius: 10, marginBottom: 10 }}>
              <Text style={{ fontFamily: "Montserrat-Regular", fontWeight: "700", textAlign: "center" }}>I Agree / Confirm</Text>
            </Pressable>
            <Pressable onPress={() => setShowConsentModal(false)} style={{ padding: 12 }}>
              <Text style={{ fontFamily: "Montserrat-Regular", textAlign: "center", color: "#444" }}>Cancel</Text>
            </Pressable>
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
        <Text style={{ marginTop: 10 }}>Submitting Business.....</Text>
      </View>
    </View>
  )}
    </ScrollView>
  </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "80%",
    maxWidth: 1300,
    minHeight: 400,
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    flexDirection: "row",
    elevation: 6,
  },
  leftPanel: {
    width: "25%",
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
    height: "100%",
  },
  leftImage: {
    width: "100%",
    height: "100%",
  },
  rightPanel: {
    flex: 1,
    padding: 28,
    backgroundColor: "#fff",
  },
  statusMessage: { padding: 10, borderRadius: 8, textAlign: "center", fontWeight: "600", marginTop: 20, fontFamily: "Montserrat-Regular" },
  successMessage: { backgroundColor: "#d4edda", color: "#155724", fontFamily: "Montserrat-Regular" },
  errorMessage: { backgroundColor: "#f8d7da", color: "#721c24", fontFamily: "Montserrat-Regular" },
  title: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 2,
    textAlign: "left",
    fontFamily: "Montserrat-Bold",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 14,
    textAlign: "left",
    fontFamily: "Montserrat-Regular",
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
    marginTop: 0,
    marginBottom: 4,
    fontFamily: "Montserrat-Regular",
    fontSize: 12
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
    fontSize: 12
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
    fontSize: 12

  },
  inputError: {
    borderColor: "red",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginBottom: 12,
  },
  upload: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#aaa",
    padding: 30,
    borderRadius: 12,
    marginTop: 6,
    alignItems: "center",
  },
  submitBtn: {
    backgroundColor: "#5177b0",
    padding: 16,
    borderRadius: 14,
    marginTop: 25,
    alignItems: "center",
    marginBottom: 5,
  },
  submitText: {
    color: "#fff",
    fontWeight: "600",
    fontFamily: "Montserrat-Regular"
  },

});
