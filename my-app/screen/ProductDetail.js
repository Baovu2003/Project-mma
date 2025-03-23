import React, { useEffect, useState } from "react";
import { 
  View, Text, TouchableOpacity, Image, ScrollView, SafeAreaView, Alert 
} from "react-native";
import { Fontisto, Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import styles from "./productDetail.style";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/CartReducer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { validateToken } from "../helpers/validate-token";
import Headings from "../components/home/Headings";

const ProductDetail = ({ route, navigation }) => {
  const { item } = route.params;
  console.log("cart in ProductDetail:", item);
  const [count, setCount] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.cart);
  console.log("cart in ProductDetail:", cart);
  const [username, setUsername] = useState("");
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const userName = await AsyncStorage.getItem("username");
        setUsername(userName || "Guest"); // Nếu không có username, dùng "Guest"
      } catch (error) {
        console.log("Error fetching username:", error);
      }
    };
    fetchUsername();
  }, []);
  // Xử lý tăng số lượng
  const incrementCount = () => {
    if (count < item.stock) {
      setCount(prevCount => prevCount + 1);
    } else {
      Alert.alert("Stock limit reached", "You cannot add more than available stock.");
    }
  };
  // Xử lý đặt sản phẩm vào mua hàng

  // Xử lý giảm số lượng
  const decrementCount = () => {
    if (count > 1) {
      setCount(prevCount => prevCount - 1);
    }
  };

  // Thêm sản phẩm vào giỏ hàng
  const addItemToCart = async () => {
    const isValidToken = await validateToken();
    if (!isValidToken) {
      await AsyncStorage.removeItem("authToken");
      navigation.navigate("LoginScreen"); 
      return;
    }
    setAddedToCart(true);
    dispatch(addToCart({ ...item, quantity: count })); 
    setTimeout(() => {
      setAddedToCart(false);
    }, 3000); // Giảm thời gian thông báo
  };
  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("username");
    navigation.replace("LoginScreen");
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <Headings username={username} handleLogout={handleLogout} />
        {/* Header */}
        <View style={styles.upperRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-circle" size={30} color="firebrick" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="heart" size={30} color="red" />
          </TouchableOpacity>
        </View>

        {/* Hình ảnh sản phẩm */}
        <Image
          source={{ uri: item.imageUrl || "https://img.pikbest.com/origin/10/06/52/044pIkbEsTGic.png!w700wp" }}
          style={styles.image}
        />

        {/* Thông tin sản phẩm */}
        <View style={styles.details}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{item.name} (Stock: {item.stock})</Text>
            <Text style={styles.price}>${item.price}</Text>
          </View>

          {/* Xếp hạng & Chọn số lượng */}
          <View style={styles.ratingRow}>
            <View style={styles.rating}>
              {[...Array(5)].map((_, index) => (
                <Ionicons key={index} name="star" size={20} color="gold" />
              ))}
              <Text style={styles.ratingText}>(4.5)</Text>
            </View>

            {/* Bộ chọn số lượng */}
            <View style={styles.rating}>
              <TouchableOpacity onPress={decrementCount}>
                <SimpleLineIcons name="minus" size={20} />
              </TouchableOpacity>
              <Text style={styles.ratingText}>{count}</Text>
              <TouchableOpacity onPress={incrementCount}>
                <SimpleLineIcons name="plus" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Mô tả sản phẩm */}
        <View style={styles.descriptionWrapper}>
          <Text style={styles.description}>Description</Text>
          <Text style={styles.descText}>{item.description || "No description available."}</Text>
        </View>
      </ScrollView>

      {/* Nút "Mua ngay" và "Thêm vào giỏ hàng" */}
      <View style={styles.cartRow}>
        <TouchableOpacity style={styles.cartBtn}>
          <Text style={styles.cartTitle}>Buy Now</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={addItemToCart} style={styles.addCart}>
          <Text style={styles.cartTitle}>
            {addedToCart ? "Added to cart" : "Add to cart"} 
            <Fontisto name="shopping-bag" size={24} color="green" />
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProductDetail;
