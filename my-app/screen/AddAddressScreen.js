import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Animated,
} from "react-native";
import React, { useEffect, useContext, useState, useCallback } from "react";
import { Feather, AntDesign, Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import axios from "axios";
import { UserType } from "../UserContext";
import API_URLS from "../helpers/config";

const AddAddressScreen = () => {
  const navigation = useNavigation();
  const [addresses, setAddresses] = useState([]);
  const { userId } = useContext(UserType);

  // State cho modal chỉnh sửa
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");

  // State cho popup xác nhận xóa
  const [deletePopupVisible, setDeletePopupVisible] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0]; // Animation fade

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(
        `${API_URLS.ANDROID}/addresses/${userId}`
      );
      setAddresses(response.data.addresses);
    } catch (error) {
      console.log("Error fetching addresses:", error);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  // Animation cho popup
  const showPopup = () => {
    setDeletePopupVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hidePopup = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setDeletePopupVisible(false));
  };

  // Xử lý xóa địa chỉ với popup
  const handleRemoveAddress = (addressId) => {
    setAddressToDelete(addressId);
    showPopup();
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(
        `${API_URLS.ANDROID}/addresses/${userId}/${addressToDelete}`
      );
      setAddresses(addresses.filter((addr) => addr._id !== addressToDelete));
      hidePopup();
      // Hiển thị popup thông báo thành công (có thể tạo thêm nếu muốn)
      setTimeout(
        () => Alert.alert("Success", "Address deleted successfully"),
        300
      );
    } catch (error) {
      console.error("Error deleting address:", error);
      hidePopup();
      setTimeout(() => Alert.alert("Error", "Failed to delete address"), 300);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setName(address.name);
    setMobileNo(address.mobileNo);
    setHouseNo(address.houseNo || "");
    setStreet(address.street);
    setLandmark(address.landmark || "");
    setProvince(address.province);
    setDistrict(address.district);
    setWard(address.ward);
    setEditModalVisible(true);
  };

  const handleUpdateAddress = async () => {
    const updatedAddress = {
      name,
      mobileNo,
      houseNo,
      street,
      landmark,
      province,
      district,
      ward,
      country: "Vietnam",
    };

    try {
      await axios.put(
        `${API_URLS.ANDROID}/addresses/${userId}/${editingAddress._id}`,
        {
          address: updatedAddress,
        }
      );
      setEditModalVisible(false);
      fetchAddresses();
      Alert.alert("Success", "Address updated successfully");
    } catch (error) {
      console.error("Error updating address:", error);
      Alert.alert("Error", "Failed to update address");
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View
        style={{
          backgroundColor: "#00CED1",
          padding: 10,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={{ marginRight: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
      </View>

      <View style={{ padding: 10 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>Your Addresses</Text>
        <Pressable
          onPress={() => navigation.navigate("Add")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 10,
            borderColor: "#D0D0D0",
            borderWidth: 1,
            borderLeftWidth: 0,
            borderRightWidth: 0,
            paddingVertical: 7,
            paddingHorizontal: 5,
          }}
        >
          <Text>Add a new Address</Text>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="black" />
        </Pressable>

        <Pressable>
          {addresses?.map((item) => (
            <Pressable
              key={item._id}
              style={{
                borderWidth: 1,
                borderColor: "#D0D0D0",
                padding: 10,
                flexDirection: "column",
                gap: 5,
                marginVertical: 10,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
              >
                <Text style={{ fontSize: 15, fontWeight: "bold" }}>
                  {item?.name}
                </Text>
                <Entypo name="location-pin" size={24} color="red" />
              </View>
              <Text style={{ fontSize: 15, color: "#181818" }}>
                {item?.landmark} {item?.houseNo}
              </Text>
              <Text style={{ fontSize: 15, color: "#181818" }}>
                {item?.street}
              </Text>
              <Text style={{ fontSize: 15, color: "#181818" }}>
                {item?.ward}, {item?.district}, {item?.province},{" "}
                {item?.country}
              </Text>
              <Text style={{ fontSize: 15, color: "#181818" }}>
                Phone No: {item?.mobileNo}
              </Text>
              {item?.postalCode && (
                <Text style={{ fontSize: 15, color: "#181818" }}>
                  Pin code: {item?.postalCode}
                </Text>
              )}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  marginTop: 7,
                }}
              >
                <Pressable
                  onPress={() => handleEditAddress(item)}
                  style={{
                    backgroundColor: "#F5F5F5",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 5,
                    borderWidth: 0.9,
                    borderColor: "#D0D0D0",
                  }}
                >
                  <Text>Edit</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleRemoveAddress(item._id)}
                  style={{
                    backgroundColor: "#F5F5F5",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 5,
                    borderWidth: 0.9,
                    borderColor: "#D0D0D0",
                  }}
                >
                  <Text>Remove</Text>
                </Pressable>
              </View>
            </Pressable>
          ))}
        </Pressable>
      </View>

      {/* Modal chỉnh sửa */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text
              style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}
            >
              Edit Address
            </Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Full Name"
            />
            <TextInput
              style={styles.input}
              value={mobileNo}
              onChangeText={setMobileNo}
              placeholder="Mobile Number"
            />
            <TextInput
              style={styles.input}
              value={houseNo}
              onChangeText={setHouseNo}
              placeholder="House No"
            />
            <TextInput
              style={styles.input}
              value={street}
              onChangeText={setStreet}
              placeholder="Street"
            />
            <TextInput
              style={styles.input}
              value={landmark}
              onChangeText={setLandmark}
              placeholder="Landmark"
            />
            <TextInput
              style={styles.input}
              value={ward}
              onChangeText={setWard}
              placeholder="Ward"
            />
            <TextInput
              style={styles.input}
              value={district}
              onChangeText={setDistrict}
              placeholder="District"
            />
            <TextInput
              style={styles.input}
              value={province}
              onChangeText={setProvince}
              placeholder="Province"
            />
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Pressable
                onPress={handleUpdateAddress}
                style={[styles.modalButton, { backgroundColor: "#00CED1" }]}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Update
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setEditModalVisible(false)}
                style={[styles.modalButton, { backgroundColor: "#FF0000" }]}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Cancel
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Popup xác nhận xóa với animation */}
      <Modal
        transparent={true}
        visible={deletePopupVisible}
        onRequestClose={hidePopup}
      >
        <View style={styles.popupOverlay}>
          <Animated.View style={[styles.popupContainer, { opacity: fadeAnim }]}>
            <Text style={styles.popupTitle}>Confirm Delete</Text>
            <Text style={styles.popupMessage}>
              Are you sure you want to delete this address?
            </Text>
            <View style={styles.popupButtons}>
              <Pressable
                onPress={confirmDelete}
                style={[styles.popupButton, { backgroundColor: "#00CED1" }]}
              >
                <Text style={styles.popupButtonText}>Yes</Text>
              </Pressable>
              <Pressable
                onPress={hidePopup}
                style={[styles.popupButton, { backgroundColor: "#FF0000" }]}
              >
                <Text style={styles.popupButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default AddAddressScreen;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D0D0D0",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "45%",
    marginTop: 10,
  },
  popupOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  popupContainer: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  popupMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  popupButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  popupButton: {
    padding: 10,
    borderRadius: 5,
    width: "45%",
    alignItems: "center",
  },
  popupButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
