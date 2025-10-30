import { useState, useEffect } from "react";
import * as styles from "./styles";
import NavBar from "../../components/NavBar/NavBar";
import { handleLogout } from '../../utils/authHandlers';
import { supabase } from '../../utils/supabaseClient';

function WebsiteSettings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [totpFactorId, setTotpFactorId] = useState("");
  const [totpQr, setTotpQr] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [totpStatus, setTotpStatus] = useState("");
  const [totpLoading, setTotpLoading] = useState(false);
  const [totpVerified, setTotpVerified] = useState(false);

  async function loadFactors() {
    try {
      const { data: factorsData, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      const verified = factorsData?.all?.find(f => f.factor_type === 'totp' && f.status === 'verified');
      const unverified = factorsData?.all?.find(f => f.factor_type === 'totp' && f.status === 'unverified');
      if (verified) {
        setTotpVerified(true);
        setTotpFactorId(verified.id);
        setTotpQr("");
      } else if (unverified) {
        setTotpVerified(false);
        setTotpFactorId(unverified.id);
        setTotpQr(""); // we can't re-fetch QR; allow verify via code
      } else {
        setTotpVerified(false);
        setTotpFactorId("");
        setTotpQr("");
      }
    } catch (e) {
      console.error('Load factors error:', e);
    }
  }

  useEffect(() => {
    loadFactors();
  }, []);

  async function startTotpEnroll() {
    setTotpStatus("");
    setTotpLoading(true);
    try {
      // Avoid starting a new enroll while one is pending
      if (totpVerified) {
        setTotpStatus('Two-factor authentication is already enabled.');
        return;
      }
      if (totpFactorId && !totpVerified) {
        setTotpStatus('A TOTP setup is pending. Enter a code from your authenticator, or click Start over.');
        return;
      }
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) throw error;
      console.log('Enroll data:', data);
      setTotpFactorId(data.id);
      setTotpQr(data.totp?.qr_code || "");
    } catch (e) {
      setTotpStatus(e.message);
    } finally {
      setTotpLoading(false);
    }
  }

  async function verifyTotp() {
    if (!totpFactorId || !totpCode) return;
    setTotpLoading(true);
    setTotpStatus("");
    try {
      // Ensure we have the correct pending factorId in case state was lost
      if (!totpFactorId) {
        const { data: factorsData, error: factorsErr } = await supabase.auth.mfa.listFactors();
        if (factorsErr) throw factorsErr;
        console.log('Factors:', factorsData);
        const pending = factorsData?.all?.find(f => f.factor_type === 'totp' && f.status === 'unverified');
        if (pending) setTotpFactorId(pending.id);
      } else {
        const { data: factorsData, error: factorsErr } = await supabase.auth.mfa.listFactors();
        if (!factorsErr) console.log('Factors:', factorsData);
      }

      console.log('Using factorId:', totpFactorId, 'Code:', totpCode);
      // Create a challenge, then verify with challengeId (works across SDK versions)
      const { data: challengeData, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId: totpFactorId });
      if (challengeErr) throw challengeErr;
      console.log('Challenge data:', challengeData);
      const challengeId = challengeData?.id;
      const { error } = await supabase.auth.mfa.verify({ factorId: totpFactorId, challengeId, code: totpCode });
      if (error) throw error;
      setTotpStatus('Two-factor authentication enabled.');
      setTotpQr("");
      setTotpCode("");
      setTotpVerified(true);
    } catch (e) {
      console.error('TOTP verify error:', e);
      setTotpStatus(e.message || 'Verification failed');
    } finally {
      setTotpLoading(false);
    }
  }

  async function disableTotp() {
    if (!totpFactorId) return;
    setTotpLoading(true);
    setTotpStatus("");
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: totpFactorId });
      if (error) throw error;
      setTotpVerified(false);
      setTotpFactorId("");
      setTotpStatus('Two-factor authentication disabled.');
    } catch (e) {
      setTotpStatus(e.message || 'Failed to disable');
    } finally {
      setTotpLoading(false);
    }
  }

  async function restartTotpEnroll() {
    // For lingering unverified factor: unenroll then start fresh
    if (totpFactorId && !totpVerified) {
      try {
        const { error } = await supabase.auth.mfa.unenroll({ factorId: totpFactorId });
        if (error) throw error;
        setTotpFactorId("");
        setTotpQr("");
        setTotpCode("");
        setTotpStatus('Previous pending setup cleared.');
      } catch (e) {
        setTotpStatus(e.message || 'Could not reset existing setup');
        return;
      }
    }
    await startTotpEnroll();
  }
  
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
          <div style={{ marginTop: '8px' }}>
            <label>Authenticator App (TOTP):</label>
            {totpVerified && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                <span>Enabled</span>
                <button style={styles.Button} onClick={disableTotp} disabled={totpLoading}>Disable</button>
                {totpStatus && <span>{totpStatus}</span>}
              </div>
            )}
            {!totpVerified && !totpQr && !totpFactorId && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                <button style={styles.Button} onClick={startTotpEnroll} disabled={totpLoading}>
                  {totpLoading ? 'Starting…' : 'Set up Authenticator'}
                </button>
                {totpStatus && <span>{totpStatus}</span>}
              </div>
            )}
            {!totpVerified && totpFactorId && !totpQr && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                <div>Enter a 6‑digit code from your authenticator to complete setup.</div>
                <input
                  style={styles.Input}
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button style={styles.Button} onClick={verifyTotp} disabled={totpLoading || !totpCode}>
                    {totpLoading ? 'Verifying…' : 'Verify Code'}
                  </button>
                  <button style={styles.Button} onClick={restartTotpEnroll} disabled={totpLoading}>
                    Start over
                  </button>
                </div>
                {totpStatus && <span>{totpStatus}</span>}
              </div>
            )}
            {!totpVerified && totpQr && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                <div>Scan this QR with Duo/Google Authenticator, then enter the 6‑digit code:</div>
                <img alt="TOTP QR" src={totpQr} style={{ width: '160px', height: '160px' }} />
                <input
                  style={styles.Input}
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                />
                <button style={styles.Button} onClick={verifyTotp} disabled={totpLoading || !totpCode}>
                  {totpLoading ? 'Verifying…' : 'Verify Code'}
                </button>
                {totpStatus && <span>{totpStatus}</span>}
              </div>
            )}
          </div>
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
                <button onClick={handleLogout}>Sign Out</button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default WebsiteSettings;
