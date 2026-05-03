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
    minWidth: '320px',
    width: '95%',
    maxWidth: '1000px',
    borderRadius: 'var(--radius-xl)',
    backgroundColor: 'var(--card-bg)',
    padding: 'var(--space-10) var(--space-8)',
    margin: 'var(--space-10) auto',
    boxShadow: 'var(--shadow-premium)',
    border: '1px solid var(--border-color)',
    boxSizing: 'border-box',
    animation: 'animate-in var(--timing-smooth) forwards',
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
    fontSize: '2.5rem',
    fontWeight: '800',
    color: 'var(--kt-green-primary)',
    marginBottom: 'var(--space-2)',
    fontFamily: 'Aboreto',
};

export const ActionRow = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 'var(--space-4)',
    margin: 'var(--space-4) 0',
};

export const SortButton = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-2) var(--space-4)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--card-bg)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all var(--timing-standard)',
};

export const PlusButton = {
    width: '60px',
    height: '60px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--kt-green-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'fixed',
    right: '40px',
    bottom: '40px',
    boxShadow: 'var(--shadow-premium)',
    transition: 'all var(--timing-standard)',
    zIndex: '100',
};

export const ListStyle = {
  listStyleType: 'none',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  padding: '0'
};