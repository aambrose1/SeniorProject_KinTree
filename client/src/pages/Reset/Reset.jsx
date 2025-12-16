import { useState } from "react";
import { handleResetPassword } from '../../utils/authHandlers';
import * as styles from '../Login/styles';
import logo from '../../assets/kintreelogo-adobe.png';

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleResetPassword(email);
      setMessage('Check your email for a reset link.');
    } catch (error) {
      // message handled by handler alert
    }
  };

  return (
    <div style={styles.DefaultStyle}>
      <div style={styles.Container}>
        <img src={logo} alt="KinTree Logo" style={styles.Logo} />
        <h1 style={styles.Header}>Reset Password</h1>
        <form onSubmit={onSubmit} style={styles.FormStyle}>
          {message && (
            <div style={{color: 'green', marginBottom: '10px', padding: '10px', backgroundColor: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '4px'}}>
              {message}
            </div>
          )}
          <ul style={styles.ListStyle}>
            <li style={styles.ItemStyle}>
              <label>Email Address:</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.FieldStyle}
                required
              />
            </li>
          </ul>
          <div style={styles.ButtonDivStyle}>
            <button type="submit" style={{...styles.ButtonStyle, width: '100%'}}>Send Reset Email</button>
          </div>
          <div style={{textAlign: 'center', marginTop: '20px'}}>
            <p style={{...styles.TextStyle, fontSize: '0.9em'}}>
              Remembered your password? <a href="/login" style={{ color: '#1a73e8', textDecoration: 'underline' }}>Back to Sign In</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
