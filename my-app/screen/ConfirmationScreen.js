import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Alert,
  Linking,
  Platform,
  Animated,
} from "react-native";
import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { UserType } from "../UserContext";
import { Entypo, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { cleanCart } from "../redux/CartReducer";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import API_URLS from "../helpers/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Modal from "react-native-modals";

const ConfirmationScreen = () => {
  const steps = [
    { title: "Address", content: "Address Form" },
    { title: "Delivery", content: "Delivery Options" },
    { title: "Payment", content: "Payment Details" },
    { title: "Place Order", content: "Order Summary" },
  ];
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const { userId, setUserId } = useContext(UserType);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const cart = useSelector((state) => state.cart.cart);
  const total = cart
    ?.map((item) => item.price * item.quantity)
    .reduce((curr, prev) => curr + prev, 0);
  const dispatch = useDispatch();

  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const moneyDeliveryFaster = 30000;

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(
        `${API_URLS.ANDROID}/addresses/${userId}`
      );
      const { addresses } = response.data;
      setAddresses(addresses);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      let finalTotal = total;
      if (selectedDeliveryOption === "express") {
        finalTotal += moneyDeliveryFaster;
      }

      const orderData = {
        userId: userId,
        cartItems: cart,
        totalPrice: finalTotal,
        shippingAddress: selectedAddress,
        paymentMethod: selectedOption,
        deliveryOption: selectedDeliveryOption,
      };

      const response = await axios.post(
        `${API_URLS.ANDROID}/orders`,
        orderData
      );
      if (response.status === 201) {
        dispatch(cleanCart());
        setModalVisible(true);
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();

        // Đợi 5 giây rồi quay lại CartScreen
        setTimeout(() => {
          setModalVisible(false);
          navigation.navigate("Main")
        }, 3000);
      } else {
        console.log("Error creating order", response.data);
        setIsPlacingOrder(false);
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  const payWithVNPay = async () => {
    console.log("Bắt đầu thanh toán VNPay");
    try {
      let finalTotal = total;
      if (selectedDeliveryOption === "express") {
        finalTotal += moneyDeliveryFaster;
      }
      const orderData = {
        userId,
        cartItems: cart,
        totalPrice: finalTotal,
        shippingAddress: selectedAddress,
        paymentMethod: "VNPay",
        deliveryOption: selectedDeliveryOption,
      };

      const response = await axios.post(
        `${API_URLS.ANDROID}/vnpay/create_payment`,
        {
          amount: finalTotal,
          orderInfo: `Thanh toán đơn hàng trên CoffeeShop`,
          returnUrl: `${API_URLS.ANDROID}/check-payment-vnpay`,
          orderData: orderData,
        }
      );
      console.log({ response });

      const { paymentUrl, orderId } = response.data; // Lấy thêm orderId từ backend
      console.log("URL Thanh toán:", paymentUrl);
      console.log("orderId", orderId);

      if (!paymentUrl) {
        console.error("Không lấy được URL thanh toán VNPay");
        return;
      }

      // Điều hướng đến URL thanh toán trong cùng tab
      if (Platform.OS === "web") {
        await AsyncStorage.setItem("pendingOrderId", orderId); // Mobile
        window.location.href = paymentUrl; // Mở trong cùng tab trên web
      } else {
        await AsyncStorage.setItem("pendingOrderId", orderId); // Mobile
        await Linking.openURL(paymentUrl); // Mobile mở trong trình duyệt mặc định
      }
    } catch (error) {
      console.error("Lỗi thanh toán VNPay:", error);
    }
  };

  // Kiểm tra trạng thái thanh toán khi màn hình được focus lại

  return (
    <ScrollView style={{ marginTop: 55 }}>
      {/* Phần giao diện giữ nguyên như code ban đầu */}
      <View
        style={{
          backgroundColor: "#00CED1",
          padding: 15,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={{
            marginRight: 10,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>
            Back
          </Text>
        </Pressable>
      </View>

      {/* Các bước giao diện giữ nguyên */}
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 40 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
            justifyContent: "space-between",
          }}
        >
          {steps?.map((step, index) => (
            <View
              key={index}
              style={{ justifyContent: "center", alignItems: "center" }}
            >
              {index > 0 && (
                <View
                  style={[
                    { flex: 1, height: 2, backgroundColor: "green" },
                    index <= currentStep && { backgroundColor: "green" },
                  ]}
                />
              )}
              <View
                style={[
                  {
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: "#ccc",
                    justifyContent: "center",
                    alignItems: "center",
                  },
                  index < currentStep && { backgroundColor: "green" },
                ]}
              >
                {index < currentStep ? (
                  <Text
                    style={{ fontSize: 16, fontWeight: "bold", color: "white" }}
                  >
                    ✓
                  </Text>
                ) : (
                  <Text
                    style={{ fontSize: 16, fontWeight: "bold", color: "white" }}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text style={{ textAlign: "center", marginTop: 8 }}>
                {step.title}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <Modal transparent={true} visible={modalVisible} animationType="fade">
  <View style={styles.modalContainer}>
    <View style={styles.containerModal}>
      <Animated.View
        style={[styles.circle, { transform: [{ scale: scaleAnim }] }]}
      >
        <Ionicons name="checkmark" size={80} color="white" />
      </Animated.View>
      <Text style={styles.successText}>Đặt hàng thành công!</Text>
    </View>
  </View>
</Modal>
      {/* Step 0: Select Address */}
      {currentStep === 0 && (
        <View style={{ marginHorizontal: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            Select Delivery Address
          </Text>
          <Pressable>
            {addresses?.map((item, index) => (
              <Pressable
                key={index}
                style={{
                  borderWidth: 1,
                  borderColor: "#D0D0D0",
                  padding: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  paddingBottom: 17,
                  marginVertical: 7,
                  borderRadius: 6,
                }}
              >
                {selectedAddress && selectedAddress._id === item?._id ? (
                  <FontAwesome5 name="dot-circle" size={20} color="#008397" />
                ) : (
                  <Entypo
                    onPress={() => setSelectedAddress(item)}
                    name="circle"
                    size={20}
                    color="gray"
                  />
                )}
                <View style={{ marginLeft: 6 }}>
                  <Text style={{ fontSize: 15, fontWeight: "bold" }}>
                    {item?.name}
                  </Text>
                  <Text style={{ fontSize: 15, color: "#181818" }}>
                    {item?.houseNo}, {item?.landmark}, {item?.street}
                  </Text>
                  <Text style={{ fontSize: 15, color: "#181818" }}>
                    {item?.ward}, {item?.district}, {item?.province},{" "}
                    {item?.country}
                  </Text>
                  <Text style={{ fontSize: 15, color: "#181818" }}>
                    Phone No: {item?.mobileNo}
                  </Text>
                  {selectedAddress && selectedAddress._id === item?._id && (
                    <Pressable
                      onPress={() => setCurrentStep(1)}
                      style={{
                        backgroundColor: "#008397",
                        padding: 10,
                        borderRadius: 20,
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 10,
                      }}
                    >
                      <Text style={{ textAlign: "center", color: "white" }}>
                        Deliver to this Address
                      </Text>
                    </Pressable>
                  )}
                </View>
              </Pressable>
            ))}
          </Pressable>
        </View>
      )}

      {/* Step 1: Delivery Options */}
      {currentStep === 1 && (
        <View style={{ marginHorizontal: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            Choose your delivery options
          </Text>
          <Pressable
            onPress={() => setSelectedDeliveryOption("standard")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor:
                selectedDeliveryOption === "standard" ? "#008397" : "white",
              padding: 10,
              gap: 7,
              borderColor: "#D0D0D0",
              borderWidth: 1,
              marginTop: 10,
            }}
          >
            {selectedDeliveryOption === "standard" ? (
              <FontAwesome5 name="dot-circle" size={20} color="white" />
            ) : (
              <Entypo name="circle" size={20} color="gray" />
            )}
            <Text
              style={{
                color:
                  selectedDeliveryOption === "standard" ? "white" : "black",
              }}
            >
              Standard Delivery - FREE with Prime
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setSelectedDeliveryOption("express")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor:
                selectedDeliveryOption === "express" ? "#008397" : "white",
              padding: 10,
              gap: 7,
              borderColor: "#D0D0D0",
              borderWidth: 1,
              marginTop: 10,
            }}
          >
            {selectedDeliveryOption === "express" ? (
              <FontAwesome5 name="dot-circle" size={20} color="white" />
            ) : (
              <Entypo name="circle" size={20} color="gray" />
            )}
            <Text
              style={{
                color: selectedDeliveryOption === "express" ? "white" : "black",
              }}
            >
              Express Delivery - Arrives faster +${moneyDeliveryFaster} đ
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setCurrentStep(2)}
            disabled={!selectedDeliveryOption}
            style={{
              backgroundColor: selectedDeliveryOption ? "#FFC72C" : "gray",
              padding: 10,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 15,
            }}
          >
            <Text>Continue</Text>
          </Pressable>
        </View>
      )}

      {/* Step 2: Payment Method */}
      {currentStep === 2 && (
        <View style={{ marginHorizontal: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            Select your payment Method
          </Text>
          <View
            style={{
              backgroundColor: "white",
              padding: 8,
              borderColor: "#D0D0D0",
              borderWidth: 1,
              flexDirection: "row",
              alignItems: "center",
              gap: 7,
              marginTop: 12,
            }}
          >
            {selectedOption === "cash" ? (
              <FontAwesome5 name="dot-circle" size={20} color="#008397" />
            ) : (
              <Entypo
                onPress={() => setSelectedOption("cash")}
                name="circle"
                size={20}
                color="gray"
              />
            )}
            <Text>Cash on Delivery</Text>
          </View>
          <View
            style={{
              backgroundColor: "white",
              padding: 8,
              borderColor: "#D0D0D0",
              borderWidth: 1,
              flexDirection: "row",
              alignItems: "center",
              gap: 7,
              marginTop: 12,
            }}
          >
            {selectedOption === "vnpay" ? (
              <FontAwesome5 name="dot-circle" size={20} color="#008397" />
            ) : (
              <Entypo
                onPress={() => {
                  setSelectedOption("vnpay");
                  payWithVNPay();
                }}
                name="circle"
                size={20}
                color="gray"
              />
            )}
            <Text>Thanh toán qua VNPay</Text>
          </View>
          <Pressable
            onPress={() => setCurrentStep(3)}
            style={{
              backgroundColor: "#FFC72C",
              padding: 10,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 15,
            }}
          >
            <Text>Continue</Text>
          </Pressable>
        </View>
      )}

      {/* Step 3: Order Summary */}
      {currentStep === 3 && selectedOption === "cash" && (
        <View style={{ marginHorizontal: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>Order Now</Text>
          <View
            style={{
              backgroundColor: "white",
              padding: 8,
              borderColor: "#D0D0D0",
              borderWidth: 1,
              marginTop: 10,
            }}
          >
            <Text>Shipping to {selectedAddress?.name}</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 8,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "500", color: "gray" }}>
                Items
              </Text>
              <Text style={{ color: "gray", fontSize: 16 }}>{total}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 8,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "500", color: "gray" }}>
                Delivery
              </Text>
              <Text style={{ color: "gray", fontSize: 16 }}>
                {selectedDeliveryOption === "express"
                  ? `${moneyDeliveryFaster}`
                  : `0`}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 8,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                Order Total
              </Text>
              <Text
                style={{ color: "#C60C30", fontSize: 17, fontWeight: "bold" }}
              >
                {selectedDeliveryOption === "express"
                  ? total + moneyDeliveryFaster
                  : total}
              </Text>
            </View>
          </View>
          <View
            style={{
              backgroundColor: "white",
              padding: 8,
              borderColor: "#D0D0D0",
              borderWidth: 1,
              marginTop: 10,
            }}
          >
            <Text style={{ fontSize: 16, color: "gray" }}>Pay With</Text>
            <Text style={{ fontSize: 16, fontWeight: "600", marginTop: 7 }}>
              Pay on delivery (Cash)
            </Text>
          </View>
          <Pressable
            onPress={handlePlaceOrder}
            style={{
              backgroundColor: "#FFC72C",
              padding: 10,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <Text>Place your order</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
};

export default ConfirmationScreen;
const styles = StyleSheet.create({
  modalContainer: {
   
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Làm mờ nền phía sau
  },
  containerModal: {
    width: "150%",
    height: "100%",
    backgroundColor: "#fff", 
    borderRadius: 20, 
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  circle: {
    width: 90,
    height: 90,
    borderRadius: 45, 
    backgroundColor: "#00CED1", // Màu xanh nhạt
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    shadowColor: "#000",
  },
  successText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00CED1",
    marginBottom: 20,
    textAlign: "center",
  },
});

