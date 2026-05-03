export const DefaultStyle = {
  display: 'flex',
  flexDirection: 'column',
  fontFamily: 'inherit',
  alignItems: 'center',
  backgroundColor: 'var(--bg-color)',
  width: '100%',
  minHeight: '100vh',
};

export const Container = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  minWidth: '290px',
  width: '100%',
  maxWidth: '480px',
  borderRadius: 'var(--radius-xl)',
  backgroundColor: 'var(--card-bg)',
  padding: 'var(--space-8) var(--space-10)',
  marginTop: 'var(--space-10)',
  boxShadow: 'var(--shadow-lg)',
  border: '1px solid var(--border-color)',
  boxSizing: 'border-box',
};

export const Logo = {
  width: '100px',
  height: 'auto',
  marginBottom: 'var(--space-4)',
};

export const ListStyle = {
  listStyleType: 'none',
  fontFamily: 'inherit',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  padding: '0',
};

export const FormStyle = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

export const ItemStyle = {
  margin: 'var(--space-3) 0',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
};

export const FieldStyle = {
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--input-border)',
  width: '100%',
  height: '40px',
  padding: '0 var(--space-3)',
  backgroundColor: 'var(--input-bg)',
  color: 'var(--text-color)',
  boxShadow: 'var(--shadow-sm)',
  marginTop: 'var(--space-1)',
  outline: 'none',
  transition: 'border-color 0.2s',
};

export const Header = {
  margin: '0',
  color: 'var(--text-color)',
  fontSize: '24px',
  fontWeight: '700',
  marginBottom: 'var(--space-2)',
};

export const ButtonStyle = {
  fontFamily: 'inherit',
  backgroundColor: 'var(--kt-green-primary)',
  color: 'white',
  borderRadius: 'var(--radius-md)',
  border: 'none',
  padding: '12px 24px',
  margin: 'var(--space-4) 0',
  cursor: 'pointer',
  width: '100%',
  fontWeight: '600',
  fontSize: '16px',
  transition: 'background-color 0.2s',
};

export const WhiteButtonStyle = {
  fontFamily: 'inherit',
  backgroundColor: 'var(--card-bg)',
  color: 'var(--text-color)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-color)',
  margin: 'var(--space-2) 0',
  cursor: 'pointer',
  width: '100%',
  padding: '12px 24px',
  fontWeight: '600',
  fontSize: '16px',
  transition: 'all 0.2s',
};

export const ButtonDivStyle = {
  fontFamily: 'inherit',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
};

export const TextStyle = {
  margin: '0',
  fontSize: '14px',
  textAlign: 'center',
  color: 'var(--text-secondary)',
};

export const LinkStyle = {
  color: 'var(--kt-green-primary)',
  textDecoration: 'none',
  fontWeight: '600',
};