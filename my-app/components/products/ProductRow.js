import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { addToCart } from "../../redux/CartReducer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { validateToken } from "../../helpers/validate-token";
const ProductRow = ({ item }) => {
  const [addedToCart, setAddedToCart] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation(); // Khởi tạo hook navigation
  const addItemToCart = async (item) => {
    const isValidToken = await validateToken();
  if (!isValidToken) {
    await AsyncStorage.removeItem("authToken");
    navigation.navigate("LoginScreen"); 
    return;
  }
    setAddedToCart(true);
    dispatch(addToCart({ ...item, quantity: 1 }));
    setTimeout(() => {
      setAddedToCart(false);
    }, 60000);
  };
  
  const cart = useSelector((state) => state.cart.cart);

  return (
    <Pressable style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.navigate("ProductDetail", { item })}
      >
        <Image style={styles.image} source={{ uri: item?.imageUrl }} />
      </TouchableOpacity>

      {/* Tên và Giá trên cùng một hàng */}
      <View style={styles.infoRow}>
        <Text numberOfLines={1} style={styles.name}>
          {item?.name}
        </Text>
        <Text style={styles.price}>{item?.price.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        })}</Text>
      </View>

      <Pressable onPress={() => addItemToCart(item)} style={styles.button}>
        {addedToCart ? <Text>Added to Cart</Text> : <Text>Add to Cart</Text>}
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
  },
  image: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    borderRadius: 10,
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: "bold",
  },
  price: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ff5733",
    marginLeft: 10,
  },
  button: {
    backgroundColor: "#FFC72C",
    padding: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
});

export default ProductRow;
