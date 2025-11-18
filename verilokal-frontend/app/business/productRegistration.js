import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { useFonts } from "expo-font";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

export default function RegisterProduct() {
  const [form, setForm] = useState({
    name: "",
    type: "",
    materials: "",
    origin: "",
    productionDate: "",
    description: "",
    image: null,
  });

  const [fontsLoaded] = useFonts({
    "Garet-Book": require("../../assets/fonts/garet/Garet-Book.ttf"),
    "Garet-Heavy": require("../../assets/fonts/garet/Garet-Heavy.ttf"),
    "Montserrat-Regular": require("../../assets/fonts/Montserrat/static/Montserrat-Regular.ttf"),
  });

  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async () => {
    try {
      if (Platform.OS === "web") {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (event) => {
          const file = event.target.files[0];
          if (file) {
            setForm((prev) => ({
              ...prev,
              image: {
                uri: URL.createObjectURL(file),
                file,
                name: file.name,
                type: file.type,
              },
            }));
          }
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
          setForm((prev) => ({
            ...prev,
            image: {
              uri: asset.uri,
              name: asset.fileName || "product.jpg",
              type: asset.mimeType || "image/jpeg",
            },
          }));
        }
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error selecting image");
    }
  };

  const handleInputChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    const newErrors = {};

    if (!form.name) newErrors.name = "Product name is required";
    if (!form.type) newErrors.type = "Product type is required";
    if (!form.materials) newErrors.materials = "Materials are required";
    if (!form.origin) newErrors.origin = "Origin is required";
    if (!form.productionDate) newErrors.productionDate = "Production date required";
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.productionDate)) {
      newErrors.productionDate = "Date must be in YYYY-MM-DD format";
    }
    if (!form.description) newErrors.description = "Description required";
    if (!form.image) newErrors.image = "Product image is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setStatusMessage("Registering product...");

    try {
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("type", form.type);
      formData.append("materials", form.materials);
      formData.append("origin", form.origin);
      formData.append("productionDate", form.productionDate);
      formData.append("description", form.description);
      if (Platform.OS === "web") {
        formData.append("product_image", form.image.file);
      } else {
        formData.append("product_image", {
          uri: form.image.uri,
          name: form.image.name,
          type: form.image.type,
        });
      }

      await axios.post("https://backend1-al4l.onrender.com/api/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setStatusMessage("Product registered successfully!");
      setIsSubmitting(false);
      setForm({
        name: "",
        type: "",
        materials: "",
        origin: "",
        productionDate: "",
        description: "",
        image: null,
      });

    } catch (err) {
      console.error("Submit error:", err);
      Alert.alert("Registration failed", "Error saving product.");
      setStatusMessage("");
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header aligned with form */}
      <View style={styles.header}>
        <Text style={styles.title}>Product Registration</Text>
        <Pressable
          style={styles.backButton}
          onPress={() => router.push("/business")}
        >
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>

      {/* Status */}
      {statusMessage !== "" && (
        <Text style={styles.statusMessage}>{statusMessage}</Text>
      )}

      {/* Inputs */}
      <InputField
        label="Product Name"
        value={form.name}
        onChange={(v) => handleInputChange("name", v)}
        error={errors.name}
      />

      <View style={styles.inputContainer}>
        <Picker
          selectedValue={form.type}
          onValueChange={(v) => handleInputChange("type", v)}
          style={styles.input}
        >
          <Picker.Item label="Select Type" value="" />
          <Picker.Item label="Woodcraft" value="woodcraft" />
          <Picker.Item label="Textile" value="textile" />
          <Picker.Item label="Jewelry" value="jewelry" />
        </Picker>
        {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
      </View>

      <InputField
        label="Materials"
        value={form.materials}
        onChange={(v) => handleInputChange("materials", v)}
        error={errors.materials}
      />

      <InputField
        label="Origin"
        value={form.origin}
        onChange={(v) => handleInputChange("origin", v)}
        error={errors.origin}
      />

      <InputField
        label="Production Date (YYYY-MM-DD)"
        value={form.productionDate}
        onChange={(v) => {
          const cleanValue = v.replace(/[^0-9-]/g, '');
          handleInputChange("productionDate", cleanValue.slice(0, 10));
        }}
        error={errors.productionDate}
      />

      <InputField
        label="Description"
        value={form.description}
        onChange={(v) => handleInputChange("description", v)}
        multiline
        error={errors.description}
      />

      {/* Image Picker */}
      <Pressable style={styles.imagePicker} onPress={pickImage}>
        {form.image ? (
          <Image source={{ uri: form.image.uri }} style={styles.imagePreview} />
        ) : (
          <Text style={styles.imageText}>Select Product Image</Text>
        )}
      </Pressable>
      {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}

      {/* Submit */}
      <Pressable
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitText}>Submit</Text>
      </Pressable>
    </ScrollView>
  );
}

function InputField({ label, value, onChange, multiline, error }) {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        placeholder={label}
        value={value}
        onChangeText={onChange}
        style={[styles.input, multiline && styles.textArea, error && styles.errorInput]}
        multiline={multiline}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    width: "50%", 
    justifyContent: "space-between",
    alignSelf: "center",
  },
  statusMessage: {
  alignSelf: "center",
  fontsize: 8,
  fontFamily: "Montserrat-Regular",
  color: "#67AA61",
},
  title: {
    fontSize: 28,
    fontFamily: "Garet-Heavy",
    color: "#000",
  },
  backButton: {
    backgroundColor: "#e98669",
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  backText: {
    color: "#000", 
    fontWeight: "700",
    fontFamily: "Montserrat-Regular",
  },
  inputContainer: { marginBottom: 15 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, backgroundColor: "#fafafa", width: "50%", alignSelf: "center" },
  textArea: { height: 100 },
  errorInput: { borderColor: "red" },
  errorText: { color: "red", marginTop: 4, width: "50%", alignSelf: "center", textAlign: "left" },
  imagePicker: { borderWidth: 1, borderColor: "#ccc", padding: 20, borderRadius: 10, alignItems: "center", backgroundColor: "#fafafa", height: 200, justifyContent: "center", marginBottom: 10, width: "50%", alignSelf: "center" },
  imagePreview: { width: "100%", height: "100%", borderRadius: 10 },
  submitButton: { backgroundColor: "#e98669", padding: 14, borderRadius: 10, alignItems: "center", alignSelf: "center", marginTop: 10, width: "15%", borderRadius: 50, borderWidth: 1.3, shadowRadius: 3,  },
  submitText: { color: "black", fontSize: 16, fontWeight: "600" },
});
