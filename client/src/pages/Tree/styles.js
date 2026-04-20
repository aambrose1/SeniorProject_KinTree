export const DefaultStyle = {
    display: 'flex',
    flexDirection: 'row',
    textAlign: 'center',
    fontFamily: 'inherit',
    backgroundColor: 'var(--bg-color)',
    minHeight: '100vh'
}

export const ButtonStyle = {
    fontFamily: 'inherit',
    backgroundColor: 'var(--kt-green-primary)',
    color: 'white',
    borderRadius: 'var(--radius-full)',
    border: 'none',
    padding: '12px 30px',
    margin: 'var(--space-2)',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s',
    boxShadow: 'var(--shadow-sm)',
}

export const ArrowContainerStyle = {
    display: 'flex', 
    flexWrap: 'wrap', 
    zIndex: '-1', 
    position: 'relative', 
    width: '100%', 
    height: '100%'
}

export const MainContainerStyle = {
    flex: 1,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: 'var(--space-8)',
    backgroundColor: 'var(--bg-color)',
    marginLeft: '220px', // width of navbar
    boxSizing: 'border-box',
}

export const HeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--space-6)',
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto var(--space-6) auto',
}

export const FamilyTreeContainerStyle = { 
    flex: 1,
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    border: '1px solid var(--border-color)', 
    borderRadius: 'var(--radius-xl)',
    backgroundColor: 'var(--card-bg)',
    boxShadow: 'var(--shadow-premium)',
    overflow: 'hidden',
    position: 'relative',
    animation: 'animate-in var(--timing-smooth) forwards'
}