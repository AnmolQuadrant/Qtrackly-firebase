


import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NODE_ENV === "development" 
    ? "https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api" 
    : "https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net/api",
  headers: { "Content-Type": "application/json" }
});

export const setupAxiosInterceptors = (acquireToken) => {
  apiClient.interceptors.request.use(async (config) => {
    try {
      const token = await acquireToken("api");
      if (!token) {
        console.error("❌ No token acquired for request:", {
          url: config.url,
          method: config.method,
        });
        throw new Error("Authentication token is missing");
      }
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    } catch (error) {
      console.error("❌ Error acquiring token:", error.message);
      return Promise.reject(error);
    }
  });

  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        console.warn("⚠️ 401 Unauthorized, retrying with new token...");
        originalRequest._retry = true;
        try {
          const newToken = await acquireToken("api", { forceRefresh: true });
          if (!newToken) throw new Error("Failed to refresh token");
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error("❌ Token refresh failed:", refreshError.message);
          return Promise.reject(refreshError);
        }
      }
      console.error("❌ API request failed:", error.response?.statusText);
      return Promise.reject(error);
    }
  );
};

// ✅ Use apiClient instead of direct axios
export const fetchEncryptionKeys = async () => {
  try {
    console.debug("Fetching encryption keys...");
    const response = await apiClient.get("/Encryption/keys"); // Use apiClient with relative URL

    console.debug("Full API Response:", response);
    console.debug("Fetched encryption keys:", response.data);

    if (!response.data.aesKey || !response.data.aesIV) {
      throw new Error("Invalid or missing encryption keys in response!");
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching encryption keys:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    return { aesKey: "", aesIV: "" }; // Prevent crash
  }
};

// ✅ Use apiClient instead of direct axios
export const fetchUsers = async () => {
  try {
    const response = await apiClient.get('/User/users'); // Use apiClient with relative URL
    console.debug("Fetched users:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

// ✅ Use apiClient instead of direct axios
export const submitDependencyRequest = async (payload) => {
  try {
    //console.log(payload);
    const response = await apiClient.post("/User", payload); // Use apiClient with relative URL
    //console.log("request form");
    //console.debug("Submitted dependency request:", response.data);
    return response;
  } catch (error) {
    console.error("Error submitting dependency request:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export default apiClient;


