import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import * as styles from './styles';
import logo from '../../assets/kintreelogo-adobe.png';

export default function VerifyEmail() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('verifying'); // verifying, success, error, waiting, verified
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const statusRef = useRef(status);

  useEffect(() => {
    // Get email from URL params
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }

    // Check if this is from email link (has hash tokens) vs original tab
    const hash = window.location.hash;
    const hasEmailLinkToken = hash && (hash.includes('access_token') || hash.includes('type=signup'));

    // Check for session first (Supabase auto-handles hash tokens)
    checkSession(hasEmailLinkToken);

    // Listen for auth state changes (Supabase will set session when user clicks email link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // If this is from email link, redirect to /
          if (hasEmailLinkToken) {
            setStatus('success');
            setTimeout(() => {
              navigate('/');
            }, 2000);
          } else {
            // Original tab - show close message
            setStatus('verified');
            if (!email && session.user.email) {
              setEmail(session.user.email);
            }
          }
        }
      }
    );

    // If no session and no email param, show waiting state
    if (!emailParam && !hasEmailLinkToken) {
      setStatus('waiting');
    }

    // Periodically check session (for original tab to detect verification from email link tab)
    // This handles the case where onAuthStateChange doesn't fire across tabs
    let sessionCheckInterval;
    if (!hasEmailLinkToken) {
      sessionCheckInterval = setInterval(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Only update if not already in a terminal state
          if (statusRef.current !== 'verified' && statusRef.current !== 'success') {
            setStatus('verified');
            statusRef.current = 'verified';
            if (!email && session.user.email) {
              setEmail(session.user.email);
            }
          }
          clearInterval(sessionCheckInterval);
        }
      }, 1000); // Check every second
    }

    // Update ref when status changes (separate effect would be cleaner but this works)
    const updateStatusRef = () => {
      statusRef.current = status;
    };
    updateStatusRef();

    return () => {
      subscription.unsubscribe();
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
      }
    };
  }, [searchParams, navigate]);

  // Keep statusRef in sync with status
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const checkSession = async (hasEmailLinkToken) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      // User is already verified and logged in
      // Get email from session if not set
      if (!email && session.user.email) {
        setEmail(session.user.email);
      }
      
      // If this is from email link (has hash), redirect to /
      if (hasEmailLinkToken) {
        setStatus('success');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        // Original tab - user already verified, show close message
        setStatus('verified');
      }
    } else {
      // No session yet - check if we have hash tokens (Supabase will handle these)
      if (hasEmailLinkToken) {
        // Supabase is processing the token, wait for auth state change
        setStatus('verifying');
      } else {
        setStatus('waiting');
      }
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setResendMessage('Please provide your email address');
      return;
    }

    setResendLoading(true);
    setResendMessage('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });

      if (error) throw error;

      setResendMessage('Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error('Resend error:', error);
      setResendMessage(error.message || 'Failed to resend email');
    } finally {
      setResendLoading(false);
    }
  };

  const handleReturnToSite = () => {
    navigate('/login');
  };

  return (
    <div style={styles.DefaultStyle}>
      <div style={styles.Container}>
        <img src={logo} alt="KinTree Logo" style={styles.Logo} />
        
        {/* Email Icon */}
        <div style={styles.IconContainer}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3a5a40"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>

        {/* Title */}
        <h1 style={styles.Header}>Verify your email address</h1>

        {/* Status Messages */}
        {status === 'verifying' && (
          <p style={styles.InfoText}>Verifying your email...</p>
        )}

        {status === 'waiting' && (
          <>
            <p style={styles.InfoText}>
              We have sent a verification link to{' '}
              <strong>{email || 'your email'}</strong>.
            </p>
            <p style={styles.InstructionText}>
              Click on the link to complete the verification process. You might need to{' '}
              <strong>check your spam folder</strong>.
            </p>
          </>
        )}

        {status === 'success' && (
          <p style={styles.SuccessText}>
            Email verified successfully! Redirecting...
          </p>
        )}

        {status === 'verified' && (
          <p style={styles.SuccessText}>
            Your email has been verified. You can now safely close this tab.
          </p>
        )}

        {status === 'error' && (
          <p style={styles.ErrorText}>
            Verification failed. Please try resending the email.
          </p>
        )}

        {/* Resend Message - only show if not verified */}
        {status !== 'verified' && resendMessage && (
          <p
            style={{
              color: resendMessage.includes('sent') ? '#3a5a40' : '#d32f2f',
              marginTop: '12px',
              fontSize: '14px',
            }}
          >
            {resendMessage}
          </p>
        )}

        {/* Action Buttons - only show if not verified */}
        {status !== 'verified' && (
          <div style={styles.ButtonContainer}>
            <button
              type="button"
              onClick={handleResendEmail}
              disabled={resendLoading}
              style={styles.ResendButton}
            >
              {resendLoading ? 'Sending...' : 'Resend email'}
            </button>
            <button
              type="button"
              onClick={handleReturnToSite}
              style={styles.ReturnButton}
            >
              Return to Site
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginLeft: '8px' }}
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Footer */}
        <p style={styles.FooterText}>
          You can reach us at{' '}
          <a href="mailto:support@kintree.com" style={styles.FooterLink}>
            support@kintree.com
          </a>{' '}
          if you have any questions.
        </p>
      </div>
    </div>
  );
}
