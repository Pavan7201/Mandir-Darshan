import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import Lottie from "lottie-react";
import adminLoginAnimation from "../loader/admin.json";
import "../css/AdminLoginPage.css";

const AdminLoginPage = () => {
  const [userId, setUserId] = useState("");
  const [passcodeDigits, setPasscodeDigits] = useState(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { adminLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handlePasscodeChange = (e, idx) => {
    const val = e.target.value;
    if (/^\d?$/.test(val)) {
      const newPasscodeDigits = [...passcodeDigits];
      newPasscodeDigits[idx] = val;
      setPasscodeDigits(newPasscodeDigits);

      if (val && idx < passcodeDigits.length - 1) {
        const nextInput = document.getElementById(`passcode-${idx + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handlePasscodeKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      if (!passcodeDigits[idx] && idx > 0) {
        const prevInput = document.getElementById(`passcode-${idx - 1}`);
        if (prevInput) prevInput.focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const passcode = passcodeDigits.join("");
  if (
    passcode.length !== 6 ||
    passcodeDigits.some((digit) => digit.trim() === "")
  ) {
    setError("Please enter a complete 6-digit passcode.");
    setLoading(false);
    return;
  }

    try {
      await adminLogin(userId.trim(), passcode);
    navigate("/admin");
    } catch (err) {
      setError(err.message || "Invalid UserID or Passcode");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-login-section">
      <div className="admin-login-page">
        <div className="admin-login-left">
          <div className="admin-login-container">
            <h2>Admin Login</h2>
            <form onSubmit={handleSubmit} className="login-form">
              <label>
                <span>User ID</span>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                  placeholder="Enter User ID"
                />
              </label>

              <label>
                <span>Passcode</span>
                <div className="passcode-input-group">
                  {passcodeDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`passcode-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handlePasscodeChange(e, idx)}
                      onKeyDown={(e) => handlePasscodeKeyDown(e, idx)}
                      required
                      autoComplete="one-time-code"
                      className="passcode-digit"
                      aria-label={`Passcode digit ${idx + 1}`}
                    />
                  ))}
                </div>
              </label>

              {error && <p className="error-message">{error}</p>}

              <button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>

        <div className="admin-login-right">
          <Lottie
            animationData={adminLoginAnimation}
            loop={true}
            autoplay={true}
            style={{ maxWidth: "400px", width: "100%", height: "auto" }}
          />
        </div>
      </div>
    </section>
  );
};

export default AdminLoginPage;
