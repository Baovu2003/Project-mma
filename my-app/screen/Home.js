import React, { useState, useEffect, useCallback, useContext } from "react";

import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Platform,
  Pressable,
  TextInput,
  FlatList,
  Image,
} from "react-native"; // Thêm View vào import
import styles from "./homeStyles";
import {
  AntDesign,
  Entypo,
  Feather,
  FontAwesome,
  Fontisto,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";

import Carousel from "../components/home/Carousel";
import Headings from "../components/home/Headings";
import ProductRow from "../components/products/ProductRow";
import useFetch from "../hook/useFetch";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BottomModal, ModalContent, SlideAnimation } from "react-native-modals";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { UserType } from "../UserContext";
import API_URLS from "../helpers/config";
function Home() {
  const navigation = useNavigation();
  const { data, isLoading, error } = useFetch();
  const cart = useSelector((state) => state.cart.cart);
  console.log("cart", cart);
  const [username, setUsername] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAdress] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const { userId, setUserId } = useContext(UserType);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  console.log("userId",userId)
  useEffect(() => {
    if (userId) {
      fetchAddresses();
    }
  }, [userId, modalVisible]);
  const fetchAddresses = async () => {
    try {
      // const response = await axios.get(`${API_URLS.WEB}/addresses/${userId}`);
      const response = await axios.get(`${API_URLS.ANDROID}/addresses/${userId}`);

      // const response = await axios.get(
      //   `${API_URLS.ANDROID}/addresses/${userId}`
      // );

      console.log({ response });
      const { addresses } = response.data;

      setAddresses(addresses);
    } catch (error) {
      console.log("error", error);
    }
  };
  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const userName = await AsyncStorage.getItem("username");
      setUsername(userName);
      if (!token) return;
  
      const decodedToken = jwtDecode(token);
      console.log("Decoded Token:", decodedToken);
      // Lấy userId từ token
      const userId = decodedToken.userId;
      setUserId(userId);
      console.log("User ID:", userId);
    } catch (error) {
      console.log("Error decoding token:", error);
    }
  };
  
  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("username");
    navigation.replace("LoginScreen");
  };
  // Khi thay đổi searchQuery, lọc danh sách sản phẩm
  useEffect(() => {
    console.log("Search", searchQuery);
    if (searchQuery.trim() === "") {
      setFilteredProducts([]);
    } else {
      const filtered = data.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, data]);

  console.log("data products::::::", data);
  return (
    <>
      
      <View style={{ flex: 1}}>
        <SafeAreaView
          style={{
            paddingTop: Platform.OS === "android" ? 40 : 0,
            flex: 1,
            backgroundColor: "white",
          }}
        >
          <Headings username={username} handleLogout={handleLogout} />

          {/* Thanh tìm kiếm */}
          <View
            style={{
              backgroundColor: "#00CED1",
              padding: 10,
              flexDirection: "row",
              alignItems: "center",
              marginTop: 50,
            }}
          >
            <Pressable
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginHorizontal: 7,
                gap: 10,
                backgroundColor: "white",
                borderRadius: 3,
                height: 38,
                flex: 1,
                paddingHorizontal: 10,
              }}
            >
              <AntDesign name="search1" size={22} color="black" />
              <TextInput
                placeholder="Search Coffee"
                style={{ flex: 1 }}
                value={searchQuery}
                onChangeText={(text) => setSearchQuery(text)}
              />
            </Pressable>
            <Feather name="mic" size={24} color="black" />
          </View>

          {/* Kết quả tìm kiếm - luôn hiển thị cố định */}
          {searchQuery.length > 0 && (
            <View
              style={{
                position: "absolute",
                top: 100,
                left: 0,
                right: 0,
                backgroundColor: "white",
                zIndex: 10,
                maxHeight: 200,
                borderRadius: 8,
                shadowColor: "#000",
              }}
            >
              <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("ProductDetail", { item })
                    }
                    style={{
                      flexDirection: "row",
                      padding: 10,
                      borderBottomWidth: 1,
                      borderColor: "#ddd",
                      backgroundColor: "white",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      source={{ uri: item?.imageUrl }}
                      style={{ width: 50, height: 50, borderRadius: 5 }}
                    />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                        {item.name}
                      </Text>
                      <Text style={{ fontSize: 14, color: "green" }}>
                        {item.price.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={true}
              />
            </View>
          )}
           <Pressable
            onPress={() => setModalVisible(!modalVisible)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              padding: 10,
              backgroundColor: "#AFEEEE",
            }}
          >
            <Ionicons name="location-outline" size={24} color="black" />

            <Pressable>
            {selectedAddress ? (
                <Text>
                  Deliver to {selectedAddress?.name} - {selectedAddress?.street}
                </Text>
              ) : (
                <Text style={{ fontSize: 13, fontWeight: "500" }}>
                    Add a Address
                </Text>
              )}
            </Pressable>

            <MaterialIcons name="keyboard-arrow-down" size={24} color="black" />
          </Pressable>

          {/* Nội dung chính */}
          <ScrollView contentContainerStyle={{}}>
            <Carousel />

            <View style={{ marginTop: 20, marginHorizontal: 16 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 8,
                }}
              >
                <Text
                  style={{ fontSize: 20, fontWeight: "600", color: "#333" }}
                >
                  New Coffee
                </Text>
                <TouchableOpacity
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    backgroundColor: "#F5F5F5",
                  }}
                >
                  <Ionicons name="menu-outline" size={28} color="black" />
                </TouchableOpacity>
              </View>
            </View>

            <FlatList
              data={data}
              numColumns={2}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => <ProductRow item={item} />}
              columnWrapperStyle={{
                justifyContent: "space-between",
                marginHorizontal: 10,
              }}
              nestedScrollEnabled={true}
            />
          </ScrollView>
        </SafeAreaView>
      </View>

      {/* Modal Thêm địa chỉ */}
      <BottomModal
        onBackdropPress={() => setModalVisible(!modalVisible)}
        swipeDirection={["up", "down"]}
        swipeThreshold={50}
        modalAnimation={
          new SlideAnimation({
            slideFrom: "bottom",
          })
        }
        onHardwareBackPress={() => setModalVisible(!modalVisible)}
        visible={modalVisible}
        onTouchOutside={() => setModalVisible(!modalVisible)}
      >
        <ModalContent style={{ width: "100%", height: 400 }}>
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: "500" }}>
              Choose your Location
            </Text>

            <Text style={{ marginTop: 5, fontSize: 16, color: "gray" }}>
              Select a delivery location to see product availabilty and delivery
              options
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10 }}
          >
            {addresses?.map((item, index) => (
              <Pressable
                key={index}
                onPress={() => setSelectedAdress(item)}
                style={{
                  width: 140,
                  height: 140,
                  borderColor: "#D0D0D0",
                  borderWidth: 1,
                  padding: 10,
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 3,
                  marginRight: 15,
                  marginTop: 10,
                  backgroundColor:
                    selectedAddress === item ? "#FBCEB1" : "white",
                }}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "bold" }}>
                    {item?.name}
                  </Text>
                  <Entypo name="location-pin" size={24} color="red" />
                </View>

                {/* Địa chỉ chi tiết */}
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 13,
                    color: "#181818",
                    textAlign: "center",
                  }}
                >
                  {item?.landmark} {item?.houseNo}
                </Text>

                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 13,
                    color: "#181818",
                    textAlign: "center",
                  }}
                >
                  {item?.street}
                </Text>

                <Text
                  numberOfLines={2}
                  style={{
                    fontSize: 12,
                    color: "#181818",
                    textAlign: "center",
                  }}
                >
                  {item?.ward}, {item?.district}, {item?.province},{" "}
                  {item?.country}
                </Text>
              </Pressable>
            ))}
            <Pressable
              onPress={() => {
                setModalVisible(false);
                navigation.navigate("Address");
              }}
              style={{
                width: 140,
                height: 140,
                borderColor: "#D0D0D0",
                marginTop: 10,
                borderWidth: 1,
                padding: 10,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "#0066b2",
                  fontWeight: "500",
                }}
              >
                Add an Address or pick-up point
              </Text>
            </Pressable>
          </ScrollView>

          <View style={{ flexDirection: "column", gap: 7, marginBottom: 30 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            >
              <Entypo name="location-pin" size={22} color="#0066b2" />
              <Text style={{ color: "#0066b2", fontWeight: "400" }}>
                Enter an Indian pincode
              </Text>
            </View>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            >
              <Ionicons name="locate-sharp" size={22} color="#0066b2" />
              <Text style={{ color: "#0066b2", fontWeight: "400" }}>
                Use My Currect location
              </Text>
            </View>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            >
              <AntDesign name="earth" size={22} color="#0066b2" />

              <Text style={{ color: "#0066b2", fontWeight: "400" }}>
                Deliver outside India
              </Text>
            </View>
          </View>
        </ModalContent>
      </BottomModal>
    </>
  );
}

export default Home;
