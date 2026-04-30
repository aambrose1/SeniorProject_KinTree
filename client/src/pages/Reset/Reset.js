import { useState } from "react";
import { handleResetPassword } from '../../utils/authHandlers';
import * as styles from '../Login/styles';
import logo from '../../assets/kintreelogo-adobe.png';

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    // Make sure the confirmation message is displayed
    setMessage('Check your email for a reset link.');
    try {
      await handleResetPassword(email);
    } catch (error) {
        // message handled by handler alert
      setMessage('');
    }
  };

  return (
    <div style={styles.DefaultStyle}>
      <div style={styles.Container}>
        <div style={styles.LogoContainer}>
          <img src={logo} alt="KinTree Logo" style={styles.Logo} />
        </div>
        <h1 style={styles.WelcomeHeader}>Reset Password</h1>
        <p style={{ ...styles.Subtitle, marginBottom: '24px' }}>Enter your email to receive a reset link.</p>

        <form onSubmit={onSubmit} style={styles.FormStyle}>
          {message && (
            <div style={{ color: '#059669', marginBottom: '20px', padding: '12px', backgroundColor: '#d1fae5', border: '1px solid #10b981', borderRadius: '10px', fontSize: '14px', textAlign: 'center' }}>
              {message}
            </div>
          )}

          <div style={styles.InputGroup}>
            <label style={styles.Label}>Email</label>
            <div style={styles.InputWrapper}>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.FieldStyle}
                required
              />
            </div>
          </div>

          <button type="submit" style={styles.SignInButton}>
            Send Reset Email
          </button>

          <div style={styles.RegisterRow}>
            Remembered your password?
            <a href="/login" style={styles.RegisterLink}>Back to Sign In</a>
          </div>
        </form>
      </div>
    </div>
  );
}
