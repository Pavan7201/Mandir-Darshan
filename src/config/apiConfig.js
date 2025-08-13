const DEV_API_URL = "http://localhost:4000";
const PROD_API_URL = "https://mandir-darshan.onrender.com";

const API_BASE_URL =
  window.location.hostname === "localhost" ? DEV_API_URL : PROD_API_URL;

export default API_BASE_URL;
