import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import React, { useEffect, useState, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { UserType } from "../UserContext";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
// import { Picker } from "react-native-web";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import API_URLS from "../helpers/config";


const AddressScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const { userId, setUserId } = useContext(UserType);

  // State cho tỉnh, huyện, xã
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem("authToken");
      console.log({ token });
      const decodedToken = jwtDecode(token);
      console.log("decodedToken", decodedToken);
      const userId = decodedToken.userId;
      setUserId(userId);
    };

    fetchUser();
  }, []);
  axios.get("https://provinces.open-api.vn/api/?depth=1").then((res) => {
    setProvinces(res.data);
  });

  const fetchDistricts = (provinceCode) => {
    axios
      .get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
      .then((res) => {
        setDistricts(res.data.districts);
        setWards([]);
        setSelectedDistrict(null);
        setSelectedWard(null);
      });
  };

  const fetchWards = (districtCode) => {
    axios
      .get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
      .then((res) => {
        setWards(res.data.wards);
        setSelectedWard(null);
      });
  };
  // State để lưu lỗi của từng field
  const [errors, setErrors] = useState({});

  const validateFields = () => {
    const newErrors = {};

    if (!name) newErrors.name = "Full Name is required";
    if (!mobileNo) newErrors.mobileNo = "Mobile Number is required";
    if (!selectedProvince)
      newErrors.selectedProvince = "Please select a Province";
    if (!selectedDistrict)
      newErrors.selectedDistrict = "Please select a District";
    if (!selectedWard) newErrors.selectedWard = "Please select a Ward";
    if (!street) newErrors.street = "Street/Area is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddAddress = async () => {
    if (!validateFields()) return;

    console.log({ provinces });
    console.log({ selectedProvince });
    const provinceName =
      provinces.find((p) => p.code == selectedProvince)?.name || "";
    console.log({ provinceName });
    const districtName =
      districts.find((d) => d.code == selectedDistrict)?.name || "";
    const wardName = wards.find((w) => w.code == selectedWard)?.name || "";

    const address = {
      name,
      mobileNo,
      houseNo,
      street,
      landmark,
      province: provinceName,
      district: districtName,
      ward: wardName,
      country: "Vietnam",
    };

    try {
      const response = await axios.post( `${API_URLS.ANDROID}/addresses/`, {
        userId,
        address,
      });
      // const response = await axios.post( `${API_URLS.ANDROID}/addresses/`, {
      //   userId,
      //   address,
      // });
      Alert.alert("Success", "Address added successfully");
      // Reset form fields
      setName("");
      setMobileNo("");
      setHouseNo("");
      setStreet("");
      setLandmark("");
      setSelectedProvince(null);
      setSelectedDistrict(null);
      setSelectedWard(null);
      setDistricts([]);
      setWards([]);

      setTimeout(() => {
        navigation.goBack();
      }, 500);
    } catch (error) {
      Alert.alert("Error", "Failed to add address");
      console.error("Error adding address:", error);
    }
  };

  return (
    <ScrollView style={{ marginTop: 50 }}>
      <View
        style={{
          backgroundColor: "#00CED1",
          padding: 10,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {/* Nút Back */}
        <Pressable
          onPress={() => navigation.goBack()}
          style={{ marginRight: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
      </View>
      <View style={{ height: 50, backgroundColor: "#00CED1" }} />
      
      <View style={{ padding: 10 }}>
        <Text style={{ fontSize: 17, fontWeight: "bold", textAlign: "center" }}>
          Add a new Address
        </Text>

        <View style={{ marginVertical: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: "bold" }}>
            Full name (First and last name)
          </Text>

          <TextInput
            value={name}
            onChangeText={(text) => setName(text)}
            placeholderTextColor={"black"}
            style={{
              padding: 10,
              borderColor: "#D0D0D0",
              borderWidth: 1,
              marginTop: 10,
              borderRadius: 5,
            }}
            placeholder="Enter your name"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View>
          <Text style={{ fontSize: 15, fontWeight: "bold" }}>
            Mobile numebr
          </Text>

          <TextInput
            value={mobileNo}
            onChangeText={(text) => setMobileNo(text)}
            placeholderTextColor={"black"}
            style={{
              padding: 10,
              borderColor: "#D0D0D0",
              borderWidth: 1,
              marginTop: 10,
              borderRadius: 5,
            }}
            placeholder="Mobile No"
          />
          {errors.mobileNo && (
            <Text style={styles.errorText}>{errors.mobileNo}</Text>
          )}
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Select Province</Text>
          <Picker
            selectedValue={selectedProvince}
            onValueChange={(value) => {
              setSelectedProvince(value);
              fetchDistricts(value);
            }}
            style={styles.picker}
          >
            {provinces.map((prov) => (
              <Picker.Item
                key={prov.code}
                label={prov.name}
                value={prov.code}
              />
            ))}
          </Picker>
          {errors.selectedProvince && (
            <Text style={styles.errorText}>{errors.selectedProvince}</Text>
          )}
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Select District</Text>
          <Picker
            selectedValue={selectedDistrict}
            onValueChange={(value) => {
              setSelectedDistrict(value);
              fetchWards(value);
            }}
            enabled={districts.length > 0}
            style={styles.picker}
          >
            {districts.map((dist) => (
              <Picker.Item
                key={dist.code}
                label={dist.name}
                value={dist.code}
              />
            ))}
          </Picker>
          {errors.selectedDistrict && (
            <Text style={styles.errorText}>{errors.selectedDistrict}</Text>
          )}
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Select Ward</Text>
          <Picker
            selectedValue={selectedWard}
            onValueChange={(value) => setSelectedWard(value)}
            enabled={wards.length > 0}
            style={styles.picker}
          >
            {wards.map((ward) => (
              <Picker.Item
                key={ward.code}
                label={ward.name}
                value={ward.code}
              />
            ))}
          </Picker>
          {errors.selectedWard && (
            <Text style={styles.errorText}>{errors.selectedWard}</Text>
          )}
        </View>

        <View style={{ marginVertical: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: "bold" }}>
            Flat,House No,Building,Company
          </Text>

          <TextInput
            value={houseNo}
            onChangeText={(text) => setHouseNo(text)}
            placeholderTextColor={"black"}
            style={{
              padding: 10,
              borderColor: "#D0D0D0",
              borderWidth: 1,
              marginTop: 10,
              borderRadius: 5,
            }}
            placeholder=""
          />
        </View>

        <View>
          <Text style={{ fontSize: 15, fontWeight: "bold" }}>
            Area,Street,sector,village
          </Text>
          <TextInput
            value={street}
            onChangeText={(text) => setStreet(text)}
            placeholderTextColor={"black"}
            style={{
              padding: 10,
              borderColor: "#D0D0D0",
              borderWidth: 1,
              marginTop: 10,
              borderRadius: 5,
            }}
            placeholder=""
          />
          {errors.street && (
            <Text style={styles.errorText}>{errors.street}</Text>
          )}
        </View>

        <View style={{ marginVertical: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: "bold" }}>Landmark</Text>
          <TextInput
            value={landmark}
            onChangeText={(text) => setLandmark(text)}
            placeholderTextColor={"black"}
            style={{
              padding: 10,
              borderColor: "#D0D0D0",
              borderWidth: 1,
              marginTop: 10,
              borderRadius: 5,
            }}
            placeholder="Eg near appollo hospital"
          />
        </View>

        <Pressable
          onPress={handleAddAddress}
          style={{
            backgroundColor: "#FFC72C",
            padding: 19,
            borderRadius: 6,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>Add Address</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default AddressScreen;

const styles = StyleSheet.create({
  pickerContainer: {
    marginBottom: 15, // Khoảng cách giữa các picker
  },
  label: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 5,
  },
  picker: {
    height: 50,
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 5,
    backgroundColor: "#fff",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  errorText: {
    color: "red",
    fontSize: 13,
    marginTop: 5, // Giúp lỗi không bị sát với Picker
  },
});
