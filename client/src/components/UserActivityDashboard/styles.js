export const DefaultStyle = {
    display: 'flex',
    flexDirection: 'row',
    fontFamily: 'inherit',
    alignItems: 'flex-start',
    textAlign: 'center',
    backgroundColor: 'var(--bg-color)',
    minHeight: '100vh',
};

export const RightSide = {  
    display: 'flex',
    overflow: 'auto',
    width: '100%',
};

export const Container = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minWidth: '290px',
    width: '90%',
    maxWidth: '1200px',
    borderRadius: 'var(--radius-xl)',
    backgroundColor: 'var(--card-bg)',
    padding: 'var(--space-6) 5vw',
    margin: 'var(--space-10) auto',
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--border-color)',
    boxSizing: 'border-box',
};

export const SearchBar = {
    width: '100%',
    maxWidth: '500px',
    padding: '10px 16px',
    margin: '20px 0',
    border: '1px solid var(--input-border)',
    borderRadius: 'var(--radius-md)',
    fontSize: '16px',
    backgroundColor: 'var(--input-bg)',
    color: 'var(--text-color)',
    outline: 'none',
    transition: 'border-color 0.2s',
};

export const Header = {
    fontSize: '32px',
    fontWeight: '700',
    display: 'flex',
    color: 'var(--text-color)',
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
};

export const ButtonDivStyle = {
    fontFamily: 'inherit',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
};

export const PlusButton = {
    width: '40px',
    height: '40px',
    margin: '10px',
    cursor: 'pointer',
    position: 'absolute',
    right: '20px',
    bottom: '60px',
    filter: 'drop-shadow(var(--shadow-md))',
};

export const ListStyle = {
  listStyleType: 'none',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  padding: '0'
};