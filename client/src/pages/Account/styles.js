export const DefaultStyle = {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'inherit',
    backgroundColor: 'var(--bg-color)',
    minHeight: '100vh'
};

export const RightSide = {
    display: 'flex',
    justifyContent: 'center',
    padding: 'var(--space-10) 0 var(--space-8) 0'
};

export const ContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    width: '92%',
    maxWidth: '980px',
    gap: 'var(--space-6)'
};

export const HeaderStyle = {
    fontFamily: '"Aboreto", sans-serif',
    margin: '0px',
    fontSize: '32px',
    color: 'var(--text-color)'
};

export const HeadingContentStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: 'var(--space-5)',
    padding: '0 var(--space-6)'
};

export const HeaderDivider = {
    width: '100%',
    border: '0',
    borderTop: '1px solid var(--border-color)',
    margin: '0'
};

export const PageHeader = {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 'var(--space-6)'
};

export const PageHeaderCopy = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)'
};

export const PageTagline = {
    margin: 0,
    fontSize: '14px',
    color: 'var(--text-secondary)'
};

export const PageLocation = {
    margin: 0,
    fontSize: '14px',
    color: 'var(--text-muted)'
};

export const GreenButtonStyle = {
    fontFamily: 'inherit',
    backgroundColor: 'var(--kt-green-primary)',
    color: 'white',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    padding: '10px 20px',
    margin: '5px 0',
    cursor: 'pointer',
    width: 'auto',
    minWidth: '140px',
    height: '42px',
    fontWeight: '600',
    transition: 'background-color 0.2s'
}

export const DisabledGreenButtonStyle = {
    ...GreenButtonStyle,
    backgroundColor: 'var(--text-muted)',
    cursor: 'not-allowed',
    opacity: 0.6
}

export const ButtonGroupStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 'var(--space-2)',
    margin: 'var(--space-2) 0'
};

export const FieldStyle = {
    fontFamily: 'inherit',
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--input-border)',
    backgroundColor: 'var(--input-bg)',
    color: 'var(--text-color)',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    outline: 'none'
}

export const CardStyle = {
    width: '100%',
    backgroundColor: 'var(--card-bg)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-color)',
    padding: 'var(--space-6) var(--space-8)',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-5)',
    boxSizing: 'border-box'
};

export const CardHeader = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 'var(--space-3)'
};

export const CardTitle = {
    margin: 0,
    fontFamily: 'inherit',
    fontSize: '20px',
    color: 'var(--text-color)',
    fontWeight: '600'
};

export const CardSubtitle = {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: 'var(--text-muted)',
    fontFamily: 'inherit'
};

export const EditButton = {
    fontFamily: 'inherit',
    backgroundColor: 'transparent',
    color: 'var(--kt-green-primary)',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--kt-green-primary)',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
};

export const ProfileCardBody = {
    display: 'flex',
    flexDirection: 'row',
    gap: 'var(--space-6)',
    flexWrap: 'wrap',
    alignItems: 'center'
};

export const AvatarBlock = {
    display: 'flex',
    gap: 'var(--space-4)',
    alignItems: 'center'
};

export const AvatarWrapper = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)',
    alignItems: 'center'
};

export const AvatarImage = {
    width: '96px',
    height: '96px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '4px solid var(--kt-green-primary)'
};

export const AvatarFallback = {
    width: '96px',
    height: '96px',
    borderRadius: '50%',
    backgroundColor: 'var(--kt-green-light)',
    color: 'var(--kt-green-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '34px',
    fontWeight: '600'
};

export const AvatarAction = {
    fontFamily: 'inherit',
    padding: '7px 16px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--kt-green-primary)',
    backgroundColor: 'var(--card-bg)',
    color: 'var(--kt-green-primary)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
};

export const ProfileSummary = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
    minWidth: '220px'
};

export const ProfileName = {
    margin: 0,
    fontFamily: 'inherit',
    fontSize: '26px',
    color: 'var(--text-color)',
    fontWeight: '600'
};

export const ProfileMeta = {
    display: 'flex',
    gap: 'var(--space-2)',
    flexWrap: 'wrap',
    color: 'var(--text-secondary)',
    fontSize: '15px',
    fontFamily: 'inherit'
};

export const HeaderActionGroup = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)'
};

