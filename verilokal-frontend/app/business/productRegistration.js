import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFonts } from "expo-font";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  Picker,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";

export default function ProductRegistration() {
  const [form, setForm] = useState({
    name: "",
    type: "",
    materials: "",
    origin: "",
    productionDate: "",
    description: "",
    image: null,
  });

  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) setForm({ ...form, image: result.assets[0].uri });
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Product name is required.";
    if (!form.type) newErrors.type = "Product type is required.";
    if (!form.materials.trim()) newErrors.materials = "Materials are required.";
    if (!form.origin.trim()) newErrors.origin = "Origin is required.";
    if (!form.productionDate.trim())
      newErrors.productionDate = "Production date is required.";
    if (!form.description.trim())
      newErrors.description = "Description is required.";
    if (!form.image) newErrors.product_image = "Product image is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setStatusMessage("Please fix the errors before submitting.");
      setStatusType("error");
      return;
    }

    setErrors({});
    setStatusMessage("");
    setStatusType("");

    try {
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key === "image" && value)
          formData.append("product_image", {
            uri: value,
            name: "upload.jpg",
            type: "image/jpeg",
          });
        else formData.append(key, value);
      });

      await axios.post("http://localhost:3000/api/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setStatusMessage("Product successfully registered!");
      setStatusType("success");
      setForm({
        name: "",
        type: "",
        materials: "",
        origin: "",
        productionDate: "",
        description: "",
        image: null,
      });

      router.push("/business");
    } catch (err) {
      console.error("Error submitting:", err);
      setStatusMessage("Something went wrong. Please try again.");
      setStatusType("error");
    }
  };

  const [fontsLoaded] = useFonts({
    "Garet-Book": require("../../assets/fonts/garet/Garet-Book.ttf"),
    "Garet-Heavy": require("../../assets/fonts/garet/Garet-Heavy.ttf"),
    "Montserrat-Regular": require("../../assets/fonts/Montserrat/static/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("../../assets/fonts/Montserrat/static/Montserrat-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View>
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  const getInputStyle = (field) => ({
    borderWidth: 1,
    borderColor: errors[field] ? "red" : "#000",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 5,
    backgroundColor: "#FFFFFF",
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
  });

  const errorText = {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
    fontFamily: "Montserrat-Regular",
  };

  return (
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(231, 229, 226, 0.87)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 27,
            paddingVertical: 70,
          }}
        >
          <Text
            style={{
              fontSize: 34,
              fontWeight: "bold",
              marginBottom: 30,
              color: "#000",
              fontFamily: "Garet-Heavy",
            }}
          >
            Register Product
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 40,
            }}
          >
            {/* LEFT COLUMN */}
            <View style={{ flex: 1 }}>
              {/* Product Name */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  fontFamily: "Montserrat-Regular",
                  marginBottom: 6,
                }}
              >
                PRODUCT NAME*
              </Text>
              <TextInput
                placeholder="Name of your product"
                value={form.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
                style={getInputStyle("name")}
              />
              {errors.name && <Text style={errorText}>{errors.name}</Text>}

              {/* Product Type */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  fontFamily: "Montserrat-Regular",
                  marginBottom: 6,
                }}
              >
                PRODUCT TYPE*
              </Text>
              <Picker
                selectedValue={form.type}
                onValueChange={(value) => setForm({ ...form, type: value })}
                style={getInputStyle("type")}
              >
                <Picker.Item label="Select product type" value="" />
                <Picker.Item label="Woodcraft" value="woodcraft" />
                <Picker.Item label="Textile" value="textile" />
                <Picker.Item label="Pottery" value="pottery" />
              </Picker>
              {errors.type && <Text style={errorText}>{errors.type}</Text>}

              {/* Materials */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  fontFamily: "Montserrat-Regular",
                  marginBottom: 6,
                }}
              >
                MATERIALS*
              </Text>
              <TextInput
                placeholder="What materials did you use?"
                value={form.materials}
                onChangeText={(t) => setForm({ ...form, materials: t })}
                style={getInputStyle("materials")}
              />
              {errors.materials && (
                <Text style={errorText}>{errors.materials}</Text>
              )}

              {/* Origin */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  fontFamily: "Montserrat-Regular",
                  marginBottom: 6,
                }}
              >
                ORIGIN*
              </Text>
              <TextInput
                placeholder="Where is your product from?"
                value={form.origin}
                onChangeText={(t) => setForm({ ...form, origin: t })}
                style={getInputStyle("origin")}
              />
              {errors.origin && <Text style={errorText}>{errors.origin}</Text>}

              {/* Production Date */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  fontFamily: "Montserrat-Regular",
                  marginBottom: 6,
                }}
              >
                PRODUCTION DATE*
              </Text>
              <TextInput
                placeholder="When was your product made?"
                value={form.productionDate}
                onChangeText={(t) => setForm({ ...form, productionDate: t })}
                style={getInputStyle("productionDate")}
              />
              {errors.productionDate && (
                <Text style={errorText}>{errors.productionDate}</Text>
              )}
            </View>

            {/* RIGHT COLUMN */}
            <View style={{ flex: 0.9 }}>
              {/* Description */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  fontFamily: "Montserrat-Regular",
                  marginBottom: 6,
                }}
              >
                DESCRIPTION*
              </Text>
              <TextInput
                placeholder="Can you describe your product..."
                multiline
                value={form.description}
                onChangeText={(t) => setForm({ ...form, description: t })}
                style={{
                  ...getInputStyle("description"),
                  height: 140,
                  textAlignVertical: "top",
                }}
              />
              {errors.description && (
                <Text style={errorText}>{errors.description}</Text>
              )}

              {/* Image Upload */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  fontFamily: "Montserrat-Regular",
                  marginBottom: 6,
                }}
              >
                PRODUCT IMAGE*
              </Text>
              <Pressable
                onPress={pickImage}
                style={{
                  borderWidth: 1,
                  borderColor: errors.product_image ? "red" : "#000",
                  borderRadius: 12,
                  height: 163,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#fff",
                }}
              >
                {form.image ? (
                  <Image
                    source={{ uri: form.image }}
                    style={{
                      width: "100%",
                      height: 150,
                      borderRadius: 10,
                    }}
                  />
                ) : (
                  <>
                    <Text style={{ fontSize: 36, marginBottom: 6 }}>☁️</Text>
                    <Text
                      style={{ fontSize: 14, fontFamily: "Montserrat-Regular" }}
                    >
                      UPLOAD IMAGE
                    </Text>
                  </>
                )}
              </Pressable>
              {errors.product_image && (
                <Text style={errorText}>{errors.product_image}</Text>
              )}
            </View>
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            style={{
              backgroundColor: "#e98669",
              paddingVertical: 14,
              borderRadius: 20,
              alignSelf: "center",
              width: 160,
              marginTop: 30,
            }}
          >
            <Text
              style={{
                color: "#000",
                fontWeight: "700",
                fontFamily: "Montserrat-Bold",
                textAlign: "center",
                letterSpacing: 1,
              }}
            >
              SUBMIT
            </Text>
          </Pressable>

          {/* Status Message */}
          {statusMessage ? (
            <Text
              style={{
                padding: 10,
                borderRadius: 8,
                textAlign: "center",
                fontWeight: "600",
                marginTop: 10,
                backgroundColor:
                  statusType === "success" ? "#d4edda" : "#f8d7da",
                color: statusType === "success" ? "#155724" : "#721c24",
              }}
            >
              {statusMessage}
            </Text>
          ) : null}
        </ScrollView>
      </View>
  );
}
