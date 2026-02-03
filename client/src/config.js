const isProd = import.meta.env.PROD;
export const API_URL = isProd ? "" : "http://" + window.location.hostname + ":3000";
