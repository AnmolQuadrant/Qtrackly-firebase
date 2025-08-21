// msalConfig.js
import { PublicClientApplication } from "@azure/msal-browser";

export const msalConfig = {
  auth: {
    clientId: "76064fb0-a595-4e08-8f74-48fdd4bcd5d0",
    authority: "https://login.microsoftonline.com/0eadb77e-42dc-47f8-bbe3-ec2395e0712c",
    redirectUri: "https://qtrackly-fbf5d-22ea3.web.app",
    

  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["User.Read", "api://4a8ac758-c6bb-408f-8fdc-03e0a8bf72e9/QTask_Backend"],
};

export const apiRequest = {
  scopes: ["api://4a8ac758-c6bb-408f-8fdc-03e0a8bf72e9/QTask_Backend"],
};

export const graphRequest = {
  scopes: ["User.Read"],
};

export const msalInstance = new PublicClientApplication(msalConfig);