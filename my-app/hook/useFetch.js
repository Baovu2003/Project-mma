import { useEffect, useState } from "react";
import axios from "axios";
import API_URLS from "../helpers/config";
const useFetch = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // const response = await axios.get(`${API_URLS.WEB}/products`);
      const response = await axios.get(`${API_URLS.ANDROID}/products`);
      console.log({ response})
      setIsLoading(false);
      setData(response.data.data);
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

 
  useEffect(() => {
    fetchData();
  }, []); // ✅ Chạy 1 lần khi component mount

  const refetch = () => {
    fetchData();
  };

  console.log(data)

  return { data, isLoading, error, refetch }; 
};

export default useFetch;
