export const DefaultStyle = {
    fontFamily: 'inherit',
    color: 'var(--text-color)',
};

export const FieldStyle = {
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--surface-alt)',
    color: 'var(--text-color)',
    padding: 'var(--space-2) var(--space-4)',
    marginLeft: 'var(--space-2)',
    outline: 'none',
    fontFamily: 'inherit',
    fontSize: '0.95rem',
    transition: 'all var(--timing-standard)',
    width: '100%',
    boxSizing: 'border-box',
};

export const SelectStyle = {
    ...FieldStyle,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.7rem center',
    backgroundSize: '1rem',
    paddingRight: '2.5rem',
};

export const ListStyle = {
    listStyleType: 'none',
    fontFamily: 'inherit',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    marginRight: '15%',
    width: '100%',
};

export const ButtonDivStyle = {
    fontFamily: 'inherit',
    display: 'flex',
    justifyContent: 'center',
    gap: 'var(--space-3)',
    marginTop: 'var(--space-4)',
}

export const ButtonStyle = {
    fontFamily: 'inherit',
    backgroundColor: 'var(--kt-green-primary)',
    color: 'white',
    borderRadius: 'var(--radius-full)',
    border: 'none',
    padding: '10px 30px',
    margin: 'var(--space-2)',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.2s',
}

export const GrayButtonStyle = {
    fontFamily: 'inherit',
    backgroundColor: 'var(--surface-alt)',
    color: 'var(--text-color)',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--border-color)',
    padding: '10px 20px',
    margin: 'var(--space-2)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: 'var(--shadow-sm)',
    fontWeight: '500',
    transition: 'all 0.2s',
}

export const FormStyle = {
    padding: 'var(--space-4)',
    paddingTop: '0px',
    minWidth: '360px',
    width: '100%',
}

export const ItemStyle = {
    margin: 'var(--space-3) 0px',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)',
}

export const DateFieldStyle = {
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--input-border)',
    backgroundColor: 'var(--input-bg)',
    color: 'var(--text-color)',
    marginLeft: 'var(--space-2)',
    width: '150px',
    padding: 'var(--space-1) var(--space-2)',
    fontFamily: 'inherit',
    outline: 'none',
};


export const MainContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    padding: 'var(--space-6)',
    paddingTop: '0px',
    alignItems: 'center',
    minWidth: '360px',
    minHeight: '150px',
    justifyContent: 'space-between',
    backgroundColor: 'var(--card-bg)',
}

export const AddOptionsStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
    padding: 'var(--space-3)',
    fontFamily: 'inherit',
    marginTop: 'var(--space-3)',
    height: '250px',
    overflow: 'auto',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
}

export const ListingStyle = {
    padding: 'var(--space-3)', 
    border: '1px solid var(--border-color)', 
    width: '100%',
    marginBottom: 'var(--space-2)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--surface-alt)',
}