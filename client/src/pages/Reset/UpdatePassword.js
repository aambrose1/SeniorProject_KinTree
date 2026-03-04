import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleUpdatePassword } from "../../utils/authHandlers";
import * as styles from '../Login/styles';
import logo from '../../assets/kintreelogo-adobe.png';

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    if (!pwd) {
      setPasswordError("Password is required");
      return false;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/;
    if (!passwordRegex.test(pwd)) {
      setPasswordError("Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (newPassword) {
      validatePassword(newPassword);
    } else {
      setPasswordError("");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (!validatePassword(password)) {
      return;
    }

    try {
      await handleUpdatePassword(password);
      setMessage("Password updated. Redirecting to login...");
      setTimeout(() => navigate('/login'), 1200);
    } catch (error) {
      setPasswordError(error.message || "Failed to update password");
    }
  };

  const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );

  const EyeOffIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );

  return (
    <div style={styles.DefaultStyle}>
      <div style={styles.Container}>
        <div style={styles.LogoContainer}>
          <img src={logo} alt="KinTree Logo" style={styles.Logo} />
        </div>
        <h1 style={styles.WelcomeHeader}>Update Password</h1>
        <p style={{ ...styles.Subtitle, marginBottom: '24px' }}>Enter your new password below.</p>

        <form onSubmit={onSubmit} style={styles.FormStyle}>
          {message && (
            <div style={{ color: '#059669', marginBottom: '20px', padding: '12px', backgroundColor: '#d1fae5', border: '1px solid #10b981', borderRadius: '10px', fontSize: '14px', textAlign: 'center' }}>
              {message}
            </div>
          )}

          <div style={styles.InputGroup}>
            <label style={styles.Label}>New Password</label>
            <div style={styles.InputWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={handlePasswordChange}
                style={{
                  ...styles.FieldStyle,
                  paddingRight: '44px'
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.EyeButton}
                tabIndex="-1"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {passwordError && (
              <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px', marginBottom: '0' }}>
                {passwordError}
              </p>
            )}
          </div>

          <button type="submit" style={styles.SignInButton}>
            Update Password
          </button>

          <div style={styles.RegisterRow}>
            Back to
            <a href="/login" style={styles.RegisterLink}>Sign In</a>
          </div>
        </form>
      </div>
    </div>
  );
}
