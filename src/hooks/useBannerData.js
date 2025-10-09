import { useState, useEffect } from "react";
const TEMPLE_BANNER_INDEX = 2;

export const useBannerData = () => {

  const [banner, setBanner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBanner = async () => {

      setIsLoading(true);
      setError(null);

      try {
        const cachedAssets = sessionStorage.getItem("assets");
        let data;

        if (cachedAssets) {
          data = JSON.parse(cachedAssets);
        } else {
          const res = await fetch(
            import.meta.env.MODE === "production"
              ? "https://mandir-darshan.onrender.com/api/assets"
              : "http://localhost:4000/api/assets"
          );
          if (!res.ok) throw new Error("Network response was not ok");
          data = await res.json();
          sessionStorage.setItem("assets", JSON.stringify(data));
        }

        const bannerCategory = data.find((b) => b.category === "Banner");
        if (bannerCategory && bannerCategory.items?.[TEMPLE_BANNER_INDEX]) {
          setBanner(bannerCategory.items[TEMPLE_BANNER_INDEX]);
        } else {
          throw new Error("Temple banner data not found in assets.");
        }
      } catch (err) {
        console.error("Error in useBannerData hook:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanner();
  }, []);

  return { banner, isLoading, error };
};