import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Image,
} from "react-native";
import React from "react";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import {
  cleanCart,
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
} from "../redux/CartReducer";
import { useNavigation } from "@react-navigation/native";
import Home from "./Home";

const CartScreen = () => {
  const cart = useSelector((state) => state.cart.cart);
  console.log(cart);
  const total = cart
    ?.map((item) => item.price * item.quantity)
    .reduce((curr, prev) => curr + prev, 0);
  const dispatch = useDispatch();
  const increaseQuantity = (item) => {
    if (item.quantity < item.stock) {
      dispatch(incrementQuantity(item));
    } else {
      alert("Số lượng sản phẩm đã đạt giới hạn kho!");
    }
  };

  const decreaseQuantity = (item) => {
    dispatch(decrementQuantity(item));
  };
  const deleteItem = (item) => {
    dispatch(removeFromCart(item));
  };
  const clearCart = () => {
    dispatch(cleanCart());
  };

  const navigation = useNavigation();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
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
          style={{ marginRight: 10,flexDirection:"row", alignItems: "center" }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>Back</Text>
        </Pressable>      
      </View>
    {cart.length > 0 ? (
  <>
    {/* Hiển thị tổng tiền */}
    <View style={{ padding: 10, flexDirection: "row", alignItems: "center" }}>
      <Text style={{ fontSize: 18, fontWeight: "400" }}>Subtotal : </Text>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
        {total.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        })}
      </Text>
    </View>

    {/* Nút mua hàng */}
    <Pressable
      onPress={() => navigation.navigate("Confirm")}
      style={{
        backgroundColor: "#FFC72C",
        padding: 10,
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 10,
        marginTop: 10,
      }}
    >
      <Text>Proceed to Buy ({cart.length}) items</Text>
    </Pressable>

    {/* Đường phân cách */}
    <Text
      style={{
        height: 1,
        borderColor: "#D0D0D0",
        borderWidth: 1,
        marginTop: 16,
      }}
    />

    {/* Nút xoá tất cả sản phẩm */}
    <Pressable
      onPress={clearCart}
      style={{
        backgroundColor: "red",
        padding: 10,
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 10,
        marginTop: 10,
      }}
    >
      <Text style={{ color: "white", fontWeight: "bold" }}>Delete All</Text>
    </Pressable>
  </>
) : (
  <View style={{ alignItems: "center", padding: 20 }}>
    <Text style={{ fontSize: 18, fontWeight: "bold", color: "gray" }}>
      Giỏ hàng trống
    </Text>

    {/* Nút Continue Shopping */}
    <Pressable
      onPress={() => navigation.navigate("Home")}
      style={{
        marginTop: 15,
        backgroundColor: "orange",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        shadowColor: "#000",
      }}
    >
      <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
        Continue Shopping
      </Text>
    </Pressable>
  </View>
)}


      <View style={{ marginHorizontal: 10 }}>
        {cart?.map((item, index) => (
          <View
            style={{
              backgroundColor: "white",
              marginVertical: 10,
              borderBottomColor: "#F0F0F0",
              borderWidth: 2,
              borderLeftWidth: 0,
              borderTopWidth: 0,
              borderRightWidth: 0,
            }}
            key={index}
          >
            <Pressable
              style={{
                marginVertical: 10,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Image
                  style={{ width: 140, height: 140, resizeMode: "contain" }}
                  source={{ uri: item?.imageUrl }}
                />
              </View>
              <View>
                <Text numberOfLines={3} style={{ width: 150, marginTop: 10 }}>
                  {item?.name}
                </Text>
                <Text
                  style={{ fontSize: 20, fontWeight: "bold", marginTop: 6 }}
                >
                  {item?.price.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </Text>
                <Image
                  style={{ width: 30, height: 30, resizeMode: "contain" }}
                  source={{
                    uri: "https://assets.stickpng.com/thumbs/5f4924cc68ecc70004ae7065.png",
                  }}
                />
                <Text>
                  <Text style={{ fontWeight: "bold", color: "rgb(124 4 4)" }}>
                    Total:{" "}
                  </Text>
                  {item?.price.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                  {" x "}
                  {item?.quantity}
                  {" = "}
                  <Text style={{ fontWeight: "bold", color: "green" }}>
                    {(item.price * item.quantity).toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </Text>
                </Text>
                <Text style={{ fontWeight: "bold", color: "rgb(124 4 4)" }}>
                  Stock:
                  <Text style={{ color: "green" }}> {item?.stock}</Text>
                </Text>
              </View>
            </Pressable>

            <Pressable
              style={{
                marginTop: 15,
                marginBottom: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 7,
                }}
              >
                {item?.quantity > 1 ? (
                  <Pressable
                    onPress={() => decreaseQuantity(item)}
                    style={{
                      backgroundColor: "#D8D8D8",
                      padding: 7,
                      borderTopLeftRadius: 6,
                      borderBottomLeftRadius: 6,
                    }}
                  >
                    <AntDesign name="minus" size={24} color="black" />
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => deleteItem(item)}
                    style={{
                      backgroundColor: "#D8D8D8",
                      padding: 7,
                      borderTopLeftRadius: 6,
                      borderBottomLeftRadius: 6,
                    }}
                  >
                    <AntDesign name="delete" size={24} color="black" />
                  </Pressable>
                )}

                <Pressable
                  style={{
                    backgroundColor: "white",
                    paddingHorizontal: 18,
                    paddingVertical: 6,
                  }}
                >
                  <Text>{item?.quantity}</Text>
                </Pressable>

                <Pressable
                  onPress={() => increaseQuantity(item)}
                  style={{
                    backgroundColor: "#D8D8D8",
                    padding: 7,
                    borderTopLeftRadius: 6,
                    borderBottomLeftRadius: 6,
                  }}
                >
                  <Feather name="plus" size={24} color="black" />
                </Pressable>
              </View>
              <Pressable
                onPress={() => deleteItem(item)}
                style={{
                  backgroundColor: "white",
                  paddingHorizontal: 8,
                  paddingVertical: 10,
                  borderRadius: 5,
                  borderColor: "#C0C0C0",
                  borderWidth: 0.6,
                }}
              >
                <Text>Delete</Text>
              </Pressable>
            </Pressable>

            <Pressable
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                marginBottom: 15,
              }}
            >
              <Pressable
                style={{
                  backgroundColor: "white",
                  paddingHorizontal: 8,
                  paddingVertical: 10,
                  borderRadius: 5,
                  borderColor: "#C0C0C0",
                  borderWidth: 0.6,
                }}
              >
                <Text>Save For Later</Text>
              </Pressable>

              <Pressable
                style={{
                  backgroundColor: "white",
                  paddingHorizontal: 8,
                  paddingVertical: 10,
                  borderRadius: 5,
                  borderColor: "#C0C0C0",
                  borderWidth: 0.6,
                }}
              >
                <Text>See More Like this</Text>
              </Pressable>
            </Pressable>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default CartScreen;

const styles = StyleSheet.create({});
