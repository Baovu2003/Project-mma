import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginLeft: 12,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Căn giữa theo chiều dọc
    paddingVertical: 8, // Thêm padding để thoáng hơn
  },
  headerTitle: {
    fontFamily: "semibold",
    fontSize: 20, // Tăng size chữ để nổi bật
    color: "#333", // Dùng màu tối hơn cho readability
  },
  iconButton: {
    padding: 10, // Thêm padding để dễ bấm
    borderRadius: 10, // Bo góc nhẹ cho đẹp
    backgroundColor: "#F5F5F5", // Màu nền nhẹ để icon nổi bật
  },
});

export default styles;
