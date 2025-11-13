import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";

export default function RegisterProduct() {
  const [name, setOwnerName] = useState("");
  const [address, setAddress] = useState("");
  const [business_name, setRegisteredBusinessName] = useState("");
  const [registration_number, setRegistrationNumber] = useState("");
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

  const handleSubmit = async () => {
    setErrors({});
    const newErrors = {};
    if (!name) newErrors.name = "Owner name is required!";
    if (!address) newErrors.address = "Address is required!";
    if (!business_name) newErrors.business_name = "Business name is required!";
    if (!registration_number) newErrors.registration_number = "Registration number is required!";
    if (!description) newErrors.description = "Description is required!";
    if (!product_img) newErrors.product_img = "Product image is required!";
    if (!certificates) newErrors.certificates = "Certificate is required!";
    if (!logo) newErrors.logo = "Business logo is required!";
    if (!email) newErrors.email = "Email is required!";
    if (!password) newErrors.password = "Password is required!";
    if (!contact_no) newErrors.contact_no = "Contact Number is required!";
    if (contact_no && contact_no.length !== 11) newErrors.contact_no = "Contact number must be 11 digits!";
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)){
            newErrors.email = "Please enter a valid email address!";
        }
    }
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

      setStatusMessage("Registering product...");
      setStatusType("success");

      const formData = new FormData();
      formData.append("name", name);
      formData.append("address", address);
      formData.append("registered_business_name", business_name);
      formData.append("registration_number", registration_number);
      formData.append("description", description);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("contact_no", contact_no);

      const appendFile = (key, file) => {
        if (Platform.OS === "web") {
          formData.append(key, file.file);
        } else {
          formData.append(key, { uri: file.uri, name: file.name, type: file.type });
        }
      };

      appendFile("product_img", product_img);
      appendFile("certificates", certificates);
      appendFile("logo", logo);

      const response = await axios.post("http://localhost:3000/api/business", formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });

      Alert.alert("Success", "Business registered successfully!");
      setStatusMessage("✅ Business Registered Successfully!");
      setStatusType("success");
      setOwnerName(""); setAddress(""); setRegisteredBusinessName(""); setRegistrationNumber("");
      setDescription(""); setProductImage(null); setCertificates(null); setBusinessLogo(null);
      setEmail(""); setPassword(""); setContactNo(""); setErrors({}); setConsent(false)

    } catch (error) {
    const msg = error.response?.data?.message;
    if (msg?.includes("Registered Business Name")) setErrors(prev => ({ ...prev, business_name: "Business Name already exists!" }));
    if (msg?.includes("Registration Number")) setErrors(prev => ({ ...prev, registration_number: "Registration Number already exists!" }));
    if (msg?.includes("Email")) setErrors(prev => ({ ...prev, email: "Email already exists!" }));
    
    setStatusMessage("❌ Failed to register business.");
    setStatusType("error");
  }
};
 
  return (

    <ScrollView style={{flex: 1, backgroundColor: "#FFFFFF", }}contentContainerStyle={{ padding: 20,}}>
      <Text style={{ fontSize: 24, marginBottom: 20, fontWeight: "bold" }}>Register Business</Text>
      {/** Owner Name */}
      <TextInput placeholder="Name of the Owner" value={name} onChangeText={setOwnerName} style={inputStyle} />
      {errors.name && <Text style={errorText}>{errors.name}</Text>}

      {/** Address */}
      <TextInput placeholder="Address" value={address} onChangeText={setAddress} style={inputStyle} />
      {errors.address && <Text style={errorText}>{errors.address}</Text>}

      {/** Business Name */}
      <TextInput placeholder="Business Name" value={business_name} onChangeText={setRegisteredBusinessName} style={inputStyle} />
      {errors.business_name && <Text style={errorText}>{errors.business_name}</Text>}

      {/** Registration Number */}
      <TextInput placeholder="Registration Number (DTI)" value={registration_number} onChangeText={setRegistrationNumber} style={inputStyle} />
      {errors.registration_number && <Text style={errorText}>{errors.registration_number}</Text>}

      {/** Description */}
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} multiline style={[inputStyle, { height: 100 }]} />
      {errors.description && <Text style={errorText}>{errors.description}</Text>}

      {/** Email */}
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={inputStyle} />
      {errors.email && <Text style={errorText}>{errors.email}</Text>}

      {/** Password */}
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={!show} style={inputStyle} />
      {errors.password && <Text style={errorText}>{errors.password}</Text>}

      {/** Contact_No */}
      <TextInput placeholder="Contact Number" value={contact_no} keyboardType= "numeric" maxLength={11}  onChangeText={text => setContactNo(text.replace(/[^0-9]/g, ""))} style={inputStyle} />
      {errors.contact_no && <Text style={errorText}>{errors.contact_no}</Text>}

      <Pressable onPress={() => setShow(!show)}><Text>{show ? "Hide" : "Show"}</Text></Pressable>

      {/** Product Image */}
      <Pressable onPress={() => pickImage(setProductImage)} style={uploadBox}>
        <Text style={{ fontSize: 32 }}>📷</Text>
        <Text style={uploadText}>Upload Product Image</Text>
      </Pressable>
      {product_img && <Text style={uploadedText}>Uploaded: {product_img.name}</Text>}
      {errors.product_img && <Text style={errorText}>{errors.product_img}</Text>}

      {/** Certificates */}
      <Pressable onPress={() => pickImage(setCertificates)} style={uploadBox}>
        <Text style={{ fontSize: 32 }}>📜</Text>
        <Text style={uploadText}>Upload Certificate</Text>
      </Pressable>
      {certificates && <Text style={uploadedText}>Uploaded: {certificates.name}</Text>}
      {errors.certificates && <Text style={errorText}>{errors.certificates}</Text>}

      {/** Logo */}
      <Pressable onPress={() => pickImage(setBusinessLogo)} style={uploadBox}>
        <Text style={{ fontSize: 32 }}>🏢</Text>
        <Text style={uploadText}>Upload Business Logo</Text>
      </Pressable>
      {logo && <Text style={uploadedText}>Uploaded: {logo.name}</Text>}
      {errors.logo && <Text style={errorText}>{errors.logo}</Text>}
       <Pressable
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
        onPress={() => setConsent(!consent)}
        >
        <View
            style={{
            width: 20,
            height: 20,
            borderWidth: 1,
            borderColor: "#444",
            borderRadius: 4,
            marginRight: 8,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: consent ? "#0A84FF" : "#fff",
            }}
        >
            {consent && <Text style={{ color: "#fff", fontWeight: "bold" }}>✔</Text>}
        </View>
        <Text style={{ flex: 1 }}>
            I consent to the collection and processing of my personal data for verification purposes.
        </Text>
        </Pressable>
      <Pressable onPress={handleSubmit} style={submitButton}>
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600" }}>Submit Product</Text>
      </Pressable>
      {statusMessage ? (
        <Text
            style={{
            padding: 10,
            borderRadius: 8,
            textAlign: "center",
            fontWeight: "600",
            marginTop: 10,
            backgroundColor: statusType === "success" ? "#d4edda" : "#f8d7da",
            color: statusType === "success" ? "#155724" : "#721c24",
            }}
        >
            {statusMessage}
        </Text>
        ) : null}
    </ScrollView>
  );
}

const inputStyle = { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, marginBottom: 4, backgroundColor: "#fff" };
const errorText = { color: "red", marginBottom: 8, fontWeight: "500" };
const submitButton = { backgroundColor: "#0A84FF", paddingVertical: 14, borderRadius: 10, alignItems: "center" };
const uploadBox = { borderWidth: 1.5, borderStyle: "dashed", borderColor: "#999", borderRadius: 10, paddingVertical: 30, alignItems: "center", marginBottom: 18, backgroundColor: "#fafafa" };
const uploadText = { fontSize: 16, fontWeight: "600", color: "#444" };
const uploadedText = { fontWeight: "600", textAlign: "center", marginBottom: 10 };
