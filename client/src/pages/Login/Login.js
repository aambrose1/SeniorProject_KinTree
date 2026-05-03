import { React, useState, useEffect } from 'react';
import * as styles from './styles';
import logo from '../../assets/kintreelogo-adobe.png';
import { useForm } from 'react-hook-form';
import { handleLogin, handleSignInWithGoogle } from '../../utils/authHandlers';
import { supabase } from '../../utils/supabaseClient';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

function Login() {
  const { register, handleSubmit, setValue } = useForm();
  const [errorMessage, setErrorMessage] = useState("");
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState("");
  const [mfaChallengeId, setMfaChallengeId] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaError, setMfaError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for invitation token - redirect to create account
    const inviteToken = searchParams.get('inviteToken');
    if (inviteToken) {
      navigate(`/register?inviteToken=${inviteToken}`);
      return;
    }
    
    const savedEmail = localStorage.getItem('kintree_remembered_email');
    if (savedEmail) {
      setRememberMe(true);
      setValue('email', savedEmail);
    }
  }, [setValue, searchParams, navigate]);

  const onSubmit = async (data) => {
    setErrorMessage(""); // clear previous errors

    if (rememberMe) {
      localStorage.setItem('kintree_remembered_email', data.email);
    } else {
      localStorage.removeItem('kintree_remembered_email');
    }

    try {
      await handleLogin(data.email, data.password); // password step
      // After password login, check for verified TOTP factor
      const { data: factorsData, error: lfErr } = await supabase.auth.mfa.listFactors();
      if (lfErr) throw lfErr;
      const totp = factorsData?.all?.find(f => f.factor_type === 'totp' && f.status === 'verified');
      if (totp) {
        const { data: challengeData, error: chErr } = await supabase.auth.mfa.challenge({ factorId: totp.id });
        if (chErr) throw chErr;
        setMfaFactorId(totp.id);
        setMfaChallengeId(challengeData?.id || "");
        setMfaStep(true);
        return; // wait for MFA verify
      }
      // No MFA required → proceed
      window.location.href = '/';
    } catch (error) {
      // Email verification is now optional, so don't show confirmation errors
      setErrorMessage(error.message);
    }
  };

  const onSubmitMfa = async (e) => {
    e.preventDefault();
    setMfaError("");
    try {
      const { error } = await supabase.auth.mfa.verify({ factorId: mfaFactorId, challengeId: mfaChallengeId, code: mfaCode });
      if (error) throw error;
      window.location.href = '/';
    } catch (e2) {
      setMfaError(e2.message || 'Verification failed');
    }
  }

  // SVG Icons for password toggle
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

        <h1 style={styles.WelcomeHeader}>Welcome Back to KinTree</h1>
        <p style={styles.Subtitle}>Enter your email and password to continue.</p>

        {!mfaStep ? (
          <form onSubmit={handleSubmit(onSubmit)} style={styles.FormStyle}>
            <div style={styles.InputGroup}>
              <label style={styles.Label}>Email</label>
              <div style={styles.InputWrapper}>
                <input
                  {...register("email", { required: true })}
                  type="email"
                  placeholder="Enter your email address"
                  style={{
                    ...styles.FieldStyle,
                    paddingRight: '16px'
                  }}
                  required
                />
              </div>
            </div>

            <div style={styles.InputGroup}>
              <label style={styles.Label}>Password</label>
              <div style={styles.InputWrapper}>
                <input
                  {...register("password", { required: true })}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  style={{
                    ...styles.FieldStyle,
                    paddingRight: '44px' // make room for the eye button
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.EyeButton}
                  tabIndex="-1" // Don't interrupt tab flow
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div style={styles.OptionsRow}>
              <label style={styles.CheckboxLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={styles.Checkbox}
                />
                Remember me
              </label>
              <Link to="/reset-password" style={styles.ForgotPassword}>Forgot password</Link>
            </div>

            {errorMessage && (
              <p style={{ color: '#ef4444', textAlign: 'center', margin: '0 0 16px 0', fontSize: '14px' }}>
                {errorMessage}
              </p>
            )}

            <button type="submit" style={styles.SignInButton}>
              Sign In
            </button>

            <div style={styles.DividerRow}>
              <div style={styles.DividerLine}></div>
              <span style={styles.DividerText}>Or login with</span>
              <div style={styles.DividerLine}></div>
            </div>

            <button
              type="button"
              onClick={async () => { try { await handleSignInWithGoogle(); } catch (e) { } }}
              style={styles.GoogleButton}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.153 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20c0-1.341-.138-2.651-.389-3.917z" />
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.297 16.108 18.798 12 24 12c3.059 0 5.842 1.153 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.197l-6.191-5.238C29.101 35.091 26.671 36 24 36c-5.202 0-9.703-4.108-11.122-9.51l-6.571 4.819C9.656 39.663 16.318 44 24 44z" />
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.793 2.239-2.231 4.166-4.095 5.565l.003-.002 6.191 5.238C35.246 40.217 44 34 44 24c0-1.341-.138-2.651-.389-3.917z" />
              </svg>
              Google
            </button>

            <div style={styles.RegisterRow}>
              Don't have an account?
              <Link to="/register" style={styles.RegisterLink}>Register</Link>
            </div>

          </form>
        ) : (
          <form onSubmit={onSubmitMfa} style={styles.FormStyle}>
            <div style={{
              background: '#e8f0fe',
              border: '1px solid #c6dafc',
              color: '#174ea6',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '12px',
              textAlign: 'center',
              fontSize: '14px'
            }}>
              Enter the 6-digit code from your authenticator app
            </div>

            <div style={styles.InputGroup}>
              <div style={styles.InputWrapper}>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  style={{
                    ...styles.FieldStyle,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    letterSpacing: '2px'
                  }}
                  required
                />
              </div>
            </div>

            {mfaError && (
              <p style={{ color: '#ef4444', textAlign: 'center', margin: '0 0 16px 0', fontSize: '14px' }}>
                {mfaError}
              </p>
            )}

            <button type="submit" style={styles.SignInButton}>
              Verify
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Login;