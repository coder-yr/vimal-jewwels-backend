// Access environment variables injected by AdminJS config
const adminEnv = (typeof window !== 'undefined' && window.AdminJS && window.AdminJS.env) || {};

// Local backend URL for development — change to production URL when deploying
const LOCAL_API = "https://backend.vimaljewellers.com/api/";
const LOCAL_BACKEND = "https://backend.vimaljewellers.com";

// Use AdminJS injected env first, then explicit local default
export const serverUrlApi = adminEnv.REACT_APP_API_URL || LOCAL_API;
export const serverUrlImage = adminEnv.REACT_APP_BACKEND_URL
    ? `${adminEnv.REACT_APP_BACKEND_URL}/images/`
    : `${LOCAL_BACKEND}/images/`;
