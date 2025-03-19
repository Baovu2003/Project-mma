import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // Đảm bảo nền trắng để tránh bị mờ các phần tử
  },

  upperRow: {
    marginTop:50,
    position: "absolute",
    top: 10,
    left: 20,
    right: 20, 
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 999,
  },

  image: {
    width: width * 0.99, 
    aspectRatio: 1, 
    resizeMode: "cover",
    borderRadius: 15,
    alignSelf: "center", // Căn giữa ảnh
  },

  details: {
    marginTop: 15,
    width: width * 0.95, // Hạn chế tràn ra ngoài, giữ khoảng cách hai bên
    alignSelf: "center", // Căn giữa trong màn hình
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Bóng đổ cho Android
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10, // Tạo khoảng cách với phần dưới
  },

  ratingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%", // Sử dụng 100% thay vì `width - 10`
  },

  rating: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap:5
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flexShrink: 1, // ✅ Để tránh bị tràn chữ
  },

  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E63946",
    paddingVertical: 5, // ✅ Giúp giá tiền không bị dính vào cạnh
  },
  descriptionWrapper: {
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  
  description: {
    fontFamily: "medium",
    fontSize: 20,
    fontWeight: "bold", 
    color: "#333", 
    fontStyle: "italic",

  },
  descText: {
    fontFamily: "regular",
    fontSize: 16, 
    lineHeight: 24, // ✅ Tăng khoảng cách dòng cho dễ đọc
    textAlign: "justify", // ✅ Căn chỉnh đều hai bên để đẹp hơn
    marginBottom: 5, // ✅ Thêm khoảng cách với nội dung mô tả
},

cartRow: {
    marginBottom:"10%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: width - 10, // ✅ Giảm chiều rộng để tránh sát mép
    paddingHorizontal: 10, // ✅ Thêm padding ngang 
    paddingTop: 10,
  },
  
  cartBtn: {
    backgroundColor: "#E63946",
    paddingVertical: 12, // ✅ Tăng chiều cao nút bấm
    paddingHorizontal: 20, // ✅ Làm nút rộng hơn để dễ bấm
    borderRadius: 8, 
    justifyContent: "center",
    alignItems: "center",
    flex: 1, 
    marginRight: 10, 
  },
  
  addCart: {
    backgroundColor: "#2A9D8F",
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flex: 1, 
  },
  
  cartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  
  
});

export default styles;
