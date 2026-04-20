export const DefaultStyle = {
    display: 'flex',
    flexDirection: 'row',
    padding: '10px',
    fontFamily: 'Alata',
    alignItems: 'center',
    width: '100%',
  }

  export const ContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '90%',
    maxWidth: '600px',
    borderRadius: 'var(--radius-xl)',
    backgroundColor: 'var(--card-bg)',
    padding: 'var(--space-10) var(--space-8)',
    boxShadow: 'var(--shadow-premium)',
    border: '1px solid var(--border-color)',
    marginTop: '5vh',
    animation: 'animate-in var(--timing-smooth) forwards'
}

export const ItemStyle = {
    margin: 'var(--space-2) 0',
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: 'var(--surface-alt)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-4) var(--space-6)',
    alignItems: 'center',
    transition: 'all var(--timing-standard)',
};

export const ListStyle = {
    listStyleType: 'none',
    fontFamily: 'Alata',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '80%',
    padding: '0'
  };

export const RightSide = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
};