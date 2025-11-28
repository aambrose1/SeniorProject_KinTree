export const DefaultStyle = {
  fontFamily: 'Alata',
  textAlign: 'left',
}

export const RightSide = {
  display: 'flex',
  padding: '2%'
}

export const SettingsContainer = {
  width: '60%',
  margin: 'auto',
  padding: '20px',
  background: 'var(--card-bg, #f9f9f9)',
  borderRadius: '10px',
  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
  fontFamily: 'Alata',
  color: 'var(--text-color, #333)',
  transition: 'background-color 0.3s ease, color 0.3s ease'
};

export const Section = {
  marginBottom: '20px',
  padding: '15px',
  borderBottom: '1px solid var(--border-color, #ddd)',
};

export const Title = {
  textAlign: 'left',
  color: 'var(--text-color, #333)',
  fontFamily: 'Aboreto',
  marginLeft: '10px',
};

export const SubTitle = {
  color: 'var(--text-color, #444)',
  marginBottom: '10px'
};

export const Button = {
  fontFamily: 'Alata',
  backgroundColor: '#3a5a40',
  color: 'white',
  borderRadius: '10px',
  border: 'none',
  padding: '10px 20px',
  margin: '10px 10px 10px 0px',
  cursor: 'pointer',
  width: '20%',
  minWidth: '145px',
  height: '45px'
};

export const Input = {
  width: '70%',
  padding: '8px',
  marginTop: '5px',
  marginLeft: '10px',
  border: '1px solid var(--input-border, #ccc)',
  borderRadius: '5px',
  backgroundColor: 'var(--input-bg, #ffffff)',
  color: 'var(--text-color, #000)',
  transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease'
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
  backgroundColor: '#ccc',
  transition: '0.3s',
  borderRadius: '24px',
  '&:before': {
    position: 'absolute',
    content: '""',
    height: '18px',
    width: '18px',
    left: '3px',
    bottom: '3px',
    backgroundColor: 'white',
    transition: '0.3s',
    borderRadius: '50%'
  }
};

export const SignOutContainer = {
  display: 'flex',
  justifyContent: 'flex-end',
  padding: '20px',
  marginTop: '30px',
  borderTop: '1px solid var(--border-color, #e0e0e0)'
};

export const SignOutButton = {
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  padding: '12px 24px',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
  boxShadow: '0 2px 4px rgba(220, 53, 69, 0.2)',
  transition: 'all 0.2s ease',
  minWidth: '120px'
};

export const SignOutButtonHover = {
  backgroundColor: '#c82333',
  boxShadow: '0 4px 8px rgba(220, 53, 69, 0.3)'
};