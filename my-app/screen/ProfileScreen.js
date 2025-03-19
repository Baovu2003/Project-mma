import React, { useEffect, useContext, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { UserType } from "../UserContext";
import { useNavigation } from "@react-navigation/native";
import API_URLS from "../helpers/config";

// 🔹 Cấu hình trạng thái đơn hàng
const STATUS_CONFIG = {
  pending: { icon: "🕒", text: "Chờ xác nhận", color: "#FFA500" },
  success: { icon: "✅", text: "Đã mua", color: "#28A745" },
  failed: { icon: "❌", text: "Đã hủy", color: "#DC3545" },
};

// 🔹 Cấu hình phương thức thanh toán
const PAYMENT_METHODS = {
  all: { text: "Tất cả", icon: "💰" },
  vnpay: { text: "VNPay", icon: "🏦" },
  cash: { text: "Cash", icon: "💵" },
};

// 🔹 Component Header Profile
const ProfileHeader = React.memo(({ user }) => (
  <View style={styles.profileSection}>
    <Ionicons name="person-circle" size={80} color="#555" />
    <Text style={styles.name}>{user.name}</Text>
    <Text style={styles.email}>{user.email}</Text>
  </View>
));

// 🔹 Component Nút Chọn Trạng Thái
const OrderStatusButton = React.memo(({ status, count, selected, onPress }) => {
  const config = STATUS_CONFIG[status];
  return (
    <TouchableOpacity
      style={[styles.orderStatus, selected && styles.selectedStatus]}
      onPress={onPress}
    >
      <Text style={[styles.statusText, selected && { color: "white" }]}>
        {`${config.icon} ${config.text} (${count})`}
      </Text>
    </TouchableOpacity>
  );
});

// 🔹 Component Nút Chọn Phương Thức Thanh Toán
const PaymentFilterButton = React.memo(({ method, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.paymentButton, selected && styles.selectedPayment]}
    onPress={onPress}
  >
    <Text style={[styles.paymentText, selected && { color: "white" }]}>
      {`${PAYMENT_METHODS[method].icon} ${PAYMENT_METHODS[method].text}`}
    </Text>
  </TouchableOpacity>
));

// 🔹 Component Danh Sách Đơn Hàng
const OrderList = React.memo(({ orders }) => {
  const navigation = useNavigation();
  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.orderBox}
          onPress={() => navigation.navigate("Order", { orderId: item._id })}
        >
          <Text style={styles.orderText}>Mã đơn: {item._id}</Text>
          <Text style={styles.orderText}>Tổng tiền: {item.totalPrice} VND</Text>
          <Text style={styles.orderText}>Thanh toán: {item.paymentMethod.toUpperCase()}</Text>
          <Text style={[styles.orderText, { color: STATUS_CONFIG[item.status].color }]}>
            Trạng thái: {STATUS_CONFIG[item.status].text}
          </Text>
        </TouchableOpacity>
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={<Text style={styles.noOrders}>Không có đơn hàng nào.</Text>}
    />
  );
});

const ProfileScreen = () => {
  const { userId } = useContext(UserType);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("success");
  const [selectedPayment, setSelectedPayment] = useState("all");

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const userRes = await axios.get(`${API_URLS.ANDROID}/users/${userId}`);
        const ordersRes = await axios.get(`${API_URLS.ANDROID}/orders/user/${userId}`);

        if (mounted) {
          setUser(userRes.data.user);
          setOrders(ordersRes.data.orders);
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error.response?.data || error.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, [userId]);

  const orderCounts = useMemo(() => ({
    pending: orders.filter((o) => o.status === "pending").length,
    success: orders.filter((o) => o.status === "success").length,
    failed: orders.filter((o) => o.status === "failed").length,
  }), [orders]);

  const filteredOrders = useMemo(() => 
    orders.filter((order) => 
      order.status === selectedStatus &&
      (selectedPayment === "all" || order.paymentMethod.toLowerCase() === selectedPayment.toLowerCase())
    ),
    [orders, selectedStatus, selectedPayment]
  );
console.log({selectedPayment})
  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );

  if (!user)
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy thông tin người dùng.</Text>
      </View>
    );

  return (
    <ScrollView>
      <View style={styles.container}>
        <ProfileHeader user={user} />

        {/* Bộ lọc trạng thái đơn hàng */}
        <View style={styles.orderSummary}>
          {Object.keys(STATUS_CONFIG).map((status) => (
            <OrderStatusButton
              key={status}
              status={status}
              count={orderCounts[status]}
              selected={selectedStatus === status}
              onPress={() => setSelectedStatus(status)}
            />
          ))}
        </View>

        {/* Bộ lọc phương thức thanh toán */}
        <View style={styles.paymentFilter}>
          {Object.keys(PAYMENT_METHODS).map((method) => (
            <PaymentFilterButton
              key={method}
              method={method}
              selected={selectedPayment === method}
              onPress={() => setSelectedPayment(method)}
            />
          ))}
        </View>

        {/* Danh sách đơn hàng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {STATUS_CONFIG[selectedStatus].icon} Đơn hàng {STATUS_CONFIG[selectedStatus].text}
          </Text>
          <OrderList orders={filteredOrders} />
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;

// 🎨 **Styles tối ưu UI**
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", padding: 16 },
  profileSection: { alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  name: { fontSize: 22, fontWeight: "bold", marginTop: 10 },
  email: { fontSize: 16, color: "gray" },
  orderSummary: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", paddingHorizontal: 20, marginVertical: 15, gap: 10 },
  orderStatus: { padding: 10, borderWidth: 1, borderRadius: 5, borderColor: "#ddd", alignItems: "center" },
  separator: { height: 1, backgroundColor: "#ddd" },
  selectedStatus: { backgroundColor: "#007BFF", borderColor: "#007BFF" },
  paymentFilter: { flexDirection: "row", justifyContent: "center", marginBottom: 15, gap: 10 },
  paymentButton: { padding: 8, borderWidth: 1, borderRadius: 5, borderColor: "#ddd", alignItems: "center" },
  selectedPayment: { backgroundColor: "#28A745", borderColor: "#28A745" },
});
