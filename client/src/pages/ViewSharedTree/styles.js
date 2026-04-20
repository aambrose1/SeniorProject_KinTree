export const DefaultStyle = {
  display: 'flex',
  flexDirection: 'row',
  textAlign: 'center',
  fontFamily: 'inherit',
  backgroundColor: 'var(--bg-color)',
  minHeight: '100vh'
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
  width: '100%', 
  height: '100%', 
  top: '0', 
  left: '0', 
  zIndex: '1', 
  overflow: 'hidden', 
  alignItems: 'center', 
  justifyContent: 'flex-start', 
  display: 'flex', 
  margin: 'var(--space-6) 14%',
}

export const TopRightArrowStyle = {
  width: '370px', 
  height: '370px', 
  margin: 'var(--space-5) var(--space-5)', 
  flex: '50%', 
  textAlign: 'right', 
  paddingLeft: '70%'
}

export const BottomLeftArrowStyle = {
  width: '370px', 
  height: '370px', 
  margin: 'var(--space-5) var(--space-5)', 
  flex: '50%', 
  paddingRight: '70%'
}

export const HeaderStyle = {
  display: 'flex',
  width: '20%', 
  marginLeft: '9%',
  marginRight: '10%',
  marginBottom: 'var(--space-5)',
  flexDirection: 'column',
  alignItems: 'center',
  zIndex: '-1'
}

export const FamilyTreeContainerStyle = { 
  width: '80%', 
  height: '90vh', 
  borderStyle: 'double', 
  margin: 'auto',
  borderRadius: 'var(--radius-xl)',
  backgroundColor: 'var(--card-bg)',
  boxShadow: 'var(--shadow-lg)',
  borderColor: 'var(--border-color)'
}