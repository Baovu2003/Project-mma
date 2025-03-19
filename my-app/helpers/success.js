import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Button,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import API_URLS from "./config";

const SuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  const orderId = route.params?.orderId; // Nhận orderId từ navigation params

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(
          `${API_URLS.ANDROID}/orders/${orderId}`
        );
        setBill(response.data.order);
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, scaleAnim]);

  const getFullAddress = (shippingAddress) => {
    if (!shippingAddress) return "Không có dữ liệu";
    const {
      name,
      mobileNo,
      houseNo,
      street,
      landmark,
      ward,
      district,
      province,
      country,
    } = shippingAddress;

    return [
      mobileNo,
      houseNo,
      street,
      landmark,
      ward,
      district,
      province,
      country,
    ]
      .filter(Boolean) // Loại bỏ các giá trị undefined hoặc rỗng
      .join(", ");
  };
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Animated.View
        style={[styles.circle, { transform: [{ scale: scaleAnim }] }]}
      >
        <Ionicons name="checkmark" size={80} color="white" />
      </Animated.View>
      <Text style={styles.successText}>Đặt hàng thành công!</Text>

      {/* Hiển thị bill nếu có */}
      {loading ? (
        <ActivityIndicator size="large" color="green" style={styles.loading} />
      ) : bill ? (
        <View style={styles.billContainer}>
          <Text style={styles.billTitle}>🛒 Thông tin đơn hàng</Text>

          <View style={styles.billInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.label}>👤 Name:</Text>
              <Text style={styles.value}>
                {bill?.shippingAddress?.name || "No data"}
              </Text>
            </View>

            <Text style={styles.billText}>
              📦 Số lượng sản phẩm: {bill?.products?.length ?? 0}
            </Text>
            <Text style={styles.productTitle}>🛍 Sản phẩm đã mua:</Text>
            {bill?.products?.map((product, index) => (
              <View key={index} style={styles.productContainer}>
                <Image
                  source={{ uri: product?.imageUrl }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>
                    {product?.name || "No data"}
                  </Text>
                  <Text style={styles.productDetail}>
                    🔢 Số lượng: {product?.quantity ?? 0}
                  </Text>
                  <Text style={styles.productDetail}>
                    💵 Giá: {(product?.price ?? 0).toLocaleString()} VND
                  </Text>
                </View>
              </View>
            ))}
            <Text style={styles.billText}>
              💰 Tổng tiền: {(bill?.totalPrice ?? 0).toLocaleString()} VND
            </Text>
            <Text style={styles.billText}>
              🚚 Giao hàng: {bill?.delivery || "No data"}
            </Text>
            <Text style={styles.billText}>
              💳 Thanh toán: {bill?.paymentMethod || "No data"}
            </Text>
            <Text style={styles.billText}>
              📍 Địa chỉ: {getFullAddress(bill?.shippingAddress)}
            </Text>
            <Text style={styles.billText}>
              ⏳ Trạng thái: {bill?.status || "No data"}
            </Text>
          </View>

          {/* Danh sách sản phẩm */}
        </View>
      ) : (
        <Text style={styles.errorText}>Không tìm thấy hóa đơn!</Text>
      )}

      {/* Nút quay về trang chủ */}
      <Button
        title="🏠 Quay về Trang Chủ"
        onPress={() => navigation.navigate("Main")}
        color="#00CED1"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  circle: {
    width: 90,
    height: 90,
    borderRadius: 65,
    backgroundColor: "#00CED1", // Màu xanh nhẹ nhàng hơn
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  successText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00CED1",
    marginBottom: 20,
    textAlign: "center",
  },
  loading: {
    marginVertical: 20,
  },
  billContainer: {
    width: "100%",
    padding: 20,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 30,
  },
  billTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  billInfo: {
    marginBottom: 20,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 5, // Thêm khoảng cách giữa các phần tử
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  value: {
    fontSize: 18,
    color: "#666",
  },
  billText: {
    fontSize: 16,
    color: "#555",
    marginVertical: 8,
    lineHeight: 24,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  productContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15, // Giãn cách giữa các sản phẩm
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 15, // Giãn cách giữa ảnh và thông tin
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  productDetail: {
    fontSize: 15,
    color: "#666",
    marginVertical: 4, // Giãn cách các dòng chi tiết
  },
  errorText: {
    fontSize: 16,
    color: "red",
    marginVertical: 20,
  },
});

export default SuccessScreen;
