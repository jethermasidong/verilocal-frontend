import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const STATUS_STYLES = {
  Approved: { bg: "#DCFCE7", text: "#15803D" },
  Pending: { bg: "#FEF3C7", text: "#B45309" },
  Failed: { bg: "#FEE2E2", text: "#B91C1C" },
};

// Normalise whatever the API returns ("approved", "APPROVED", etc.)
const normalizeStatus = (raw) => {
  if (!raw) return "Pending";
  const key = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  return STATUS_STYLES[key] ? key : "Pending";
};

const FilterIcon = () => (
  <View style={styles.filterIconWrap}>
    <View style={[styles.filterLine, { width: 14 }]} />
    <View style={[styles.filterLine, { width: 10 }]} />
    <View style={[styles.filterLine, { width: 6 }]} />
  </View>
);

const SearchIcon = () => (
  <View style={styles.searchIconWrap}>
    <View style={styles.searchCircle} />
    <View style={styles.searchHandle} />
  </View>
);

const getInitial = (name) => name?.charAt(0).toUpperCase() || "?";

const getColor = (name) => {
  const colors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6"];
  const index = name ? name.charCodeAt(0) % colors.length : 0;
  return colors[index];
};

const SortIcon = () => (
  <View style={{ gap: 2, alignItems: "center" }}>
    <View style={styles.sortArrowUp} />
    <View style={styles.sortArrowDown} />
  </View>
);

