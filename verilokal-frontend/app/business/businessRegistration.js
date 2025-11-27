import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFonts } from "expo-font";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function RegisterProduct() {
  const [name, setOwnerName] = useState("");
  const [address, setAddress] = useState("");
  const [business_name, setRegisteredBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [product_img, setProductImage] = useState(null);
  const [certificates, setCertificates] = useState(null);
  const [logo, setBusinessLogo] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contact_no, setContactNo] = useState("");
  const [show, setShow] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [statusType, setStatusType] = useState("success");
  const [consent, setConsent] = useState(false);

  const pickImage = async (setState) => {
    try {
      if (Platform.OS === "web") {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (event) => {
          const file = event.target.files[0];
          if (file) {
            setState({ uri: URL.createObjectURL(file), file, name: file.name, type: file.type });
          }
        };
        input.click();
      } else {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
        if (!result.canceled) {
          const file = result.assets[0];
          setState({ uri: file.uri, name: file.fileName || "photo.jpg", type: file.mimeType || "image/jpeg" });
        }
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not pick image.");
    }
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(Dimensions.get("window").width < 600);
    handleResize();
    Dimensions.addEventListener("change", handleResize);
    return () => Dimensions.removeEventListener("change", handleResize);
  }, []);

  const handleSubmit = async () => {
    setErrors({});
    const newErrors = {};
    if (!name) newErrors.name = "Owner name is required!";
    if (!address) newErrors.address = "Address is required!";
    if (!business_name) newErrors.business_name = "Business name is required!";
    if (!description) newErrors.description = "Description is required!";
    if (!product_img) newErrors.product_img = "Certificate is required!";
    if (!certificates) newErrors.certificates = "Business Permit is required!";
    if (!email) newErrors.email = "Email is required!";
    if (!password) newErrors.password = "Password is required!";
    if (!contact_no) newErrors.contact_no = "Contact Number is required!";
    if (contact_no && contact_no.length !== 11) newErrors.contact_no = "Contact number must be 11 digits!";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Please enter a valid email address!";
    if (!consent) newErrors.consent = "You must give consent to proceed!";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setStatusMessage("Please fix the errors above.");
      setStatusType("error");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Unauthorized", "Please login first.");
        return;
      }

      setStatusMessage("Registering business...");
      setStatusType("success");

      const formData = new FormData();
      formData.append("name", name);
      formData.append("address", address);
      formData.append("registered_business_name", business_name);
      formData.append("description", description);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("contact_no", contact_no);

      const appendFile = (key, file) => {
        if (!file) return;
        if (Platform.OS === "web") formData.append(key, file.file);
        else formData.append(key, { uri: file.uri, name: file.name, type: file.type });
      };

      appendFile("product_img", product_img);
      appendFile("certificates", certificates);
      appendFile("logo", logo);

      const response = await axios.post("https://backend1-al4l.onrender.com/api/business", formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });

      Alert.alert("Success", "Business registered successfully!");
      setStatusMessage("✅ Business Submitted, Wait for the confirmation on your email account!");
      setStatusType("success");
      setOwnerName(""); setAddress(""); setRegisteredBusinessName("");
      setDescription(""); setProductImage(null); setCertificates(null); setBusinessLogo(null);
      setEmail(""); setPassword(""); setContactNo(""); setErrors({}); setConsent(false);

    } catch (error) {
      const msg = error.response?.data?.message;

      if (msg?.includes("Registered Business Name")) setErrors(prev => ({ ...prev, business_name: "Business Name already exists!" }));
      if (msg?.includes("Email")) setErrors(prev => ({ ...prev, email: "Email already exists!" }));

      setStatusMessage("❌ Failed to register business.");
      setStatusType("error");
    }
  };

  const [fontsLoaded] = useFonts({
    "Garet-Book": require("../../assets/fonts/garet/Garet-Book.ttf"),
    "Garet-Heavy": require("../../assets/fonts/garet/Garet-Heavy.ttf"),
    "Montserrat-Regular": require("../../assets/fonts/Montserrat/static/Montserrat-Regular.ttf"),
  });

  if (!fontsLoaded) return <View><Text>Loading fonts...</Text></View>;

  return (
    <ScrollView style={styles.container(isMobile)} contentContainerStyle={styles.scrollContainer(isMobile)}>
      <Text style={styles.title(isMobile)}>Register Business</Text>
      <View style={{ flexDirection: isMobile ? "column" :"row", justifyContent: "space-between", flexWrap: "wrap", gap: 40 }}>

        {/* LEFT COLUMN */}
        <View style={{ flex: 1 }}>
          {/** Owner Name */}
          <Text style={styles.label}>OWNER NAME*</Text>
          <TextInput
            placeholder="Name of the Owner"
            value={name}
            onChangeText={setOwnerName}
            style={styles.input(isMobile, !!errors.name)}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          {/** Address */}
          <Text style={styles.label}>ADDRESS*</Text>
          <TextInput
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
            style={styles.input(isMobile, !!errors.address)}
          />
          {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

          {/** Business Name */}
          <Text style={styles.label}>BUSINESS NAME*</Text>
          <TextInput
            placeholder="Your DTI Registered Business Name"
            value={business_name}
            onChangeText={setRegisteredBusinessName}
            style={styles.input(isMobile, !!errors.business_name)}
          />
          {errors.business_name && <Text style={styles.errorText}>{errors.business_name}</Text>}


          {/** Email */}
          <Text style={styles.label}>EMAIL*</Text>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input(isMobile, !!errors.email)}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {/** Password */}
          <Text style={styles.label}>PASSWORD*</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!show}
              style={styles.passwordInput(isMobile, !!errors.password)}
            />
            <Pressable style={styles.showButton} onPress={() => setShow(!show)}>
              <Text style={styles.showButtonText}>{show ? "Hide" : "Show"}</Text>
            </Pressable>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          {/** Contact Number */}
          <Text style={styles.label}>CONTACT NUMBER*</Text>
          <TextInput
            placeholder="Contact Number"
            value={contact_no}
            keyboardType="numeric"
            maxLength={11}
            onChangeText={(text) => setContactNo(text.replace(/[^0-9]/g, ""))}
            style={styles.input(isMobile, !!errors.contact_no)}
          />
          {errors.contact_no && <Text style={styles.errorText}>{errors.contact_no}</Text>}
        </View>

        {/* RIGHT COLUMN */}
        <View style={{ flex: 1, top: isMobile ? -250 : 0 }}>
          {/** Description */}
          <Text style={styles.label}>DESCRIPTION*</Text>
          <TextInput
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            style={[styles.input(isMobile, !!errors.description), { height: isMobile ? 300 : 125, textAlignVertical: "top" }]}
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

          {/** Product Image */}
            <Text style={styles.label}>CERTIFICATE*</Text>
            <Pressable
              onPress={() => pickImage(setProductImage)}
              style={[styles.uploadBox(isMobile), !!errors.product_img && { borderColor: "red" }]}
            >
              <Text style={{ fontSize: 26 }}>📷</Text>
              {!product_img && <Text style={styles.uploadText}>Upload Certificate</Text>}
              {product_img && <Text style={styles.uploadedText}>Uploaded: {product_img.name}</Text>}
            </Pressable>
            {errors.product_img && <Text style={[styles.errorText, { marginTop: -15, marginBottom: 20 }]}>{errors.product_img}</Text>}

            {/** Business Permit/Mayor's Permit */}
            <Text style={styles.label}>BUSINESS PERMIT*</Text>
            <Pressable
              onPress={() => pickImage(setCertificates)}
              style={[styles.uploadBox(isMobile), !!errors.certificates && { borderColor: "red" }]}
            >
              <Text style={{ fontSize: 26 }}>📜</Text>
              {!certificates && <Text style={styles.uploadText}>Upload Business Permit</Text>}
              {certificates && <Text style={styles.uploadedText}>Uploaded: {certificates.name}</Text>}
            </Pressable>
            {errors.certificates && <Text style={[styles.errorText, { marginTop: -15, marginBottom: 20 }]}>{errors.certificates}</Text>}

            {/** Business Logo */}
            <Text style={styles.label}>BUSINESS LOGO (Optional)</Text>
            <Pressable
              onPress={() => pickImage(setBusinessLogo)}
              style={[styles.uploadBox(isMobile), !!errors.logo && { borderColor: "red" }]}
            >
              <Text style={{ fontSize: 26 }}>🏢</Text>
              {!logo && <Text style={styles.uploadText}>Upload Business Logo</Text>}
              {logo && <Text style={styles.uploadedText}>Uploaded: {logo.name}</Text>}
            </Pressable>
            {errors.logo && <Text style={[styles.errorText, { marginTop: -15, marginBottom: 20 }]}>{errors.logo}</Text>}


          {/** Consent */}
          <Pressable style={styles.consentRow} onPress={() => setConsent(!consent)}>
            <View style={[styles.checkbox, consent && styles.checkboxChecked]}>
              {consent && <Text style={styles.checkmark}>✔</Text>}
            </View>
            <Text style={{ flex: 1, fontFamily: "Montserrat-Regular" }}>
              I consent to the collection and processing of my personal data for verification purposes.
            </Text>
          </Pressable>

          {errors.consent && <Text style={styles.errorText}>{errors.consent}</Text>}

          <Pressable onPress={handleSubmit} style={styles.submitButton(isMobile)}>
            <Text style={styles.submitText}>Submit Product</Text>
          </Pressable>
        </View>
      </View>

      {statusMessage ? (
        <Text style={[styles.statusMessage(isMobile), statusType === "success" ? styles.successMessage : styles.errorMessage]}>
          {statusMessage}
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: (isMobile) => ({ flex: 1, backgroundColor: "#FFFFFF" }),
  scrollContainer: (isMobile) => ({ paddingVertical: isMobile ? 16 : 24, paddingHorizontal: isMobile ? 30 : 70 }),
  title: (isMobile) => ({ fontSize: isMobile ? 30 : 40, marginBottom: 20, fontWeight: "bold", fontFamily: "Garet-Heavy" }),
  label: { fontSize: 14, fontWeight: "700", fontFamily: "Montserrat-Regular", marginBottom: 6 },
  input: (isMobile, hasError) => ({ borderWidth: 1, borderColor: hasError ? "red" : "#000", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 8, backgroundColor: "#FFFFFF", fontFamily: "Montserrat-Regular", fontSize: 13 }),
  errorText: { color: "red", fontSize: 12, marginTop: 1, marginBottom: 8, fontFamily: "Montserrat-Regular" },
  uploadBox: (isMobile) => ({ borderWidth: 1.5, borderStyle: "dashed", borderColor: "#999", borderRadius: 10, paddingVertical: isMobile ? 20 : 30, alignItems: "center", marginBottom: 20, backgroundColor: "#fafafa", height: isMobile ? 100 : 125, justifyContent: "center",}),
  uploadText: { fontSize: 16, fontWeight: "600", color: "#444" },
  uploadedText: { fontWeight: "600", textAlign: "center", marginBottom: 0, fontFamily: "Montserrat-Regular", color: "#0A84FF" },
  consentRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  checkbox: { width: 20, height: 20, borderWidth: 1, borderColor: "#444", borderRadius: 4, marginRight: 8, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  checkboxChecked: { backgroundColor: "#0A84FF" },
  checkmark: { color: "#fff", fontWeight: "bold" },
  submitButton: (isMobile) => ({ backgroundColor: "#e98669", paddingVertical: 14, borderRadius: 20, alignSelf: "center", width: 160, marginTop: 10 }),
  submitText: { color: "#000", fontWeight: "700", fontFamily: "Montserrat-Regular", textAlign: "center", letterSpacing: 1 },
  statusMessage: (isMobile) => ({ padding: 10, borderRadius: 8, textAlign: "center", fontWeight: "600", marginTop: isMobile ? -235 : 20 }),
  successMessage: { backgroundColor: "#d4edda", color: "#155724", fontFamily: "Montserrat-Regular" },
  errorMessage: { backgroundColor: "#f8d7da", color: "#721c24", fontFamily: "Montserrat-Regular" },
  passwordWrapper: { position: "relative", width: "100%", justifyContent: "center" },
  passwordInput: (isMobile, hasError) => ({ borderWidth: 1, borderColor: hasError ? "red" : "#000", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 10, backgroundColor: "#FFFFFF", fontFamily: "Montserrat-Regular", fontSize: 13, paddingRight: 70 }),
  showButton: { position: "absolute", right: 14, padding: 4, top: 7 },
  showButtonText: { fontFamily: "Montserrat-Regular", fontSize: 14, color: "#444" },
});
