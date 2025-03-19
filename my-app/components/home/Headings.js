

import React from "react";
import { View, Text, Pressable } from "react-native";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";

const Headings = ({ username, handleLogout }) => {
  const navigation = useNavigation();
  const cart = useSelector((state) => state.cart.cart);

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "white",
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        zIndex: 1000,
      }}
    >
      <MaterialIcons name="location-on" size={30} color="green" />
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>Hello {username}</Text>
        <Pressable
         onPress={() => navigation.navigate("Cart", { username })}
          style={{ position: "relative", marginLeft: 10 }}
        >
          <AntDesign name="shoppingcart" size={30} color="black" />
          {cart.length > 0 && (
            <View
              style={{
                position: "absolute",
                top: -5,
                right: -5,
                backgroundColor: "red",
                borderRadius: 10,
                width: 18,
                height: 18,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              >
                {cart.length}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
      <Pressable onPress={handleLogout} style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={{ marginRight: 5 }}>Logout</Text>
        <AntDesign name="logout" size={24} color="black" />
      </Pressable>
    </View>
  );
};


export default Headings;
