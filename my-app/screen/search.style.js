import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
    searchContainer: {
    
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      width: "90%",
      backgroundColor: "#03DAC6",
      alignSelf: "center",
      borderRadius: 25,
      marginTop: 20,
      marginBottom: 20,
  },
  
    searchIcon: {
      color: "gray",
      fontSize: 24,
      paddingLeft:5,
      
    },
    searchWrapper: {
      flex: 1,
      borderRadius: 25,
      paddingHorizontal: 15,
    },
    searchInput: {
      height: 50,
      fontSize: 16,
      fontSize: 16,
      outlineStyle: "none", // 🟢 Loại bỏ border mặc định trên web
      borderWidth: 0, // 🟢 Loại bỏ border mặc định trên mobile
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