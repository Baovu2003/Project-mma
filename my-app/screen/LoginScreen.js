import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URLS from "../helpers/config";
import SuccessAlert from "../helpers/SuccessAlert";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSuccess, setShowSuccess] = useState(false); // State để hiển thị SuccessAlert
  const navigation = useNavigation();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          navigation.replace("Main");
        }
      } catch (err) {
        console.log("Error checking login status:", err);
      }
    };
    checkLoginStatus();
  }, []);

  const handleLogin = () => {
    const user = { email, password };

    axios
      .post(`${API_URLS.ANDROID}/login`, user)
      .then(async (response) => {
        const { accessToken, refreshToken, username } = response.data;
        await AsyncStorage.setItem("authToken", accessToken);
        await AsyncStorage.setItem("refreshToken", refreshToken);
        if (username) await AsyncStorage.setItem("username", username);

        setShowSuccess(true); // Hiển thị SuccessAlert

        // Sau 3 giây, chuyển hướng sang Main
        setTimeout(() => {
          navigation.navigate("Main");
        }, 3000);
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.message || "Login failed";
        alert(errorMessage);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
        }}
      >{
        showSuccess &&  <SuccessAlert
        message="Login successful!"
        onClose={() => setShowAlert(false)}
      />
      }
       
      </View>

      <View>
        <Image
          style={styles.image}
          source={{
            uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSB9XX0UBRXvKywMCk-4wIfmivIBmkFyEf9coqrtMp92BoEUmEmBKMBbnVa8o82GeSuOdM&usqp=CAU",
          }}
        />
      </View>

      <KeyboardAvoidingView>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.title}>Login In to your Account</Text>
        </View>

        <View>
          <View style={styles.inputContainer}>
            <MaterialIcons
              style={styles.icon}
              name="email"
              size={24}
              color="gray"
            />
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholder="Enter your Email"
            />
          </View>
        </View>

        <View style={{ marginTop: 10 }}>
          <View style={styles.inputContainer}>
            <AntDesign
              name="lock1"
              size={24}
              color="gray"
              style={styles.icon}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              placeholder="Enter your Password"
            />
          </View>
        </View>

        <View style={styles.forgotPasswordContainer}>
          <Text>Keep me logged in</Text>
          <Text style={styles.forgotPassword}>Forgot Password</Text>
        </View>

        <Pressable onPress={handleLogin} style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Login</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("RegisterScreen")}
          style={{ marginTop: 15 }}
        >
          <Text style={styles.signupText}>Don't have an account? Sign Up</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
  },
  image: {
    width: 300,
    height: 200,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
    margin: 10,
    marginTop: 30,
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#041E42",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D0D0D0",
    paddingVertical: 5,
    borderRadius: 5,
    marginTop: 30,
  },
  icon: {
    marginLeft: 8,
  },
  input: {
    color: "gray",
    marginVertical: 10,
    width: 300,
    fontSize: 16,
  },
  forgotPasswordContainer: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  forgotPassword: {
    color: "#007FFF",
    fontWeight: "500",
  },
  loginButton: {
    width: 200,
    backgroundColor: "#FEBE10",
    borderRadius: 6,
    marginLeft: "auto",
    marginRight: "auto",
    padding: 15,
    marginTop: 50,
  },
  loginButtonText: {
    textAlign: "center",
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupText: {
    textAlign: "center",
    color: "gray",
    fontSize: 16,
  },
});
