import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", 
    paddingVertical: 8, 
  },
  headerTitle: {
    fontFamily: "semibold",
    fontSize: 20, 
    color: "#333", 
  },
  iconButton: {
    padding: 10,
    borderRadius: 10, 
    backgroundColor: "#F5F5F5", 
  },
});

export default styles;