export const PrimaryButton = {
    fontFamily: 'inherit',
    backgroundColor: 'var(--kt-green-primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    padding: '8px 18px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background-color 0.2s'
};

export const TertiaryButton = {
    fontFamily: 'inherit',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s'
};

export const SecondaryButton = {
    fontFamily: 'inherit',
    backgroundColor: 'var(--kt-green-light)',
    color: 'var(--kt-green-primary)',
    border: '1px solid var(--kt-green-primary)',
    borderRadius: 'var(--radius-md)',
    padding: '8px 18px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
};

export const DangerButton = {
    fontFamily: 'inherit',
    backgroundColor: 'var(--kt-danger)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
};

export const FormGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 'var(--space-4)'
};

export const FieldColumn = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)'
};

export const FieldColumnFull = {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)'
};

export const FieldLabel = {
    fontFamily: 'inherit',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    fontWeight: '500'
};

export const ReadOnlyGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 'var(--space-4)'
};

export const ReadOnlyColumn = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)'
};

export const ReadOnlyColumnFull = {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)'
};

export const ReadOnlyLabel = {
    fontFamily: 'inherit',
    fontSize: '13px',
    color: 'var(--text-muted)'
};

export const ReadOnlyValue = {
    fontFamily: 'inherit',
    fontSize: '15px',
    color: 'var(--text-color)'
};

export const SecurityContent = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 'var(--space-4)'
};

export const SecurityBlock = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)',
    padding: '4px 0'
};

export const SecurityHeadingRow = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--space-3)'
};

export const SecurityTitle = {
    margin: 0,
    fontFamily: 'inherit',
    fontSize: '18px',
    color: 'var(--text-color)',
    fontWeight: '600'
};

export const HelpText = {
    margin: 0,
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: 1.5
};

export const StatusPillBase = {
    fontFamily: 'inherit',
    fontSize: '12px',
    padding: '4px 10px',
    borderRadius: 'var(--radius-full)',
    fontWeight: '600'
};

export const StatusPillSuccess = {
    ...StatusPillBase,
    backgroundColor: 'rgba(6, 95, 70, 0.1)',
    color: 'var(--kt-success)',
    border: '1px solid var(--kt-success)'
};

export const StatusPillMuted = {
    ...StatusPillBase,
    backgroundColor: 'var(--surface-alt)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)'
};

export const SecurityActions = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-2)',
    alignItems: 'center'
};

export const SecuritySteps = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)'
};

export const TotpQr = {
    width: '140px',
    height: '140px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff'
};

export const DangerNote = {
    margin: 0,
    fontSize: '13px',
    color: 'var(--kt-danger)',
    lineHeight: 1.5
};

export const ErrorBanner = {
    color: 'var(--kt-danger)',
    backgroundColor: 'rgba(180, 35, 24, 0.1)',
    padding: 'var(--space-3)',
    borderRadius: 'var(--radius-md)',
    fontSize: '13px',
    border: '1px solid var(--kt-danger)'
};

export const SuccessBanner = {
    color: 'var(--kt-success)',
    backgroundColor: 'rgba(6, 95, 70, 0.1)',
    padding: 'var(--space-3)',
    borderRadius: 'var(--radius-md)',
    fontSize: '13px',
    border: '1px solid var(--kt-success)'
};

export const ModalOverlay = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
};

export const ModalContent = {
    backgroundColor: 'var(--card-bg)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-8)',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-5)',
    border: '1px solid var(--border-color)'
};

export const ModalTitle = {
    margin: 0,
    fontFamily: 'inherit',
    fontSize: '24px',
    color: 'var(--text-color)',
    fontWeight: '700'
};

export const ModalMessage = {
    margin: 0,
    fontFamily: 'inherit',
    fontSize: '15px',
    color: 'var(--text-secondary)',
    lineHeight: 1.6
};

export const ModalWarning = {
    margin: 0,
    fontFamily: 'inherit',
    fontSize: '14px',
    color: 'var(--kt-danger)',
    fontWeight: '600',
    marginTop: '8px'
};

export const ModalList = {
    margin: 0,
    paddingLeft: '24px',
    fontFamily: 'inherit',
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: 1.8
};

export const ModalActions = {
    display: 'flex',
    gap: 'var(--space-3)',
    justifyContent: 'flex-end',
    marginTop: 'var(--space-2)'
};