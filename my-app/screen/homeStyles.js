import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    textStyle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10
    },
    appBar: {
        flexDirection:"row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: "#f2f2f2",
    },
    location: {
        fontWeight: "bold",
        fontSize: 18
    },
    userName:{
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 5
    }
})

export default styles;