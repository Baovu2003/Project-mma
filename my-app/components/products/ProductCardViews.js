import React from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';
import styles from "./ProductCardViews.style";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

function ProductCardViews({ product }) { // Receive the product prop
  const navigation = useNavigation();

  return (
    <TouchableOpacity onPress={() => navigation.navigate("ProductDetail", { product})}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: product.imageUrl || "https://img.pikbest.com/origin/10/06/52/044pIkbEsTGic.png!w700wp", // Default image if product doesn't have one
            }}
            style={styles.image}
          />
        </View>

        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={1}>{product.name}</Text>
          <Text style={styles.supplier} numberOfLines={1}>{product.supplier}</Text>
          <Text style={styles.price} numberOfLines={1}>${product.price}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={() => {}}>
        <Ionicons name='add-circle' size={35} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default ProductCardViews;
