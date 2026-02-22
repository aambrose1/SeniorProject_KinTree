export const DefaultStyle = {
    display: 'flex',
    flexDirection: 'row',
    textAlign: 'center',
    fontFamily: 'Alata'
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
    // position: 'absolute', // needed for arrows to work, temporarily removed to make header work properly to left of tree
    top: '0', 
    left: '0', 
    zIndex: '1', 
    overflow: 'hidden', 
    alignItems: 'center', 
    justifyContent: 'flex-start', 
    display: 'flex', 
    margin: '3% 14%',
}

export const TopRightArrowStyle = {
    width: '370px', 
    height: '370px', 
    margin: '20px 20px', 
    flex: '50%', 
    textAlign: 'right', 
    paddingLeft: '70%'
}

export const BottomLeftArrowStyle = {
    width: '370px', 
    height: '370px', 
    margin: '20px 20px', 
    flex: '50%', 
    paddingRight: '70%'
}

export const HeaderStyle = {
    display: 'flex',
    width: '20%', 
    marginLeft: '9%',
    marginRight: '10%',
    marginBottom: '5%',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: '-1'
}

export const FamilyTreeContainerStyle = { 
    width: '80%', 
    height: '90vh', 
    margin: 'auto',
    borderStyle: 'double', 
    // maxWidth: '800px', 
    borderRadius: '30px' 
}