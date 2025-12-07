import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_URL = "https://informate-production.up.railway.app/api";

// Helper: Build headers
const getHeaders = async (isFormData = false) => {
  const token = await AsyncStorage.getItem("userToken");
  const headers = {
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // JANGAN set Content-Type untuk FormData
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

// Helper: Handle response
const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    const data = await response.json();

    if (!response.ok) {
      // Format error seperti Axios
      throw {
        response: {
          status: response.status,
          data: data,
        },
        message: data.message || "Request failed",
      };
    }

    // Format response seperti Axios: { data: {...} }
    return { data };
  }

  throw new Error("Invalid response format");
};

// API Object (Compatible dengan Axios syntax)
const api = {
  // GET Request
  get: async (url) => {
    console.log("🚀 GET:", API_URL + url);

    try {
      const headers = await getHeaders();
      const response = await fetch(API_URL + url, {
        method: "GET",
        headers,
      });

      console.log("✅ GET Response:", response.status);
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ GET Error:", error);
      throw error;
    }
  },
  // GET all users (for dashboard)
  getUsers: async () => {
    console.log("🚀 GET USERS:", API_URL + "/users");

    try {
      const headers = await getHeaders();
      const response = await fetch(API_URL + "/users", {
        method: "GET",
        headers,
      });

      console.log("✅ GET USERS Response:", response.status);
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ GET USERS Error:", error);
      throw error;
    }
  },

  // POST Request
  post: async (url, data) => {
    console.log("🚀 POST:", API_URL + url);

    try {
      const isFormData = data instanceof FormData;
      const headers = await getHeaders(isFormData);

      const response = await fetch(API_URL + url, {
        method: "POST",
        headers,
        body: isFormData ? data : JSON.stringify(data),
      });

      console.log("✅ POST Response:", response.status);
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ POST Error:", error);
      throw error;
    }
  },

  // PUT Request
  put: async (url, data) => {
    console.log("🚀 PUT:", API_URL + url);

    try {
      const isFormData = data instanceof FormData;
      const headers = await getHeaders(isFormData);

      const response = await fetch(API_URL + url, {
        method: "PUT",
        headers,
        body: isFormData ? data : JSON.stringify(data),
      });

      console.log("✅ PUT Response:", response.status);
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ PUT Error:", error);
      throw error;
    }
  },

  // DELETE Request
  delete: async (url) => {
    console.log("🚀 DELETE:", API_URL + url);

    try {
      const headers = await getHeaders();

      const response = await fetch(API_URL + url, {
        method: "DELETE",
        headers,
      });

      console.log("✅ DELETE Response:", response.status);
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ DELETE Error:", error);
      throw error;
    }
  },
};

export default api;
