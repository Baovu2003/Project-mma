import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold", // Sửa lại fontFamily không hợp lệ
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
    marginTop: 30,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    backgroundColor: "#03DAC6",
    alignSelf: "center",
    borderRadius: 25,
    marginBottom: 20,
},

  searchIcon: {
    color: "gray",
    fontSize: 24,
    paddingLeft:5
  },
  searchWrapper: {
    flex: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  searchInput: {
    height: 50,
    fontSize: 16,
  },
  searchButton: {
    width: 50,
    height: 50,
    backgroundColor: "#87CEEB",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default styles;
