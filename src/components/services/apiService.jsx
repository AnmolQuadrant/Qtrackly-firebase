// apiService.jsx
import axios from "axios";

const apiRequest = async (method, endpoint, token, data = null) => {
  try {
    const config = {
      method,
      url: `https://qtrackly-awd6egbkg8dbaeex.centralindia-01.azurewebsites.net${endpoint}`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data,
    };
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw new Error(`API error: ${error.response?.status} - ${error.response?.statusText || error.message}`);
  }
};

export const testApiConnection = async (token) => {
  return apiRequest("GET", "/api/auth/me", token);
};

export const saveUserProfile = async (token) => {
  return apiRequest("GET", "/api/user/profile", token);
};

export { apiRequest }; 