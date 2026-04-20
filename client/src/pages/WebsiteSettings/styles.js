export const DefaultStyle = {
  fontFamily: 'inherit',
  textAlign: 'left',
  backgroundColor: 'var(--bg-color)',
  minHeight: '100vh',
  color: 'var(--text-color)',
}

export const RightSide = {
  display: 'flex',
  padding: 'var(--space-6)',
  flexDirection: 'column',
  width: '100%',
  alignItems: 'center',
}

export const SettingsContainer = {
  width: '100%',
  maxWidth: '800px',
  margin: '0 auto',
  padding: 'var(--space-8)',
  background: 'var(--card-bg)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-lg)',
  fontFamily: 'inherit',
  color: 'var(--text-color)',
  transition: 'background-color 0.3s ease, color 0.3s ease',
  border: '1px solid var(--border-color)',
};

export const Section = {
  marginBottom: 'var(--space-6)',
  paddingBottom: 'var(--space-4)',
  borderBottom: '1px solid var(--border-color)',
};

export const Title = {
  textAlign: 'left',
  color: 'var(--text-color)',
  fontFamily: '"Aboreto", sans-serif',
  fontSize: '28px',
  margin: '0 0 var(--space-6) 0',
};

export const SubTitle = {
  color: 'var(--text-secondary)',
  marginBottom: 'var(--space-2)',
  fontSize: '18px',
  fontWeight: '600',
};

export const Button = {
  fontFamily: 'inherit',
  backgroundColor: 'var(--kt-green-primary)',
  color: 'white',
  borderRadius: 'var(--radius-md)',
  border: 'none',
  padding: '10px 20px',
  margin: 'var(--space-2) var(--space-2) var(--space-2) 0px',
  cursor: 'pointer',
  fontWeight: '600',
  transition: 'background-color 0.2s',
};

export const Input = {
  width: '100%',
  maxWidth: '400px',
  padding: '10px 14px',
  marginTop: 'var(--space-1)',
  border: '1px solid var(--input-border)',
  borderRadius: 'var(--radius-sm)',
  backgroundColor: 'var(--input-bg)',
  color: 'var(--text-color)',
  outline: 'none',
  transition: 'all 0.2s ease'
};

export const ToggleSwitchContainer = {
  position: 'relative',
  display: 'inline-block',
  width: '50px',
  height: '24px'
};

export const ToggleSwitch = {
  opacity: 0,
  width: 0,
  height: 0,
  position: 'absolute'
};

export const ToggleSwitchSlider = {
  position: 'absolute',
  cursor: 'pointer',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'var(--border-color)',
  transition: '0.3s',
  borderRadius: '24px',
};

export const SignOutContainer = {
  display: 'flex',
  justifyContent: 'flex-end',
  padding: 'var(--space-6) 0',
  marginTop: 'var(--space-8)',
  borderTop: '1px solid var(--border-color)'
};

export const SignOutButton = {
  backgroundColor: 'var(--kt-danger)',
  color: 'white',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  padding: '12px 24px',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
  boxShadow: 'var(--shadow-md)',
  transition: 'all 0.2s ease',
  minWidth: '120px'
};

export const SignOutButtonHover = {
  backgroundColor: '#c82333',
  boxShadow: '0 4px 8px rgba(220, 53, 69, 0.3)'
};