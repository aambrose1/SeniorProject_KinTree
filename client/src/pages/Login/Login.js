import { React, useState } from 'react';
import * as styles from './styles';
import logo from '../../assets/kintreelogo-adobe.png';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../../CurrentUserProvider';
import { handleLogin, handleSignInWithGoogle } from '../../utils/authHandlers';
import { supabase } from '../../utils/supabaseClient';

function Login() {
    const { register, handleSubmit } = useForm();
    const [ errorMessage, setErrorMessage ] = useState("");
    const [ needsConfirm, setNeedsConfirm ] = useState(false);
    const [ attemptedEmail, setAttemptedEmail ] = useState("");
    const [ resendLoading, setResendLoading ] = useState(false);
    const { setCurrentAccountID, fetchCurrentUserID, fetchCurrentAccountID } = useCurrentUser();
    const [ mfaStep, setMfaStep ] = useState(false);
    const [ mfaFactorId, setMfaFactorId ] = useState("");
    const [ mfaChallengeId, setMfaChallengeId ] = useState("");
    const [ mfaCode, setMfaCode ] = useState("");
    const [ mfaError, setMfaError ] = useState("");
    
    const onSubmit = async (data) => {
        setErrorMessage(""); // clear previous errors
        setNeedsConfirm(false);
        setAttemptedEmail(data.email);
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
          const msg = String(error?.message || '').toLowerCase();
          const requiresConfirm = msg.includes('confirm') || msg.includes('not confirmed');
          if (requiresConfirm) {
            setNeedsConfirm(true);
          } else {
            setErrorMessage(error.message);
          }
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

    const handleResendConfirmation = async () => {
        if (!attemptedEmail) return;
        setResendLoading(true);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: attemptedEmail,
            });
            if (error) throw error;
            // surface a lightweight notice
            setErrorMessage('Confirmation email sent. Please check your inbox.');
        } catch (e) {
            setErrorMessage(e.message);
        } finally {
            setResendLoading(false);
        }
    }

    document.body.style.overflow = 'hidden';
    document.body.style.width = '100%'; 

    return (
        <div style={styles.DefaultStyle}>
            <div style={styles.Container}>
                <img src={logo} alt="KinTree Logo" style={styles.Logo} />
                <h1 style={styles.Header}>Sign In</h1>
                {!mfaStep && (
                <form onSubmit={handleSubmit(onSubmit)} style={styles.FormStyle}>
                    {needsConfirm && (
                        <div style={{
                            background: '#fff8e1',
                            border: '1px solid #ffe082',
                            color: '#8d6e63',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '12px',
                            textAlign: 'center'
                        }}>
                            <div>Please confirm your email to continue. We sent a link to<br/><strong>{attemptedEmail}</strong></div>
                            <button type="button" onClick={handleResendConfirmation} disabled={resendLoading} style={{ marginTop: '8px' }}>
                                {resendLoading ? 'Resending...' : 'Resend confirmation email'}
                            </button>
                        </div>
                    )}
                    <ul style={styles.ListStyle}>
                        <li style={styles.ItemStyle}>
                            <label>
                                Email Address:
                            </label>
                            <input {...register("email", { required: true })} type="text" placeholder="" style={styles.FieldStyle} required />
                        </li>
                        <li style={styles.ItemStyle}>
                            <label>
                                Password:
                            </label>
                            <input {...register("password", { required: true })} type="password" autoComplete='current-password' placeholder="" style={styles.FieldStyle} required />
                        </li>
                    </ul>

                    {/* Display error message */}
                    {errorMessage && (
                        <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>
                            {errorMessage}
                        </p>
                    )}

                    {/* Google OAuth button (moved above other buttons) */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginBottom: '16px' }}>
                      <button
                        type="button"
                        onClick={async () => { try { await handleSignInWithGoogle(); } catch (e) {} }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '12px',
                          padding: '12px 20px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #dadce0',
                          borderRadius: '24px',
                          boxShadow: 'none',
                          cursor: 'pointer',
                          minWidth: '320px'
                        }}
                      >
                        {/* Google G icon (SVG) */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.153 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20c0-1.341-.138-2.651-.389-3.917z"/>
                          <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.297 16.108 18.798 12 24 12c3.059 0 5.842 1.153 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                          <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.197l-6.191-5.238C29.101 35.091 26.671 36 24 36c-5.202 0-9.703-4.108-11.122-9.51l-6.571 4.819C9.656 39.663 16.318 44 24 44z"/>
                          <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.793 2.239-2.231 4.166-4.095 5.565l.003-.002 6.191 5.238C35.246 40.217 44 34 44 24c0-1.341-.138-2.651-.389-3.917z"/>
                        </svg>
                        <span style={{ fontSize: '16px', color: '#3c4043', fontWeight: 600 }}>Sign in with Google</span>
                      </button>
                    </div>

                    {/* buttons */}
                    <div style={styles.ButtonDivStyle}>
                        <button type="submit" style={styles.ButtonStyle}><h3 style={styles.Header}>Login</h3></button>
                        <div style={{width: '40%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                            <p style={{...styles.TextStyle, fontSize: '0.9em'}}>Don't have an account?</p>
                            <button type="button" onClick={()=>{window.location.href='/register'}} style={styles.WhiteButtonStyle}><h3 style={styles.Header}><a style={styles.LinkStyle} href="/register">Register</a></h3></button>
                        </div>
                    </div>

                    {/* forgot password */}
                    <div style={{marginTop: '10%', display: 'flex', justifyContent: 'center'}}>
                        <Link to="/reset-password" style={{...styles.TextStyle, fontSize: '0.9em'}}>Forgot your password?</Link>
                    </div>
                </form>
                )}

                {mfaStep && (
                  <form onSubmit={onSubmitMfa} style={styles.FormStyle}>
                    <div style={{
                        background: '#e8f0fe',
                        border: '1px solid #c6dafc',
                        color: '#174ea6',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '12px',
                        textAlign: 'center'
                    }}>
                      Enter the 6-digit code from your authenticator app
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="123456"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value)}
                      style={styles.FieldStyle}
                      required
                    />
                    {mfaError && (
                      <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{mfaError}</p>
                    )}
                    <div style={styles.ButtonDivStyle}>
                      <button type="submit" style={styles.ButtonStyle}><h3 style={styles.Header}>Verify</h3></button>
                    </div>
                  </form>
                )}
            </div>
        </div>
    )
}

export default Login;