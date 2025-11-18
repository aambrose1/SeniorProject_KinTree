import * as styles from "./styles";
import "./toggle.css";
import NavBar from "../../components/NavBar/NavBar";
import { useTheme } from '../../ThemeProvider';

function WebsiteSettings() {
  const { darkMode, toggleDarkMode } = useTheme();
  return (
    <div style={styles.DefaultStyle}>
      <NavBar />
      <div style={styles.RightSide}>
        <div style={{ width: '150px' }}></div>
        <div style={styles.SettingsContainer}>
          <h1 style={styles.Title}>Settings</h1>
          <hr
            style={{
              color: 'var(--border-color, #000000)',
              backgroundColor: 'var(--border-color, #000000)',
              height: 0.1,
              width: '95%',
              borderColor: 'var(--border-color, #000000)',
              margin: '5px 20px 5px 2px',
            }}
          />

          <div style={styles.Section}>
            <h2 style={styles.SubTitle}>Family Tree Management</h2>
            <button style={styles.Button}>Export Data</button>
            <button style={styles.Button}>Import Data</button>
            <button style={styles.Button}>Backup & Restore</button>
          </div>

          <div style={styles.Section}>
            <h2 style={styles.SubTitle}>Event & Notifications</h2>
            <label>Sync with Google Calendar:</label>
            <br />
            <button style={styles.Button}>Connect</button>
          </div>

          {/* Appearance Settings */}
          <div style={styles.Section}>
            <h2 style={styles.SubTitle}>Appearance</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
              <label style={{ marginRight: '10px', fontWeight: '500' }}>Dark Mode:</label>
              <label className="toggle-switch-container">
                <input 
                  type="checkbox"
                  className="toggle-switch-input"
                  checked={darkMode}
                  onChange={toggleDarkMode}
                />
                <span className="toggle-switch-slider"></span>
              </label>
              <span style={{ marginLeft: '8px', color: darkMode ? '#4CAF50' : '#666' }}>
                {darkMode ? 'On' : 'Off'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WebsiteSettings;
