import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_URLS from "./config";

export const validateToken = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      console.log("Token",token)
  
      if (!token) {
        return false; // Không có token => Chưa đăng nhập
      }
  
      const response = await axios.get(`${API_URLS.ANDROID}/validate-token`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      return response.data.valid; // API trả về `{ valid: true }` nếu hợp lệ
    } catch (error) {
      console.log("Error", error.response?.data || error.message);
      return false;
    }
  };
  
