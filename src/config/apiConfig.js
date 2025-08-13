const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:4000"
    : "https://mandir-darshan.onrender.com";

export default API_BASE_URL;
