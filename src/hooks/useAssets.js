import { useEffect, useState } from "react";

const API_BASE_URL =
  import.meta.env.MODE === "production"
    ? "https://mandir-darshan.onrender.com"
    : "http://localhost:4000";

export function useAssets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cachedAssets = sessionStorage.getItem("assets");

    if (cachedAssets) {
      setAssets(JSON.parse(cachedAssets));
      setLoading(false);
      return;
    }

    const fetchAssets = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/assets`);
        const data = await res.json();
        sessionStorage.setItem("assets", JSON.stringify(data));
        setAssets(data);
      } catch (err) {
        console.error("Error fetching assets:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  return { assets, loading, error };
}
