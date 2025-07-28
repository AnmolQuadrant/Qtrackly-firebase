
// // import axios from "axios";

// // const apiClient = axios.create({
// //   baseURL: process.env.NODE_ENV === "development" 
// //     ? "http://localhost:5181/api" 
// //     : "https://your-production-api.com/api",
// //   headers: { "Content-Type": "application/json" }
// // });

// // export const setupAxiosInterceptors = (acquireToken) => {
// //   apiClient.interceptors.request.use(async (config) => {
// //     try {
// //       const token = await acquireToken("api");
// //       if (!token) {
// //         console.error("❌ No token acquired for request:", {
// //           url: config.url,
// //           method: config.method,
// //         });
// //         throw new Error("Authentication token is missing");
// //       }
// //       config.headers.Authorization = `Bearer ${token}`;
// //       return config;
// //     } catch (error) {
// //       console.error("❌ Error acquiring token:", error.message);
// //       return Promise.reject(error);
// //     }
// //   });

// //   apiClient.interceptors.response.use(
// //     (response) => response,
// //     async (error) => {
// //       const originalRequest = error.config;
// //       if (error.response?.status === 401 && !originalRequest._retry) {
// //         console.warn("⚠️ 401 Unauthorized, retrying with new token...");
// //         originalRequest._retry = true;
// //         try {
// //           const newToken = await acquireToken("api", { forceRefresh: true });
// //           if (!newToken) throw new Error("Failed to refresh token");
// //           originalRequest.headers.Authorization = `Bearer ${newToken}`;
// //           return apiClient(originalRequest);
// //         } catch (refreshError) {
// //           console.error("❌ Token refresh failed:", refreshError.message);
// //           return Promise.reject(refreshError);
// //         }
// //       }
// //       console.error("❌ API request failed:", error.response?.statusText);
// //       return Promise.reject(error);
// //     }
// //   );
// // };

// // export const fetchEncryptionKeys = async () => {
// //   try {
// //     console.debug("Fetching encryption keys...");
// //     const response = await axios.get("http://localhost:5181/api/Encryption/keys");

// //     console.debug("Full API Response:", response);
// //     console.debug("Fetched encryption keys:", response.data);

// //     if (!response.data.aesKey || !response.data.aesIV) {
// //       throw new Error("Invalid or missing encryption keys in response!");
// //     }
// //     //console.log(response.data);
// //     return response.data; // ✅ Correctly returns AES keys
// //   } catch (error) {
// //     console.error("Error fetching encryption keys:", {
// //       message: error.message,
// //       status: error.response?.status,
// //       data: error.response?.data
// //     });

// //     return { aesKey: "", aesIV: "" }; // Prevent crash
// //   }
// // };


// // // export const fetchEncryptionKeys = async () => {
// // //   // try {
// // //   //   const response = await apiClient.get('/Encryption/keys');
// // //   //   console.log("Fetched encryption keys:", response.data);
// // //   //   if (!response.data.AESKey || !response.data.AESIV) {
// // //   //     throw new Error("Invalid or missing encryption keys in response");
// // //   //   }
// // //   //   return response.data; // { AESKey, AESIV }
// // //   // } catch (error) {
// // //   //   console.error("Error fetching encryption keys:", {
// // //   //     message: error.message,
// // //   //     status: error.response?.status,
// // //   //     data: error.response?.data,
// // //   //   });
// // //   //   throw error; // Let caller handle the error
// // //   // }
  
// // //   const res =axios.get("http://localhost:5181/api/Encryption/keys")
// // //   .then((response)=>response.data);
// // //   console.log(res);
// // //   return res;
// // // };

// // export const fetchUsers = async () => {
// //   try {
// //     const response = await axios.get('http://localhost:5181/api/User/users');
// //     console.debug("Fetched users:", response.data);
// //     return response.data; // List of UserDto
// //   } catch (error) {
// //     console.error("Error fetching users:", {
// //       message: error.message,
// //       status: error.response?.status,
// //       data: error.response?.data,
// //     });
// //     throw error;
// //   }
// // };

// // export const submitDependencyRequest = async (payload) => {
// //   //console.log("request form");
// //   try {
// //     // const response = await axios.post('http://localhost:5181/api/User', payload);
// //     console.log(payload);
// //     const response = await axios.post("http://localhost:5181/api/User", payload, {
// //   headers: {
// //     "Content-Type": "application/json",
// //   },
// // });
// //   console.log("request form");
// //     console.debug("Submitted dependency request:", response.data);
// //     return response;
// //   } catch (error) {
// //     console.error("Error submitting dependency request:", {
// //       message: error.message,
// //       status: error.response?.status,
// //       data: error.response?.data,
// //     });
// //     throw error;
// //   }
// // };

// // export default apiClient;


import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NODE_ENV === "development" 
    ? "http://localhost:5181/api" 
    : "https://your-production-api.com/api",
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


