export const DefaultStyle = {
    fontFamily: 'Alata',
};

export const FieldStyle = {
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--input-border)',
    backgroundColor: 'var(--input-bg)',
    color: 'var(--text-color)',
    padding: 'var(--space-2) var(--space-3)',
    fontFamily: 'inherit',
    transition: 'border-color var(--timing-fast)'
};

export const DateFieldStyle = {
    borderRadius: '5px',
    border: '1px solid #000000',
    marginLeft: '10px',
    width: '147px',
    fontFamily: 'Alata'
};

export const ListStyle = {
    listStyleType: 'none',
    fontFamily: 'Alata',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0px'
};

export const ButtonDivStyle = {
    fontFamily: 'Alata',
    display: 'flex',
    justifyContent: 'center',
};

export const ButtonStyle = {
    fontFamily: 'inherit',
    backgroundColor: 'var(--kt-green-primary)',
    color: 'white',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    padding: '10px 30px',
    margin: 'var(--space-2)',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all var(--timing-standard)',
    boxShadow: 'var(--shadow-sm)'
};

export const GrayButtonStyle = {
    fontFamily: 'inherit',
    backgroundColor: 'var(--surface-alt)',
    color: 'var(--text-secondary)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all var(--timing-standard)',
};

export const FormStyle = {
    paddingTop: '0px',
    minWidth: '360px',
};

export const ItemStyle = {
    margin: '10px 0px'
};

export const FileUploadDefault = {
    display: 'none'
};

export const TitleDateSection = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%'
};

export const TextAreaStyle = {
    borderRadius: '5px',
    border: '1px solid #000000',
    width: '100%',
    height: '100%',
    fontFamily: 'Alata',
    boxSizing: 'border-box',
};

export const EventsContainer = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
    fontFamily: 'inherit',
    color: 'var(--text-color)',
};

export const EventCard = {
    backgroundColor: 'var(--card-bg)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-5)',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-md)',
    fontFamily: 'inherit',
    transition: 'transform var(--timing-standard), box-shadow var(--timing-standard)',
    cursor: 'pointer',
    animation: 'animate-in var(--timing-smooth) forwards'
};

export const EventTitle = {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--kt-green-primary)',
    fontFamily: 'inherit',
};

export const EventMeta = {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginTop: 'var(--space-1)',
    fontFamily: 'inherit',
};

// --- MOVED FROM ACTIVITYDASHBOARD STYLES ---

export const SearchBar = {
    width: '100%',
    maxWidth: '500px',
    padding: '12px 20px',
    margin: 'var(--space-6) 0',
    border: '2px solid var(--border-color)',
    borderRadius: 'var(--radius-full)',
    fontSize: '1rem',
    backgroundColor: 'var(--input-bg)',
    color: 'var(--text-color)',
    outline: 'none',
    transition: 'all var(--timing-standard)',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
};

export const CardContainer = {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    width: '100%',
    maxWidth: '600px',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: 'var(--card-bg)',
    padding: 'var(--space-6) var(--space-8)',
    boxShadow: 'var(--shadow-md)',
    border: '1px solid var(--border-color)',
    boxSizing: 'border-box',
    animation: 'animate-in var(--timing-smooth) forwards',
    transition: 'transform var(--timing-standard)',
};

export const TextStyle = {
    margin: '10px 0',
    fontSize: '0.9em',
    textAlign: 'center',
    whiteSpace: 'pre-wrap',
    lineHeight: '1.5',
    wordBreak: 'break-word'
};

export const Divider = {
    width: '80%',
    height: '1px',
    backgroundColor: '#000000',
    opacity: '0.2',
    margin: '10px auto',
    border: 'none'
};

export const ToggleText = {
    color: '#3a5a40',
    cursor: 'pointer',
    fontSize: '0.85em',
    fontWeight: 'bold',
    marginTop: '5px',
    textDecoration: 'underline'
};