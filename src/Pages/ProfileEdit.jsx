import { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";
import Lottie from "lottie-react";
import successAnimation from "../loader/Success.json";
import "../css/ProfileEdit.css";
import womenAvatar from "../assets/woman.png";
import menAvatar from "../assets/boy.png";

const ProfileEdit = () => {
  const { user, editProfile, loading } = useContext(AuthContext);
  const fileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    mobile: "",
    gender: "",
    avatarFile: null,
    avatarPreview: "",
  });

  const [message, setMessage] = useState({ error: "", success: "" });
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const showMessage = (type, text) => {
    if (type === "error") {
      setMessage({ error: text, success: "" });
      setTimeout(() => {
        setMessage({ error: "", success: "" });
      }, 2000);
    } else {
      setMessage({ error: "", success: text });
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        middleName: user.middleName || "",
        lastName: user.lastName || "",
        mobile: user.mobile || "",
        gender: user.gender || "",
        avatarFile: null,
        avatarPreview: user.avatar || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage({ error: "", success: "" });
  };

  const handleRemoveAvatar = async () => {
    if (formData.avatarFile) {
      setFormData((prev) => ({
        ...prev,
        avatarFile: null,
        avatarPreview: "",
      }));
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    try {
      const payload = { removeAvatar: true };
      await editProfile(payload);

      setFormData((prev) => ({
        ...prev,
        avatarFile: null,
        avatarPreview: "",
      }));
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      showMessage("error", err?.message || "Failed to remove avatar");
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showMessage("error", "Invalid image file");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      avatarFile: file,
      avatarPreview: URL.createObjectURL(file),
    }));
    setMessage({ error: "", success: "" });
  };

  const hasChanges = () => {
    if (!user) return false;
    return (
      formData.firstName !== user.firstName ||
      formData.middleName !== user.middleName ||
      formData.lastName !== user.lastName ||
      formData.mobile !== user.mobile ||
      formData.gender !== user.gender ||
      formData.avatarFile
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasChanges()) {
      showMessage("error", "No changes detected");
      return;
    }

    setIsSaving(true);
    const payload = {
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      mobile: formData.mobile,
      gender: formData.gender,
    };

    try {
      if (formData.avatarFile) {
        const fd = new FormData();
        fd.append("avatar", formData.avatarFile);
        fd.append("firstName", formData.firstName);
        fd.append("middleName", formData.middleName);
        fd.append("lastName", formData.lastName);
        fd.append("mobile", formData.mobile);
        fd.append("gender", formData.gender);
        await editProfile(fd, true);
      } else {
        await editProfile(payload);
      }

      setShowSuccessAnimation(true);
      setMessage({ success: "Profile updated successfully", error: "" });
      setFormData((prev) => ({
        ...prev,
        avatarFile: null,
      }));
      if (fileRef.current) fileRef.current.value = "";

      setTimeout(() => {
        const from = location.state?.from || "/";
        navigate(from);
      }, 3500);
    } catch (err) {
      showMessage("error", err?.message || "Profile update failed");
    } finally {
      setIsSaving(false);
    }
  };

  const getDefaultAvatar = (gender) => (gender === "female" ? womenAvatar : menAvatar);

  return (
    <form className="pe-form" onSubmit={handleSubmit} noValidate>
      {showSuccessAnimation ? (
        <div className="success-animation-container">
          <Lottie loop={false} animationData={successAnimation} play />
          <p className="pe-success">{message.success}</p>
        </div>
      ) : (
        <>
          <h2 className="pe-title">Edit Profile</h2>
          <div className="pe-avatar">
            <img
              src={formData.avatarPreview || getDefaultAvatar(formData.gender)}
              alt="Avatar"
              className="pe-avatar-img"
            />
            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
            <button
              type="button"
              className="pe-avatar-edit"
              onClick={() => fileRef.current && fileRef.current.click()}
            >
              <FontAwesomeIcon icon={faPencilAlt} />
            </button>
            {!showSuccessAnimation && formData.avatarPreview && !formData.avatarFile && (
              <button type="button" className="pe-avatar-remove" onClick={handleRemoveAvatar}>
                <FontAwesomeIcon icon={faTrashCan} />
              </button>
            )}
          </div>

          <div className="pe-row">
            <label className="pe-label">
              First Name
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} />
            </label>
            <label className="pe-label">
              Middle Name
              <input type="text" name="middleName" value={formData.middleName} onChange={handleChange} />
            </label>
            <label className="pe-label">
              Last Name
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} />
            </label>
          </div>

          <div className="pe-row">
            <label className="pe-label">
              Mobile
              <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} />
            </label>
            <div className="pe-label">
              Gender
              <div className="pe-gender-options">
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === "male"}
                    onChange={handleChange}
                  />{" "}
                  Male
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === "female"}
                    onChange={handleChange}
                  />{" "}
                  Female
                </label>
              </div>
            </div>
          </div>

          {message.error && <p className="pe-error">{message.error}</p>}

          <div className="pe-btn-row">
            <button type="submit" className="pe-btn" disabled={loading || isSaving}>
              {loading || isSaving ? "Updating..." : "Update"}
            </button>
          </div>
        </>
      )}
    </form>
  );
};

export default ProfileEdit;
