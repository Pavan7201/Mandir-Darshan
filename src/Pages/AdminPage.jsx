import { useState, useContext, useEffect, useRef } from "react";
import { AuthContext } from "../AuthContext";
import "../css/AdminPage.css";

const AdminForm = () => {
  const { token } = useContext(AuthContext);

  const [templeItem, setTempleItem] = useState({
    id: "",
    name: "",
    image: "",
    location: "",
    deity: "",
    caption: "",
    hours: "",
    link: "",
  });

  const [status, setStatus] = useState("");
  const [templesCount, setTemplesCount] = useState(0);
  const [fetchedTemple, setFetchedTemple] = useState(null);
  const [preview, setPreview] = useState(null);

  const debounceRef = useRef(null);
  const fileInputRef = useRef(null);

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
    setTempleItem((prev) => ({ ...prev, [name]: value }));
    if (name === "id") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (value.trim() === "") {
        setFetchedTemple(null);
        return;
      }
      debounceRef.current = setTimeout(() => {
        fetchTempleById(value.trim());
      }, 1000);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempleItem((prev) => ({ ...prev, image: reader.result }));
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchTempleById = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/assets`);
      const data = await res.json();
      const templeCategory = data.find((t) => t.category === "temple");
      const found = templeCategory?.items.find((item) => item.id === id);
      if (found) {
        setTempleItem(found);
        setFetchedTemple(found);
      } else {
        setTempleItem({
          id,
          name: "",
          image: "",
          location: "",
          deity: "",
          caption: "",
          hours: "",
          link: "",
        });
        setFetchedTemple(null);
      }
    } catch (err) {
      console.error("Error fetching temple by ID:", err);
    }
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("Admin not logged in!");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/assets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: "temple",
          items: [templeItem],
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update temple info");
      setStatus("Temple info updated successfully!");
      setFetchedTemple(templeItem);
      setTemplesCount((prev) => prev + (fetchedTemple ? 0 : 1));
    } catch (err) {
      console.error(err);
      setStatus("Error updating temple info");
    }
  };

  const handleUpdateImage = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("Admin not logged in!");
      return;
    }
    if (!templeItem.id) {
      setStatus("Temple ID is required to update image!");
      return;
    }
    if (!templeItem.image) {
      setStatus("Please select an image before updating!");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/assets/temple/${templeItem.id}/image`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ image: templeItem.image }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update image");
      setStatus("Temple image updated successfully!");
      setFetchedTemple({ ...fetchedTemple, image: templeItem.image });
      setPreview(null); // clear the upload box back to plus
      setTempleItem((prev) => ({ ...prev, image: "" }));
    } catch (err) {
      console.error(err);
      setStatus("Error updating temple image");
    }
  };

  const handleClear = () => {
    setTempleItem({
      id: "",
      name: "",
      image: "",
      location: "",
      deity: "",
      caption: "",
      hours: "",
      link: "",
    });
    setFetchedTemple(null);
    setStatus("");
    setPreview(null);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="admin-form-container">
      <h2>Update Temple Data (Category: Temple)</h2>
      <p className="temple-count">Total Temples Data: {templesCount}</p>

      {fetchedTemple && (
        <div className="temple-preview-card">
          {fetchedTemple.image ? (
            <img src={fetchedTemple.image} alt={fetchedTemple.name} />
          ) : (
            <div className="no-image">No Image Available</div>
          )}
          <div className="temple-info">
            <h3>{fetchedTemple.name}</h3>
            <p><strong>Location:</strong> {fetchedTemple.location}</p>
            <p><strong>Deity:</strong> {fetchedTemple.deity}</p>
            <p><strong>Hours:</strong> {fetchedTemple.hours}</p>
            <p><strong>Caption:</strong> {fetchedTemple.caption}</p>
          </div>
        </div>
      )}

      <div className="image-upload-box" onClick={triggerFileInput} style={{ cursor: "pointer" }}>
        {preview ? (
          <img src={preview} alt="Preview" />
        ) : (
          <div className="plus-icon">+</div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="admin-form-grid">
        <input
          type="text"
          name="id"
          placeholder="ID"
          value={templeItem.id}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="name"
          placeholder="Temple Complete Name"
          value={templeItem.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="location"
          placeholder="Temple Location"
          value={templeItem.location}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="deity"
          placeholder="Deity"
          value={templeItem.deity}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="caption"
          placeholder="Caption"
          value={templeItem.caption}
          onChange={handleChange}
        />
        <input
          type="text"
          name="hours"
          placeholder="Visiting Hours"
          value={templeItem.hours}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="link"
          placeholder="Link"
          value={templeItem.link}
          onChange={handleChange}
          required
        />
        <div className="button-wrapper">
          <button type="button" onClick={handleUpdateInfo} className="update-btn">
            Update Info
          </button>
          <button type="button" onClick={handleUpdateImage} className="update-btn">
            Update Image
          </button>
          <button type="button" onClick={handleClear} className="clear-btn">
            Clear Fields
          </button>
        </div>
      </form>

      {status && <p className="status">{status}</p>}
    </div>
  );
};

export default AdminForm;
