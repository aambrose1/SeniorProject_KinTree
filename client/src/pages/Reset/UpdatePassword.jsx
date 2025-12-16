import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleUpdatePassword } from "../../utils/authHandlers";
import * as styles from '../Login/styles';
import logo from '../../assets/kintreelogo-adobe.png';

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleUpdatePassword(password);
      setMessage("Password updated. Redirecting to login...");
      setTimeout(() => navigate('/login'), 1200);
    } catch (error) {
      // message handled by handler alert
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
                onChange={(e) => setPassword(e.target.value)}
                style={styles.FieldStyle}
                required
              />
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
