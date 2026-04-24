// Access environment variables injected by AdminJS config
const adminEnv = (typeof window !== 'undefined' && window.AdminJS && window.AdminJS.env) || {};

// Local backend URL for development — change to production URL when deploying
const LOCAL_API = "https://vimal-jewwels-backend-q7iv.onrender.com/api/";
const LOCAL_BACKEND = "https://vimal-jewwels-backend-q7iv.onrender.com";

// Use AdminJS injected env first, then explicit local default
export const serverUrlApi = adminEnv.REACT_APP_API_URL || LOCAL_API;
const normalizedBackendBase = (adminEnv.REACT_APP_BACKEND_URL || LOCAL_BACKEND).replace(/\/$/, "");
export const serverUrlImage = adminEnv.REACT_APP_BACKEND_URL
    ? `${normalizedBackendBase}/images/`
    : `${LOCAL_BACKEND}/images/`;
