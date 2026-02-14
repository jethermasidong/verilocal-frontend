import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function BusinessProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [business, setBusiness] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const dropdownAnim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: isEditing ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: isEditing ? 0 : 30,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isEditing]);

  const togglePanel = (panel) => {
    if (activePanel === panel) {
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setActivePanel(null));
    } else {
      setActivePanel(panel);
      Animated.timing(dropdownAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const dropdownStyle = {
    opacity: dropdownAnim,
    transform: [
      {
        translateY: dropdownAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-20, 0],
        }),
      },
    ],
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: "https://via.placeholder.com/300" }}
            style={styles.avatar}
          />

          <View style={styles.headerText}>
            <Text style={styles.name}>{business.registered_business_name}</Text>
            <Text style={styles.location}>{business.address}</Text>
          </View>

          <Pressable
            style={[styles.editButton, isEditing && styles.saveButton]}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Ionicons
              name={isEditing ? "checkmark" : "pencil"}
              size={18}
              color="#fff"
            />
            <Text style={styles.editText}>
              {isEditing ? "Save" : "Edit Profile"}
            </Text>
          </Pressable>
        </View>

        {/* Body */}
        <View style={styles.details}>
          {/* Left */}
          <View style={styles.left}>
            <DetailItem
              icon="location-outline"
              value={business.address}
              editable={isEditing}
            />
            <DetailItem
              icon="call-outline"
              value={business.contact_no}
              editable={isEditing}
            />
            <DetailItem
              icon="mail-outline"
              value={business.email}
              editable={isEditing}
            />
          </View>

          <View style={styles.divider} />

          {/* Right */}
          <View style={styles.right}>
            <View style={styles.iconRow}>
              <IconButton
                icon="images-outline"
                label="Certificates"
                active={activePanel === "gallery"}
                onPress={() => togglePanel("gallery")}
              />
              <IconButton
                icon="cube-outline"
                label="Permits"
                active={activePanel === "products"}
                onPress={() => togglePanel("products")}
              />
              <IconButton
                icon="construct-outline"
                label="Products"
                active={activePanel === "process"}
                onPress={() => togglePanel("process")}
              />
            </View>

            {activePanel && (
              <Animated.View style={[styles.dropdown, dropdownStyle]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {[1, 2, 3].map((item) => (
                    <Image
                      key={item}
                      source={{ uri: "https://via.placeholder.com/240x160" }}
                      style={styles.dropdownImage}
                    />
                  ))}
                </ScrollView>
              </Animated.View>
            )}
          </View>
        </View>

        {/* Edit Hint */}
        <Animated.View
          style={[
            styles.editHint,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Ionicons name="information-circle-outline" size={18} />
          <Text style={styles.hintText}>
            Editing mode enabled — don’t forget to save
          </Text>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

/* ---------- COMPONENTS ---------- */

function DetailItem({ icon, value, editable }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={22} />
      <TextInput
        defaultValue={value}
        editable={editable}
        style={[styles.input, editable && styles.inputEditable]}
      />
    </View>
  );
}

function IconButton({ icon, label, onPress, active }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.iconButton, active && styles.iconButtonActive]}
    >
      <Ionicons name={icon} size={20} color={active ? "#fff" : "#111"} />
      <Text style={[styles.iconLabel, active && { color: "#fff" }]}>
        {label}
      </Text>
    </Pressable>
  );
}


const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#f3f4f6",
    minHeight: "100%",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    width: "100%",
    height: "100%",
  },

  header: {
    backgroundColor: "#dcd6ff",
    padding: 32,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 200,
  },

  avatar: {
    width: 300,
    height: 300,
    borderRadius: 200,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#eee",
  },

  headerText: {
    flex: 1,
    marginLeft: 24,
  },

  name: {
    fontSize: 40,
    fontWeight: "800",
  },

  location: {
    fontSize: 26,
    color: "#444",
    marginTop: 6,
  },

  editButton: {
    flexDirection: "row",
    backgroundColor: "#4f46e5",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: "center",
    gap: 8,
  },

  saveButton: {
    backgroundColor: "#16a34a",
  },

  editText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  details: {
    flexDirection: "row",
    padding: 32,
    gap: 24,
  },

  left: {
    flex: 1,
    gap: 20,
  },

  right: {
    flex: 1,
    justifyContent: "flex-start",
  },

  divider: {
    width: 1,
    backgroundColor: "#e5e7eb",
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  input: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },

  inputEditable: {
    backgroundColor: "#fff",
    borderColor: "#4f46e5",
  },

  previewImage: {
    width: "100%",
    height: width > 700 ? 280 : 220,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
  },

  editHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  hintText: {
    fontSize: 14,
    color: "#555",
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 12,
    marginBottom: 16,
  },

  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },

  iconButtonActive: {
    backgroundColor: "#4f46e5",
    borderColor: "#4f46e5",
  },

  iconLabel: {
    fontSize: 13,
    fontWeight: "600",
  },

  dropdown: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 12,
  },

  dropdownImage: {
    width: 280,
    height: 210,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: "#e5e7eb",
  },

});
