import React from 'react';
import { View, Dimensions, StyleSheet, Image } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

const { width } = Dimensions.get('window');

const slides = [
  "https://img.pikbest.com/wp/202346/coffee-bean-black-cup-with-beans-on-blue-background-3d-rendered-image_9716530.jpg!w700wp",
  "https://img.pikbest.com/origin/10/06/52/044pIkbEsTGic.png!w700wp",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRguUekMrDje6UzsOVU--2sg6CLvUxWshix072ZxXAMUVDSLZsKJGZg30ArgCNsImZqgKo&usqp=CAU"
];

const MyCarousel = () => {
  return (
    <View style={styles.container}>
      <Carousel
        loop
        width={width * 0.9}
        height={300}
        autoPlay={true}
        data={slides}
        scrollAnimationDuration={1000}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image 
              source={{ uri: item }} 
              style={styles.image} 
            />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  slide: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },

    image: {
      width: '100%',
      height: '100%',
      borderRadius: 25,
      resizeMode: 'cover',  // Giúp ảnh vừa với khung mà không bị méo
      borderWidth: 2,       // Thêm viền cho ảnh
      borderColor: '#ddd',  // Màu viền nhạt
      shadowColor: '#000',  // Tạo bóng cho ảnh
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,         // Hiệu ứng bóng trên Android
    },

  
});

export default MyCarousel;
