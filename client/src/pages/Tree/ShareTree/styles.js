export const DefaultStyle = {
    display: 'flex',
    flexDirection: 'row',
    minHeight: '100vh',
    fontFamily: 'inherit',
    backgroundColor: 'var(--bg-color)',
    width: '100%',
}

export const ContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '90%',
    maxWidth: '650px',
    height: 'auto',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: 'var(--card-bg)',
    padding: 'var(--space-8)',
    boxShadow: 'var(--shadow-lg)',
    marginTop: 'var(--space-10)',
    border: '1px solid var(--border-color)',
}

export const FormStyle = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    marginTop: 'var(--space-4)',
}

export const ListStyle = {
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    padding: '0',
    gap: 'var(--space-4)',
};

export const ItemStyle = {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
};

export const LabelStyle = {
    fontWeight: '600',
    color: 'var(--text-color)',
    fontSize: '0.9rem',
    marginLeft: 'var(--space-1)',
};

export const InputStyle = {
    width: '100%',
    padding: 'var(--space-3) var(--space-4)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--input-border)',
    backgroundColor: 'var(--input-bg)',
    fontFamily: 'inherit',
    fontSize: '1rem',
    color: 'var(--text-color)',
    transition: 'all var(--timing-standard)',
    boxSizing: 'border-box',
};

export const TextAreaStyle = {
    ...InputStyle,
    height: '100px',
    resize: 'none',
    lineHeight: '1.5',
};

export const ListingStyle = {
    padding: 'var(--space-3) var(--space-4)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    backgroundColor: 'var(--surface-alt)',
    transition: 'all var(--timing-standard)',
    boxSizing: 'border-box',
}

export const AddOptionsStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
    width: '100%',
    marginTop: 'var(--space-2)',
    maxHeight: '250px',
    overflowY: 'auto',
    paddingRight: 'var(--space-2)',
}

export const RightSide = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 'var(--space-10)',
};