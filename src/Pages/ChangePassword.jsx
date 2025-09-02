import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Lottie from "lottie-react";
import successAnim from "../loader/Lock.json";
import "../css/ChangePassword.css";

const ChangePassword = () => {
  const { editProfile, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [passwordVisibility, setPasswordVisibility] = useState({
    new: false,
    confirm: false,
  });

  const [message, setMessage] = useState({ error: "", success: "" });
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);

  const StrongPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  const showMessage = (type, text) => {
    if (type === "error") {
      setMessage({ error: text, success: "" });
    } else {
      setMessage({ error: "", success: text });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage({ error: "", success: "" });
  };

  const validate = () => {
  if (formData.currentPassword === formData.newPassword) {
    showMessage("error", "New password cannot be the same as the current password");
    return false;
  }

  if (!StrongPassword.test(formData.newPassword)) {
    showMessage(
      "error",
      "Password must be 8+ chars with uppercase, lowercase, number, and special char."
    );
    return false;
  }

  if (formData.newPassword !== formData.confirmNewPassword) {
    showMessage("error", "Passwords do not match");
    return false;
  }

  return true;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await editProfile({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setShowSuccessAnim(true);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setTimeout(async () => {
        await logout();
        navigate("/login");
      }, 3000);
    } catch (err) {
      showMessage("error", err?.message || "Failed to change password");
    }
  };

  if (showSuccessAnim) {
  return (
    <div className="success-container">
      <Lottie
        animationData={successAnim}
        loop={false}
        className="lottie-animation"
      />
      <p className="success-text">Password changed successfully 🎉</p>
    </div>
  );
}

  return (
    <form className="cp-form" onSubmit={handleSubmit}>
      <h2 className="cp-title">Change Password</h2>

      <label className="cp-label">
        Current Password
        <input
          type="password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          required
        />
      </label>

      <label className="cp-label">
        New Password
        <div className="cp-pass-wrapper">
          <input
            type={passwordVisibility.new ? "text" : "password"}
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="cp-pass-toggle"
            onClick={() =>
              setPasswordVisibility((prev) => ({
                ...prev,
                new: !prev.new,
              }))
            }
          >
            <FontAwesomeIcon
              icon={passwordVisibility.new ? faEyeSlash : faEye}
            />
          </button>
        </div>
      </label>

      <label className="cp-label">
        Confirm New Password
        <div className="cp-pass-wrapper">
          <input
            type={passwordVisibility.confirm ? "text" : "password"}
            name="confirmNewPassword"
            value={formData.confirmNewPassword}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="cp-pass-toggle"
            onClick={() =>
              setPasswordVisibility((prev) => ({
                ...prev,
                confirm: !prev.confirm,
              }))
            }
          >
            <FontAwesomeIcon
              icon={passwordVisibility.confirm ? faEyeSlash : faEye}
            />
          </button>
        </div>
      </label>

      {message.error && <p className="cp-error">{message.error}</p>}

      <button type="submit" className="cp-btn" disabled={loading}>
        {loading ? "Changing Password..." : "Change Password"}
      </button>
    </form>
  );
};

export default ChangePassword;
