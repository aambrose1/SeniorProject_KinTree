import { useState } from "react";
import * as styles from "./styles";
import NavBar from "../../components/NavBar/NavBar";

function WebsiteSettings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div style={styles.DefaultStyle}>
      <NavBar />
      <div style={styles.RightSide}>
        <div style={{width: '150px'}}></div>
        <div style={styles.SettingsContainer}>
        <h1 style={styles.Title}>Settings</h1>
        {/* line */}
        <hr style={{
                        color: '#000000',
                        backgroundColor: '#000000',
                        height: .1,
                        width: '95%',
                        borderColor : '#000000',
                        margin: '5px 20px 5px 2px'
                    }}/>
        
        {/* Account & Security Settings */}
        <div style={styles.Section}>
          <h2 style={styles.SubTitle}>Account & Security</h2>
          <label>Change Password:</label>
          <input style={styles.Input} type="password" placeholder="New Password" />
          <button style={styles.Button}>Update Password</button>
          <br/><br/>

          <label>Enable Two-Factor Authentication:</label>
          <input style={styles.ToggleSwitch}
            type="radio"
            checked={notifications}
            onClick={() => setNotifications(!notifications)}
          />
        </div>

        {/* Profile & Personalization */}
        <div style={styles.Section}>
          <h2 style={styles.SubTitle}>Profile & Personalization</h2>
          <label>Profile Picture:</label>
          <input style={styles.Input} type="file" />
          <br/><br/>
          <label>Enable Dark Mode:</label>
          <input style={styles.ToggleSwitch}
            type="radio"
            checked={darkMode}
            onClick={() => setDarkMode(!darkMode)}
          />
        </div>

        {/* Family Tree Management */}
        <div style={styles.Section}>
          <h2 style={styles.SubTitle}>Family Tree Management</h2>
          <button style={styles.Button}>Export Data</button>
          <button style={styles.Button}>Import Data</button>
          <button style={styles.Button}>Backup & Restore</button>
        </div>

        {/* Event & Notifications */}
        <div style={styles.Section}>
          <h2 style={styles.SubTitle}>Event & Notifications</h2>
          <label>Sync with Google Calendar:</label><br/>
          <button style={styles.Button}>Connect</button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default WebsiteSettings;
