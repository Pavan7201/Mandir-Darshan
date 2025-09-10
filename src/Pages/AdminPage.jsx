import { useState, useContext, useEffect, useRef } from "react";
import { AuthContext } from "../AuthContext";
import Lottie from "lottie-react";
import loading from "../loader/loading data.json";
import "../css/AdminPage.css";

const AdminForm = () => {
  const { token } = useContext(AuthContext);

  const [templeItem, setTempleItem] = useState({
    id: "",
    name: "",
    image: "",
    location: { district: "", state: "" },
    deity: "",
    caption: "",
    hours: "",
    link: "",
  });

  const [status, setStatus] = useState("");
  const [templesCount, setTemplesCount] = useState(0);
  const [fetchedTemples, setFetchedTemples] = useState([]);
  const [loadingTemple, setLoadingTemple] = useState(false);
  const [updatingInfo, setUpdatingInfo] = useState(false);
  const [updatingImage, setUpdatingImage] = useState(false); 
  const debounceRef = useRef(null);

  const API_BASE_URL =
    import.meta.env.MODE === "production"
      ? "https://mandir-darshan.onrender.com"
      : "http://localhost:4000";

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/assets`);
        const data = await res.json();
        const templeCategory = data.find((t) => t.category === "temple");
        setTemplesCount(templeCategory ? templeCategory.items.length : 0);
      } catch (err) {
        console.error("Error fetching temples count:", err);
      }
    };
    fetchCount();
  }, [API_BASE_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "district" || name === "state") {
      setTempleItem((prev) => ({
        ...prev,
        location: { ...prev.location, [name]: value },
      }));
      return;
    }

    setTempleItem((prev) => ({ ...prev, [name]: value }));

    if (name === "id") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (value.trim() === "") {
        setFetchedTemples([]);
        return;
      }
      debounceRef.current = setTimeout(() => {
        fetchTemplesById(value.trim(), true);
      }, 1000);
    }
  };

const fetchTemplesById = async (id, showLoading = true) => {
  if (showLoading) setLoadingTemple(true);
  try {
    const res = await fetch(`${API_BASE_URL}/api/assets`);
    const data = await res.json();
    const templeCategory = data.find((t) => t.category === "temple");
    const matches = templeCategory?.items.filter((item) => item.id === id) || [];

    setFetchedTemples(matches);
    setTempleItem(
      matches[0] || {
        id,
        name: "",
        image: "",
        location: { district: "", state: "" },
        deity: "",
        caption: "",
        hours: "",
        link: "",
      }
    );
  } catch (err) {
    console.error("Error fetching temple by ID:", err);
  } finally {
    if (showLoading) setLoadingTemple(false);
  }
};

  const handleUpdateOrAdd = async () => {
    if (!token) {
      alert("Admin not logged in!");
      return;
    }
    setUpdatingInfo(true); 
    const isNew = fetchedTemples.length === 0;

    try {
      const endpoint = `${API_BASE_URL}/api/assets/temple/${templeItem.id}`;
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...templeItem, location: templeItem.location }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update/add temple info");

      setStatus(isNew ? "Temple added successfully!" : "Temple info updated successfully!");
      fetchTemplesById(templeItem.id, false);
    } catch (err) {
      console.error(err);
      setStatus(isNew ? "Error adding temple" : "Error updating temple info");
    } finally {
      setUpdatingInfo(false);
      setTimeout(() => setStatus(""), 3000);
    }
  };

  const handleUpdateImage = async () => {
    if (!token) {
      alert("Admin not logged in!");
      return;
    }
    if (!templeItem.id || !templeItem.image) {
      setStatus("Temple ID and Image URL are required!");
      return;
    }
    setUpdatingImage(true); 
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/assets/temple/${templeItem.id}/image`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ image: templeItem.image }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update image");

      setStatus("Temple image updated successfully!");
      fetchTemplesById(templeItem.id, false);
    } catch (err) {
      console.error(err);
      setStatus("Error updating temple image");
    } finally {
      setUpdatingImage(false); 
      setTimeout(() => setStatus(""), 3000);
    }
  };

  const handleClear = () => {
    if (updatingInfo || updatingImage) return;
    setTempleItem({
      id: "",
      name: "",
      image: "",
      location: { district: "", state: "" },
      deity: "",
      caption: "",
      hours: "",
      link: "",
    });
    setFetchedTemples([]);
    setStatus("");
  };

  return (
    <section className="admin-form-section">
      <div className="admin-form-container">
        <div className="admin-form-header">
          <h2>Update/Add Temple Data</h2>
          <p className="temple-count">Total Temples Data: {templesCount}</p>
        </div>

        <div className="admin-form-main">
          {loadingTemple ? (
            <div className="loading-animation">
              <Lottie loop animationData={loading} play />
            </div>
          ) : fetchedTemples.length > 0 ? (
            fetchedTemples.map((temple, idx) => (
              <div key={idx} className="temple-preview-card">
                <div className="image-wrapper">
                  {temple.image ? (
                    <img src={temple.image} alt={temple.name} />
                  ) : (
                    <div className="temple-preview-placeholder">No Image</div>
                  )}
                </div>
                <div className="temple-info">
                  <h3>{temple.name}</h3>
                  <p>
                    <strong>Location:</strong>{" "}
                    {temple.location
                      ? `${temple.location.district}, ${temple.location.state}`
                      : ""}
                  </p>
                  <p>
                    <strong>Deity:</strong> {temple.deity}
                  </p>
                  <p>
                    <strong>Hours:</strong> {temple.hours}
                  </p>
                  <p>
                    <strong>Caption:</strong> {temple.caption}
                  </p>
                  {status && <h2 className="status">{status}</h2>}
                </div>
              </div>
            ))
          ) : (
            <div className="temple-preview-placeholder">
              Temple preview will appear here
            </div>
          )}
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="admin-form-grid">
          <input type="text" name="id" placeholder="ID" value={templeItem.id} onChange={handleChange} required />
          <input type="text" name="name" placeholder="Temple Complete Name" value={templeItem.name} onChange={handleChange} required />
          <input type="text" name="district" placeholder="District" value={templeItem.location.district} onChange={handleChange} required />
          <input type="text" name="state" placeholder="State" value={templeItem.location.state} onChange={handleChange} required />
          <input type="text" name="deity" placeholder="Deity" value={templeItem.deity} onChange={handleChange} required />
          <input type="text" name="caption" placeholder="Caption" value={templeItem.caption} onChange={handleChange} />
          <input type="text" name="hours" placeholder="Visiting Hours" value={templeItem.hours} onChange={handleChange} required />
          <input type="text" name="link" placeholder="Link" value={templeItem.link} onChange={handleChange} required />
          <input type="text" name="image" placeholder="Image URL" value={templeItem.image} onChange={handleChange} />
          <div className="button-wrapper">
            <button
              type="button"
              onClick={handleUpdateOrAdd}
              className="update-btn"
              disabled={updatingInfo || updatingImage}
            >
              {updatingInfo
                ? "Updating..."
                : fetchedTemples.length === 0
                  ? "Add Data"
                  : "Update Info"}
            </button>

            <button
              type="button"
              onClick={handleUpdateImage}
              className="update-btn"
              disabled={updatingInfo || updatingImage}
            >
              {updatingImage ? "Updating..." : "Update Image"}
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="clear-btn"
              disabled={updatingInfo || updatingImage}
            >
              Clear Fields
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default AdminForm;