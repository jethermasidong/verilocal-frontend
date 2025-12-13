import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFonts } from "expo-font";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
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
  const [product_img, setProductImage] = useState(null);
  const [certificates, setCertificates] = useState(null);
  const [logo, setLogo] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contact_no, setContactNo] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");
  const [errors, setErrors] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [consent, setConsent] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

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
    if (!product_img) e.product_img = "Certificate is required";
    if (!certificates) e.certificates = "Business permit is required";
    return e;
  };

  const handleRegisterClick = () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setShowConsentModal(true);
  };

 
  const handleConfirmConsent = () => {
    setConsent(true);
    setShowConsentModal(false);
    handleSubmit();
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    if (!consent) {
      Alert.alert("Consent Required", "You must agree to proceed.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      setStatusMessage("Registering business......");
      setStatusType("success");
      const formData = new FormData();
      formData.append("name", name);
      formData.append("registered_business_name", business_name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("address", address);
      formData.append("contact_no", contact_no);
      formData.append("description", description);

      const appendFile = (key, file) => {
        if (!file) return;
        if (Platform.OS === "web") formData.append(key, file.file);
        else formData.append(key, { uri: file.uri, name: file.name, type: file.type });
      };

      appendFile("product_img", product_img);
      appendFile("certificates", certificates);
      appendFile("logo", logo);

      await axios.post("https://backend1-al4l.onrender.com/api/business", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      
      Alert.alert("Success", "Registration submitted.");
      setStatusMessage("✅ Business Submitted, Wait for the confirmation on your email account!");
      setStatusType("success");
      setName(""); setBusinessName(""); setAddress(""); setDescription("");
      setProductImage(null); setCertificates(null); setLogo(null);
      setEmail(""); setPassword(""); setContactNo(""); setErrors({}); setConsent(false);

    } catch {
      Alert.alert("Error", "Submission failed.");
      setStatusMessage("Failed to register business!");
      setStatusType(error);
    }
  };

  const [fontsLoaded] = useFonts({
    "Montserrat-Regular": require("../../assets/fonts/Montserrat/static/Montserrat-Regular.ttf"),
  });
  if (!fontsLoaded) return null;

  return (
    <ScrollView
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
          <Text style={styles.title}>Register Business</Text>
          <View style={[styles.row, isMobile && { flexDirection: "column" }]}>
            <View style={[styles.col, isMobile && { minWidth: "100%"}]}>
              <Text style={styles.label}>Owner Name*</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={name}
                onChangeText={setName}
              />
              {errors.name && <Text style={styles.error}>{errors.name}</Text>}

              <Text style={styles.label}>Business Name*</Text>
              <TextInput
                style={[styles.input, errors.business_name && styles.inputError]}
                value={business_name}
                onChangeText={setBusinessName}
              />
              {errors.business_name && <Text style={styles.error}>{errors.business_name}</Text>}

              <Text style={styles.label}>Email*</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              {errors.email && <Text style={styles.error}>{errors.email}</Text>}
            </View>

            <View style={[styles.col, isMobile && { minWidth: "100%"}]}>
              <Text style={styles.label}>Address*</Text>
              <TextInput
                style={[styles.input, errors.address && styles.inputError]}
                value={address}
                onChangeText={setAddress}
              />
              {errors.address && <Text style={styles.error}>{errors.address}</Text>}

              <Text style={styles.label}>Contact Number*</Text>
              <TextInput
                style={[styles.input, errors.contact_no && styles.inputError]}
                value={contact_no}
                keyboardType="numeric"
                maxLength={11}
                onChangeText={(t) => setContactNo(t.replace(/[^0-9]/g, ""))}
              />
              {errors.contact_no && <Text style={styles.error}>{errors.contact_no}</Text>}

              <Text style={styles.label}>Password*</Text>
              <TextInput
                secureTextEntry
                style={[styles.input, errors.password && styles.inputError]}
                value={password}
                onChangeText={setPassword}
              />
              {errors.password && <Text style={styles.error}>{errors.password}</Text>}
            </View>
          </View>

          <Text style={styles.label}>Description*</Text>
          <TextInput
            multiline
            style={[styles.textArea, errors.description && styles.inputError]}
            value={description}
            onChangeText={setDescription}
          />
          {errors.description && <Text style={styles.error}>{errors.description}</Text>}

          <Pressable style={styles.upload} onPress={() => pickImage(setProductImage)}>
            <Text>{product_img ? product_img.name : "Upload Certificate*"}</Text>
          </Pressable>
          {errors.product_img && <Text style={styles.error}>{errors.product_img}</Text>}

          <Pressable style={styles.upload} onPress={() => pickImage(setCertificates)}>
            <Text>{certificates ? certificates.name : "Upload Business Permit*"}</Text>
          </Pressable>
          {errors.certificates && <Text style={styles.error}>{errors.certificates}</Text>}

          <Pressable style={styles.upload} onPress={() => pickImage(setLogo)}>
            <Text>{logo ? logo.name : "Upload Business Logo"}</Text>
          </Pressable>

          <Pressable style={styles.submitBtn} onPress={handleRegisterClick}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "85%",
    maxWidth: 1100,
    minHeight: 400,
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    flexDirection: "row",
    elevation: 6,
  },
  leftPanel: {
    width: "40%",
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
  statusMessage: { padding: 10, borderRadius: 8, textAlign: "center", fontWeight: "600", marginTop: 20 },
  successMessage: { backgroundColor: "#d4edda", color: "#155724", fontFamily: "Montserrat-Regular" },
  errorMessage: { backgroundColor: "#f8d7da", color: "#721c24", fontFamily: "Montserrat-Regular" },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "Montserrat-Bold",
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
    marginBottom: 6,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
    alignItems: "center",
  },
  textArea: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 16,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 4,
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
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
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
  },
});
