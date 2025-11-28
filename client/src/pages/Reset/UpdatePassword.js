import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleUpdatePassword } from "../../utils/authHandlers";
import * as styles from '../Login/styles';
import logo from '../../assets/kintreelogo-adobe.png';

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    if (!pwd) {
      setPasswordError("Password is required");
      return false;
    }
    // Same validation as registration: 8 chars, uppercase, lowercase, number, special char
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
      // message handled by handler alert
      setPasswordError(error.message || "Failed to update password");
    }
  };

  return (
    <div style={styles.DefaultStyle}>
      <div style={styles.Container}>
        <img src={logo} alt="KinTree Logo" style={styles.Logo} />
        <h1 style={styles.Header}>Update Password</h1>
        <form onSubmit={onSubmit} style={styles.FormStyle}>
          {message && (
            <div style={{color: 'green', marginBottom: '10px', padding: '10px', backgroundColor: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '4px'}}>
              {message}
            </div>
          )}
          <ul style={styles.ListStyle}>
            <li style={styles.ItemStyle}>
              <label>New Password:</label>
              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={handlePasswordChange}
                style={styles.FieldStyle}
                required
              />
              {passwordError && (
                <p style={{ color: 'red', fontSize: '0.9em', marginTop: '5px', marginBottom: '0' }}>
                  {passwordError}
                </p>
              )}
            </li>
          </ul>
          <div style={styles.ButtonDivStyle}>
            <button type="submit" style={styles.ButtonStyle}>Update Password</button>
          </div>
          <div style={{textAlign: 'center', marginTop: '20px'}}>
            <p style={styles.TextStyle}>
              Back to <a href="/login" style={{ color: '#1a73e8', textDecoration: 'underline' }}>Sign In</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
