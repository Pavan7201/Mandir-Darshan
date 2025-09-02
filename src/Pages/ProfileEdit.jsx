import { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faPencilAlt, faTrashCan } from "@fortawesome/free-solid-svg-icons";
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
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [passwordVisibility, setPasswordVisibility] = useState({ new: false, confirm: false });
  const [message, setMessage] = useState({ error: "", success: "" });
  const [passwordStrengthError, setPasswordStrengthError] = useState("");
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const StrongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

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
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "newPassword") {
      setPasswordStrengthError(
        StrongPassword.test(value)
          ? ""
          : "Weak password. Use 8+ chars, uppercase, lowercase, number, special char."
      );
    }
    setFormData(prev => ({ ...prev, [name]: value }));
    setMessage({ error: "", success: "" });
  };

  const handleRemoveAvatar = async () => {
  // If avatarFile exists but not saved → just clear selection locally
  if (formData.avatarFile) {
    setFormData(prev => ({
      ...prev,
      avatarFile: null,
      avatarPreview: "", // reset completely, fallback will show default avatar
    }));
    if (fileRef.current) fileRef.current.value = "";
    return;
  }

  // Otherwise → delete from backend
  try {
    const payload = { removeAvatar: true };
    await editProfile(payload);

    setFormData(prev => ({
      ...prev,
      avatarFile: null,
      avatarPreview: "", // remove DB avatar
    }));
    if (fileRef.current) fileRef.current.value = "";
  } catch (err) {
    setMessage({ error: err?.message || "Failed to remove avatar", success: "" });
  }
};


  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage({ error: "Invalid image file", success: "" });
      return;
    }
    setFormData(prev => ({
      ...prev,
      avatarFile: file,
      avatarPreview: URL.createObjectURL(file),
    }));
    setMessage({ error: "", success: "" });
  };

  const validate = () => {
    if (formData.newPassword && !StrongPassword.test(formData.newPassword)) {
      setMessage({ error: "Password must be at least 8 chars with uppercase, lowercase, number, special char.", success: "" });
      return false;
    }
    if (formData.newPassword !== formData.confirmNewPassword) {
      setMessage({ error: "Passwords do not match", success: "" });
      return false;
    }
    return true;
  };

  const hasChanges = () => {
    if (!user) return false;
    return (
      formData.firstName !== user.firstName ||
      formData.middleName !== user.middleName ||
      formData.lastName !== user.lastName ||
      formData.mobile !== user.mobile ||
      formData.gender !== user.gender ||
      formData.avatarFile ||
      formData.currentPassword ||
      formData.newPassword
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasChanges()) {
      setMessage({ error: "No changes detected", success: "" });
      return;
    }
    if (!validate()) return;

    setIsSaving(true);
    const payload = { firstName: formData.firstName, middleName: formData.middleName, lastName: formData.lastName, mobile: formData.mobile, gender: formData.gender };

    if (formData.currentPassword && formData.newPassword) {
      payload.currentPassword = formData.currentPassword;
      payload.newPassword = formData.newPassword;
    }

    try {
      if (formData.avatarFile) {
        const fd = new FormData();
        fd.append("avatar", formData.avatarFile);
        fd.append("firstName", formData.firstName);
        fd.append("middleName", formData.middleName);
        fd.append("lastName", formData.lastName);
        fd.append("mobile", formData.mobile);
        fd.append("gender", formData.gender);
        if (formData.currentPassword && formData.newPassword) {
          fd.append("currentPassword", formData.currentPassword);
          fd.append("newPassword", formData.newPassword);
        }
        await editProfile(fd, true);
      } else {
        await editProfile(payload);
      }

      setShowSuccessAnimation(true);
      setMessage({ success: "Profile updated successfully", error: "" });
      setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmNewPassword: "", avatarFile: null }));
      if (fileRef.current) fileRef.current.value = "";

      setTimeout(() => {
        const from = location.state?.from || "/";
        navigate(from);
      }, 3500);
    } catch (err) {
      if (err?.message === "Invalid current password") {
        setMessage({ error: "Current password is invalid", success: "" });
      } else {
        setMessage({ error: err?.message || "Profile update failed", success: "" });
      }
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
            <img src={formData.avatarPreview || getDefaultAvatar(formData.gender)} alt="Avatar" className="pe-avatar-img" />
            <input type="file" accept="image/*" ref={fileRef} onChange={handleAvatarChange} style={{ display: "none" }} />
            <button type="button" className="pe-avatar-edit" onClick={() => fileRef.current && fileRef.current.click()}>
              <FontAwesomeIcon icon={faPencilAlt} />
            </button>
            {(!showSuccessAnimation && formData.avatarPreview && !formData.avatarFile) && (
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
                <label><input type="radio" name="gender" value="male" checked={formData.gender === "male"} onChange={handleChange} /> Male</label>
                <label><input type="radio" name="gender" value="female" checked={formData.gender === "female"} onChange={handleChange} /> Female</label>
              </div>
            </div>
          </div>

          <div className="pe-row">
            <label className="pe-label">
              Current Password
              <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} />
            </label>
            <label className="pe-label">
              New Password
              <div className="pe-pass-wrapper">
                <input type={passwordVisibility.new ? "text" : "password"} name="newPassword" value={formData.newPassword} onChange={handleChange} />
                <button type="button" className="pe-pass-toggle" onClick={() => setPasswordVisibility(prev => ({ ...prev, new: !prev.new }))}>
                  <FontAwesomeIcon icon={passwordVisibility.new ? faEyeSlash : faEye} />
                </button>
              </div>
            </label>
            <label className="pe-label">
              Confirm Password
              <div className="pe-pass-wrapper">
                <input type={passwordVisibility.confirm ? "text" : "password"} name="confirmNewPassword" value={formData.confirmNewPassword} onChange={handleChange} />
                <button type="button" className="pe-pass-toggle" onClick={() => setPasswordVisibility(prev => ({ ...prev, confirm: !prev.confirm }))}>
                  <FontAwesomeIcon icon={passwordVisibility.confirm ? faEyeSlash : faEye} />
                </button>
              </div>
            </label>
          </div>

          {passwordStrengthError && <p className="pe-error">{passwordStrengthError}</p>}
          {message.error && <p className="pe-error">{message.error}</p>}

          <div className="pe-btn-row">
            <button type="submit" className="pe-btn" disabled={loading || isSaving}>
              {loading || isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </>
      )}
    </form>
  );
};

export default ProfileEdit;
