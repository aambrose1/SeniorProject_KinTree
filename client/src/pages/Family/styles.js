import { text } from "d3"

export const DefaultStyle = {
    display: 'flex',
    flexDirection: 'row',
    textAlign: 'center',
    fontFamily: 'Alata'
}

export const SubtitleContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '90%',   
    padding: '0px 20px',
    marginTop: '20px'
}

export const SubtitleStyle = {
    fontFamily: 'Aboreto',
    margin: '0px'
}

export const ContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '92%',
    maxWidth: '1000px',
    minHeight: '85vh',
    borderRadius: 'var(--radius-xl)',
    backgroundColor: 'var(--card-bg)',
    padding: 'var(--space-8)',
    margin: 'var(--space-6) auto',
    boxShadow: 'var(--shadow-premium)',
    animation: 'animate-in var(--timing-smooth) forwards'
}

export const MemberLinkStyle = {
    margin: '0px 10px',
}

export const AvatarStyle = {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    margin: '0 10px',
}

export const MemberStyle = {
    backgroundColor: 'var(--bg-color)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    width: '100%',
    maxWidth: '800px',
    margin: 'var(--space-2) 0',
    padding: 'var(--space-4) var(--space-6)',
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    transition: 'all var(--timing-standard)',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-sm)'
}

export const MemberListStyle = {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    width: '100%',
    gap: 'var(--space-2)',
    marginTop: 'var(--space-6)',
    overflow: 'auto',
    padding: 'var(--space-2)'
}

export const DropdownButtonStyle = {
    backgroundColor: '#faf9f6',
    borderRadius: '10px',
    border: 'none',
    margin: '10px',
    cursor: 'pointer',
    fontFamily: 'Alata',
    marginBottom: '0px',
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'flex-end'
}

export const DropdownSelectorStyle = {
    fontFamily: 'Alata',
    width: 'fit-content',
    display: 'flex',
    flexDirection: 'column',
}