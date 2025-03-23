import React, { useEffect, useContext, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  ScrollView,
  Modal,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { UserType } from "../UserContext";
import { useNavigation } from "@react-navigation/native";
import API_URLS from "../helpers/config";

// 🔹 Cấu hình trạng thái đơn hàng
const STATUS_CONFIG = {
  Pending: { icon: "🕒", text: "Chờ xác nhận", color: "#FFA500" },
  Shipped: { icon: "🚚", text: "Đang giao", color: "#FFA500" },
  Completed: { icon: "✅", text: "Đã mua", color: "#28A745" },
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
const OrderList = React.memo(({ orders, onShowCancelModal }) => {
  const navigation = useNavigation();
  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <View style={styles.orderBox}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Order", { orderId: item._id })}
          >
            <Text style={styles.orderText}>Mã đơn: {item._id}</Text>
            <Text style={styles.orderText}>Tổng tiền: {item.totalPrice} VND</Text>
            <Text style={styles.orderText}>Thanh toán: {item.paymentMethod.toUpperCase()}</Text>
            <Text style={[styles.orderText, { color: STATUS_CONFIG[item.status].color }]}>
              Trạng thái: {STATUS_CONFIG[item.status].text}
            </Text>
          </TouchableOpacity>
          {item.status === "Pending" && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => onShowCancelModal(item._id)}
            >
              <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={() => (
        <Text style={{ fontSize: 18, marginTop: 10, fontWeight: "bold", textAlign: "center" }}>
          Không tìm thấy thông tin đơn hàng.
        </Text>
      )}
    />
  );
});

const ProfileScreen = () => {
  const { userId } = useContext(UserType);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("Completed");
  const [selectedPayment, setSelectedPayment] = useState("all");
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [orderToCancel, setOrderToCancel] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0]; // Animation fade

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
    return () => {
      mounted = false;
    };
  }, [userId]);

  // Animation cho modal
  const showCancelModal = (orderId) => {
    setOrderToCancel(orderId);
    setCancelModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideCancelModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setCancelModalVisible(false));
  };

  const showResultModal = (message) => {
    setResultMessage(message);
    setResultModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setTimeout(hideResultModal, 2000); // Tự động đóng sau 2 giây
  };

  const hideResultModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setResultModalVisible(false));
  };
  // Hủy đơn hàng
  const confirmCancelOrder = useCallback(async () => {
    try {
      const response = await axios.put(`${API_URLS.ANDROID}/orders/${orderToCancel}`, {
        status: "failed",
      });
      if (response.status === 200) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderToCancel ? { ...order, status: "failed" } : order
          )
        );
        hideCancelModal();
        showResultModal("Đơn hàng đã được hủy thành công!")
      }
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error.response?.data || error.message);
      hideCancelModal();
      showResultModal("Không thể hủy đơn hàng. Vui lòng thử lại!");
    }
  }, [orderToCancel]);


  const orderCounts = useMemo(
    () => ({
      Pending: orders.filter((o) => o.status === "Pending").length,
      Shipped: orders.filter((o) => o.status === "Shipped").length,
      Completed: orders.filter((o) => o.status === "Completed").length,
      failed: orders.filter((o) => o.status === "failed").length,
    }),
    [orders]
  );

  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status === selectedStatus &&
          (selectedPayment === "all" ||
            order.paymentMethod.toLowerCase() === selectedPayment.toLowerCase())
      ),
    [orders, selectedStatus, selectedPayment]
  );

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
          <OrderList orders={filteredOrders} onShowCancelModal={showCancelModal} />
        </View>

        {/* Modal xác nhận hủy đơn hàng với animation */}
        <Modal transparent={true} visible={cancelModalVisible} onRequestClose={hideCancelModal}>
          <View style={styles.popupOverlay}>
            <Animated.View style={[styles.popupContainer, { opacity: fadeAnim }]}>
              <Text style={styles.popupTitle}>Xác nhận hủy đơn hàng</Text>
              <Text style={styles.popupMessage}>
                Bạn có chắc muốn hủy đơn hàng này không?
              </Text>
              <View style={styles.popupButtons}>
                <TouchableOpacity
                  onPress={confirmCancelOrder}
                  style={[styles.popupButton, { backgroundColor: "#28A745" }]}
                >
                  <Text style={styles.popupButtonText}>Có</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={hideCancelModal}
                  style={[styles.popupButton, { backgroundColor: "#DC3545" }]}
                >
                  <Text style={styles.popupButtonText}>Không</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>

        <Modal transparent={true} visible={resultModalVisible} onRequestClose={hideResultModal}>
          <View style={styles.popupOverlay}>
            <Animated.View
              style={[
                styles.popupContainer,
                {
                  opacity: fadeAnim,
                  backgroundColor: resultMessage.includes("thành công") ? "#28A745" : "#DC3545",
                },
              ]}
            >
              <Text style={[styles.popupTitle, { color: "white" }]}>{resultMessage}</Text>
            </Animated.View>
          </View>
        </Modal>
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
  orderBox: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
    marginBottom: 15,
  },
  orderText: { fontSize: 16, marginVertical: 2 },
  cancelButton: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "#DC3545",
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  section: { paddingHorizontal: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
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