export default function TransferOwnership() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterActive, setFilterActive] = useState(false);
  const [products, setProducts] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newOwner, setNewOwner] = useState("");

  // Result modal state
  const [isLoading, setIsLoading] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);
  const [resultType, setResultType] = useState(null);
  const [resultMessage, setResultMessage] = useState("");

  // Result animations
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchProducts();
  }, []);

  // Trigger animations when result modal appears
  useEffect(() => {
    if (!resultVisible) return;
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
    } else {
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
  }, [resultVisible, resultType]);

  const fetchProducts = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(
        "https://verilocalph.onrender.com/api/products/transferable",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  const handleConfirmTransfer = async () => {
    if (!newOwner.trim()) {
      alert("Please enter a new owner");
      return;
    }

    try {
      setModalVisible(false);
      setIsLoading(true);

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      await axios.put(
        "https://verilocalph.onrender.com/api/transfer",
        {
          product_ids: selectedIds,
          newOwner: newOwner,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setResultType("success");
      setResultMessage(
        `Ownership of ${selectedIds.length} item${selectedIds.length > 1 ? "s" : ""} has been successfully transferred to ${newOwner}.`,
      );
      setSelectedIds([]);
      setNewOwner("");
      fetchProducts();
    } catch (err) {
      console.error(err);
      const serverMessage =
        err.response?.data?.message || "Transfer failed. Please try again.";
      setResultType("error");
      setResultMessage(serverMessage);
    } finally {
      setIsLoading(false);
      setResultVisible(true);
    }
  };

  const filtered = products.filter(
    (item) =>
      (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.uid || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.current_owner || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const toggleSelect = (uid) => {
    setSelectedIds((prev) =>
      prev.includes(uid) ? prev.filter((i) => i !== uid) : [...prev, uid],
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((i) => i.uid));
    }
  };

  const renderItem = ({ item, index }) => {
    const isSelected = selectedIds.includes(item.uid);
    const statusKey = normalizeStatus(item.status);
    const statusStyle = STATUS_STYLES[statusKey];

    return (
      <TouchableOpacity
        style={[
          styles.row,
          isSelected && styles.rowSelected,
          index === filtered.length - 1 && styles.rowLast,
        ]}
        onPress={() => toggleSelect(item.uid)}
        activeOpacity={0.7}
      >
        {/* Checkbox */}
        <TouchableOpacity
          style={[styles.checkbox, isSelected && styles.checkboxChecked]}
          onPress={() => toggleSelect(item.uid)}
        >
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        {/* Product Name */}
        <View style={styles.cellProduct}>
          <View
            style={[styles.avatar, { backgroundColor: getColor(item.name) }]}
          >
            <Text style={styles.avatarText}>{getInitial(item.name)}</Text>
          </View>
          <Text style={styles.productName} numberOfLines={1}>
            {item.name}
          </Text>
        </View>

        {/* UID */}
        <View style={styles.cellUid}>
          <Text style={styles.uidText} numberOfLines={2}>
            {item.uid}
          </Text>
        </View>

        {/* Current Owner */}
        <View style={styles.cellOwner}>
          <Text style={styles.ownerText} numberOfLines={1}>
            {item.current_owner}
          </Text>
        </View>

        {/* Status */}
        <View style={styles.cellStatus}>
          <View
            style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
          >
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {statusKey}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F7" />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Product Ownership Transfer</Text>
          {selectedIds.length > 0 && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedBadgeText}>
                {selectedIds.length} selected
              </Text>
            </View>
          )}
        </View>

        {/* Search + Filter */}
        <View style={styles.toolbar}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={28} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <TouchableOpacity
            style={[styles.filterBtn, filterActive && styles.filterBtnActive]}
            onPress={() => setFilterActive((v) => !v)}
          >
            <Ionicons name="filter-outline" size={28} />
            <Text
              style={[
                styles.filterText,
                filterActive && styles.filterTextActive,
              ]}
            >
              Filter
            </Text>
          </TouchableOpacity>
        </View>

        {/* Table */}
        <View style={styles.tableWrapper}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <TouchableOpacity
              style={[
                styles.headerCheckbox,
                selectedIds.length === filtered.length &&
                  filtered.length > 0 &&
                  styles.checkboxChecked,
              ]}
              onPress={toggleSelectAll}
            >
              {selectedIds.length === filtered.length &&
                filtered.length > 0 && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>

            <View style={styles.colProduct}>
              <Text style={styles.colLabel}>Product Name</Text>
              <SortIcon />
            </View>

            <View style={styles.colUid}>
              <Text style={styles.colLabel}>UID</Text>
              <SortIcon />
            </View>

            <View style={styles.colOwner}>
              <Text style={styles.colLabel}>Current Owner</Text>
              <SortIcon />
            </View>

            <View style={styles.colStatus}>
              <Text style={styles.colLabel}>Status</Text>
            </View>
          </View>

          {/* Rows */}
          <FlatList
            data={filtered}
            keyExtractor={(item, index) =>
              item.uid ? String(item.uid) : `fallback-${index}`
            }
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No results found</Text>
              </View>
            }
          />
        </View>

        {/* Bottom Action Bar (shown when items selected) */}
        {selectedIds.length > 0 && (
          <View style={styles.actionBar}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setSelectedIds([])}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.transferBtn}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.transferBtnText}>
                Transfer {selectedIds.length} Item
                {selectedIds.length > 1 ? "s" : ""}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {/* Icon */}
              <View style={styles.modalIconWrap}>
                <Ionicons
                  name="swap-horizontal-outline"
                  size={22}
                  color="#111827"
                />
              </View>

              {/* Title & subtitle */}
              <Text style={styles.modalTitle}>Transfer Ownership</Text>
              <Text style={styles.modalSubtitle}>
                You are about to transfer{" "}
                <Text style={styles.modalSubtitleBold}>
                  {selectedIds.length} item{selectedIds.length > 1 ? "s" : ""}
                </Text>
                . Enter the new owner below.
              </Text>

              {/* Input */}
              <View style={styles.modalInputWrap}>
                <Ionicons
                  name="person-outline"
                  size={16}
                  color="#9CA3AF"
                  style={styles.modalInputIcon}
                />
                <TextInput
                  placeholder="New owner name"
                  placeholderTextColor="#9CA3AF"
                  value={newOwner}
                  onChangeText={setNewOwner}
                  style={styles.modalInput}
                  autoCapitalize="none"
                />
              </View>

              {/* Divider */}
              <View style={styles.modalDivider} />

              {/* Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    setNewOwner("");
                  }}
                  style={styles.modalCancelBtn}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleConfirmTransfer}
                  style={styles.modalConfirmBtn}
                >
                  <Text style={styles.modalConfirmText}>Confirm Transfer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        {/* Loading Modal */}
        {isLoading && (
          <View style={styles.resultOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#111827" />
              <Text style={styles.loadingText}>Transferring ownership…</Text>
            </View>
          </View>
        )}

        {/* Success / Failed Result Modal */}
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
                {resultType === "success"
                  ? "Transfer Successful"
                  : "Transfer Failed"}
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
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "600",
                    fontFamily: "Garet-Book",
                  }}
                >
                  OK
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#eaf2f5",
  },
  container: {
    flex: 1,
    paddingVertical: 100,
    paddingHorizontal: 40,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.5,
    fontFamily: "Garet-Heavy",
  },
  selectedBadge: {
    backgroundColor: "#f4f6fb",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  selectedBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2a323c",
    fontFamily: "Garet-Book",
  },

  // Toolbar
  toolbar: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    borderColor: "rgba(200, 210, 230, 0.6)",
    shadowColor: "#1a2f5a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Garet-Book",
    fontSize: 15,
    color: "#111827",
    padding: 0,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterBtnActive: {
    backgroundColor: "#54667f",
    borderColor: "rgb(16, 23, 36)",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    fontFamily: "Garet-Book",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },

  // Search icon
  searchIconWrap: {
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  searchCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#9CA3AF",
    position: "absolute",
    top: 0,
    left: 0,
  },
  searchHandle: {
    width: 5,
    height: 1.5,
    backgroundColor: "#9CA3AF",
    borderRadius: 1,
    position: "absolute",
    bottom: 1,
    right: 0,
    transform: [{ rotate: "45deg" }],
  },

  // Filter icon
  filterIconWrap: {
    gap: 2.5,
    justifyContent: "center",
  },
  filterLine: {
    height: 1.5,
    backgroundColor: "#374151",
    borderRadius: 1,
  },

  // Sort icon
  sortArrowUp: {
    width: 0,
    height: 0,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 4,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#9CA3AF",
  },
  sortArrowDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 4,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#9CA3AF",
  },

  // Table
  tableWrapper: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
  },
  headerCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  colProduct: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingRight: 8,
  },
  colUid: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingRight: 8,
  },
  colOwner: {
    flex: 1.8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingRight: 8,
  },
  colStatus: {
    flex: 1.4,
    alignItems: "flex-end",
  },
  colLabel: {
    fontFamily: "Garet-Book",
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  // Rows
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowSelected: {
    backgroundColor: "#f4f6fb",
  },

  // Checkbox
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },

  // Cells
  cellProduct: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingRight: 8,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontFamily: "Garet-Book",
    fontSize: 13,
    fontWeight: "700",
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    fontFamily: "Garet-Book",
    flex: 1,
  },
  cellUid: {
    flex: 2,
    paddingRight: 8,
  },
  uidText: {
    fontSize: 12,
    fontFamily: "Garet-Book",
    color: "#374151",
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
    flexShrink: 1,
  },
  cellOwner: {
    flex: 1.8,
    paddingRight: 8,
  },
  ownerText: {
    fontSize: 12,
    fontFamily: "Garet-Book",
    color: "#6B7280",
  },
  cellStatus: {
    flex: 1.4,
    alignItems: "flex-end",
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Garet-Book",
    fontWeight: "600",
  },

  // Empty
  emptyState: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontFamily: "Garet-Book",
  },

  // Bottom Action Bar
  actionBar: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 14,
    paddingTop: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    fontFamily: "Garet-Book",
  },
  transferBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignItems: "center",
  },
  transferBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "Garet-Book",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 700,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 10,
  },
  modalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    fontFamily: "Garet-Heavy",
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Garet-Book",
    lineHeight: 20,
    marginBottom: 20,
  },
  modalSubtitleBold: {
    color: "#111827",
    fontWeight: "600",
  },
  modalInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    marginBottom: 20,
  },
  modalInputIcon: {
    marginTop: 1,
  },
  modalInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    fontFamily: "Garet-Book",
    padding: 5,
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    fontFamily: "Garet-Book",
  },
  modalConfirmBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignItems: "center",
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "Garet-Book",
  },
  // Loading & Result modals
  resultOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    zIndex: 999,
  },
  loadingContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 32,
    alignItems: "center",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "Garet-Book",
    color: "#374151",
    fontWeight: "500",
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
  resultIcon: {
    marginBottom: 15,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Garet-Heavy",
    marginBottom: 12,
    textAlign: "center",
  },
  resultMessage: {
    fontSize: 14,
    textAlign: "center",
    color: "#4B5563",
    fontFamily: "Garet-Book",
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
});
