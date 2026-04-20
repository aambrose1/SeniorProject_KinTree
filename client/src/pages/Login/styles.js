export const DefaultStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: 'var(--bg-color)',
  fontFamily: 'inherit',
};

export const Container = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '440px',
  backgroundColor: 'var(--card-bg)',
  padding: 'var(--space-10)',
  borderRadius: 'var(--radius-xl)',
  boxShadow: 'var(--shadow-lg)',
  boxSizing: 'border-box',
};

export const LogoContainer = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: 'var(--space-6)',
};

export const Logo = {
  width: '80px',
  height: 'auto',
  borderRadius: 'var(--radius-lg)',
};

export const WelcomeHeader = {
  fontSize: '24px',
  fontWeight: '600',
  color: 'var(--text-color)',
  textAlign: 'center',
  margin: '0 0 var(--space-2) 0',
  fontFamily: 'inherit',
};

export const Subtitle = {
  fontSize: '14px',
  color: 'var(--text-secondary)',
  textAlign: 'center',
  margin: '0 0 var(--space-8) 0',
};

export const FormStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
};

export const InputGroup = {
  display: 'flex',
  flexDirection: 'column',
  marginBottom: 'var(--space-5)',
};

export const Label = {
  fontSize: '14px',
  fontWeight: '500',
  color: 'var(--text-secondary)',
  marginBottom: 'var(--space-2)',
};

export const InputWrapper = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
};

export const FieldStyle = {
  width: '100%',
  padding: '12px 16px',
  fontSize: '15px',
  color: 'var(--text-color)',
  backgroundColor: 'var(--input-bg)',
  border: '1px solid var(--input-border)',
  borderRadius: 'var(--radius-md)',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

export const EyeButton = {
  position: 'absolute',
  right: '12px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-muted)',
  padding: '4px',
};

export const OptionsRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 'var(--space-6)',
};

export const CheckboxLabel = {
  display: 'flex',
  alignItems: 'center',
  fontSize: '14px',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  userSelect: 'none',
};

export const Checkbox = {
  marginRight: 'var(--space-2)',
  width: '16px',
  height: '16px',
  cursor: 'pointer',
  accentColor: 'var(--kt-green-primary)',
};

export const ForgotPassword = {
  fontSize: '14px',
  fontWeight: '600',
  color: 'var(--kt-green-primary)',
  textDecoration: 'none',
  cursor: 'pointer',
};

export const SignInButton = {
  width: '100%',
  padding: '12px',
  backgroundColor: 'var(--kt-green-primary)',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  marginBottom: 'var(--space-6)',
};

export const DividerRow = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: 'var(--space-6)',
};

export const DividerLine = {
  flex: 1,
  height: '1px',
  backgroundColor: 'var(--border-color)',
};

export const DividerText = {
  margin: '0 var(--space-4)',
  fontSize: '12px',
  color: 'var(--text-muted)',
};

export const GoogleButton = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  width: '100%',
  padding: '12px',
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-md)',
  fontSize: '15px',
  fontWeight: '500',
  color: 'var(--text-color)',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  marginBottom: 'var(--space-8)',
};

export const RegisterRow = {
  textAlign: 'center',
  fontSize: '14px',
  color: 'var(--text-secondary)',
};

export const RegisterLink = {
  fontWeight: '600',
  color: 'var(--kt-green-primary)',
  textDecoration: 'none',
  cursor: 'pointer',
  marginLeft: 'var(--space-1)',
};