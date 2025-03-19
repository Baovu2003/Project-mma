import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Pressable,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Image } from "react-native";
import API_URLS from "../helpers/config";

// Cấu hình trạng thái đơn hàng với màu sắc
const STATUS_CONFIG = {
  pending: { text: "Chờ xác nhận", color: "#FFA500" },
  success: { text: "Đã thanh toán", color: "#28A745" },
  failed: { text: "Đã hủy", color: "#DC3545" },
};

const OrderScreen = ({ route }) => {
  const { orderId } = route.params;
  const navigation = useNavigation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(
          // `${API_URLS.WEB}/orders/${orderId}`
          `${API_URLS.ANDROID}/orders/${orderId}`
        );
        setOrder(response.data.order);
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Không tìm thấy đơn hàng.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={{       
          flexDirection: "row",
          alignItems: "center",
          marginBottom:20
        }}
      >
        {/* Nút Back */}
  <Pressable
    onPress={() => navigation.goBack()}
    style={{
      flexDirection: "row",
      alignItems: "center",
    }}
  >
    <Ionicons
      name="arrow-back"
      size={24}
      color="white"
      style={{
        backgroundColor: "#007BFF",
        padding: 8,
        borderRadius: 30,
      }}
    />
  </Pressable>
        

        {/* Thêm flex: 1 để căn giữa */}
        <Text
          style={[
            styles.title,
            { flex: 1, textAlign: "center", marginBottom: 0,fontSize: 22,
              fontWeight: "bold",
              color: "red", },
          ]}
        >
          Detail Orders
        </Text>
      </View>

      <View style={styles.orderInfo}>
        <Text style={styles.orderText}>
          <Text style={styles.bold}>Mã đơn:</Text> {order._id}
        </Text>
        <Text style={styles.orderText}>
          <Text style={styles.bold}>Tổng tiền:</Text>
          {order?.totalPrice.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          })}
        </Text>
        <Text
          style={[
            styles.orderText,
            { color: STATUS_CONFIG[order.status]?.color || "#000" },
          ]}
        >
          <Text style={styles.bold}>Trạng thái:</Text>{" "}
          {STATUS_CONFIG[order.status]?.text || "Không xác định"}
        </Text>
        <Text style={styles.orderText}>
          <Text style={styles.bold}>Ngày đặt hàng:</Text>{" "}
          {new Date(order.createdAt).toLocaleString("vi-VN")}
        </Text>
      </View>

      {/* Danh sách sản phẩm */}
      <Text style={styles.sectionTitle}>Detail products in Orders</Text>
      <FlatList
        data={order.products}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
          {/* Chia thành hai cột: thông tin bên trái, ảnh bên phải */}
          <View style={{ flex: 1 }}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productText}>Số lượng: {item.quantity}</Text>
            <Text style={styles.productText}>
              Giá:{" "}
              {item?.price.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </Text>
          </View>
    
          {/* Hình ảnh bên phải */}
          <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.productImage} 
          />
        </View>

          
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Không có sản phẩm nào.</Text>
        }
      />
    </View>
  );
};

export default OrderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#DC3545",
  },
  orderInfo: {
    backgroundColor: "#F8F9FA",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  orderText: {
    fontSize: 16,
    marginBottom: 5,
  },
  bold: {
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    textAlign: "center",
    color: "#343A40",
  },
  productItem: {
    flexDirection: "row", // Căn theo hàng ngang
    backgroundColor: "#FFF",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
    alignItems: "center", // Căn giữa theo chiều dọc
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007BFF",
  },
  productText: {
    fontSize: 14,
    color: "#555",
  },
  productImage: {
    width: 100, // Độ rộng ảnh
    height: 100, // Độ cao ảnh
    marginLeft: 10, // Khoảng cách với chữ bên trái
    borderRadius: 8, // Bo góc ảnh
    resizeMode: "cover", // Hiển thị ảnh đúng tỉ lệ
  },
});
