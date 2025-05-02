import React from 'react';
import * as styles from './styles';
// import { ReactComponent as TreeIcon } from '../../assets/background-tree.svg'; // background tree image from Figma; TODO configure overlay with tree svg
import f3 from 'family-chart';
import './tree.css'; // styling adapted from family-chart package sample code
import { ReactComponent as PlusSign } from '../../assets/plus-sign.svg';
// import { ReactComponent as ArrowTR } from '../../assets/arrow-1.svg';
// import { ReactComponent as ArrowBL } from '../../assets/arrow-2.svg';
import AddFamilyMemberPopup from '../../components/AddFamilyMember/AddFamilyMember';
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import { useLocation, Outlet } from 'react-router-dom';

// FamilyTree class structure derived from family-chart package sample code
// see https://github.com/donatso/family-chart/

class FamilyTree extends React.Component {
    cont = React.createRef();
  
    componentDidMount() {
        if (!this.cont.current) {
            console.log("failure");
            return;
        }
        console.log("success");

        function create(data) {
            const f3Chart = f3.createChart('#FamilyChart', data)
                .setTransitionTime(0)
                .setCardXSpacing(250)
                .setCardYSpacing(150)
                .setOrientationVertical()
                .setSingleParentEmptyCard(false)
            
            const f3Card = f3Chart.setCard(f3.CardHtml)
                // can edit displayed fields here
                .setCardDisplay([["first name"],[]])
                .setCardDim({"width":80,"height":80})
                .setMiniTree(false)
                .setStyle('imageCircle')
                .setOnHoverPathToMain()
            
            // remove zooming transitions
            f3Card.setOnCardClick((e, d) => {})
            
            f3Chart.updateMainId("21");
            f3Chart.updateTree({initial: true})
        }

        let getRequestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };

        fetch(`http://localhost:5000/api/tree-info/16`, getRequestOptions) // need to fix DB to retrieve by user ID
            .then(async(response) => {
                if (response.ok) {
                    let treeData = await response.json();
                    console.log(treeData.object);
                    parsedData = treeData.object;
                    console.log(parsedData);
                    // make all visible
                    // for (let i = 0; i < parsedData.length; i++) {
                    //     parsedData[i].main = true;
                    // }
                    create(parsedData);
                }
                else {
                    // print message in return body
                    console.error('Error:', response);
                }
            });
    }
  
    render() {
      return <div className="f3 f3-cont" id="FamilyChart" ref={this.cont}></div>;
    }
  }

let parsedData = [];

var userId = 23; // todo will retrieve this from a service or something

// builds the actual page
function Tree() {
    const location = useLocation();
    const isTreePage = location.pathname === '/tree';
    let user_lastname = "Smith";
    document.body.style.overflow = 'hidden';
    document.body.style.width = '100%'; 
    return (
        <div style={styles.DefaultStyle}>
            <NavBar />
            {/* TODO make these work again, removed them for now so I could work with the header placement; might want to integrate these with actual background somehow */}
            {/* <div style={styles.ArrowContainerStyle}>
                <div style={{flex: '50%'}}></div>
                <ArrowTR style={styles.TopRightArrowStyle} />
                <ArrowBL style={styles.BottomLeftArrowStyle} />
                <div style={{flex: '50%', textAlign: 'right'}}></div>
            </div>  */}
            {isTreePage ? (

            <div style={styles.MainContainerStyle} className="main-container">
                {/* <Link to="/" style={{ position: 'absolute', top: '0px', left: '0px', margin: '10px' }}>Home</Link> */}
                

                {/* header content */}
                <div style={styles.HeaderStyle}>
                    {/* titles */}
                    <div>
                        <h1 style={{marginBottom: "0px"}}>Your Tree</h1>
                        <hr  style={{
                            color: '#000000',
                            backgroundColor: '#000000',
                            height: .1,
                            width: '200px',
                            borderColor : '#000000'
                        }}/>
                        <h2 style={{fontFamily: "Aboreto", marginTop: "0px"}}>The {user_lastname} Family</h2> 
                    </div>
                    {/* add family member button */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {/* TODO: fix hard coding of passed user ID (service?) */}
                        <AddFamilyMemberPopup trigger={<PlusSign style={{ width: '24px', height: '24px'}}/>} userid={3}/>
                    </div>
                </div>
                

                {/* family tree container */}
                {/* using a border fo</div>r now to differentiate tree's viewable/draggable area, and to contain automatic scaling of the tree */}
                <div style={styles.FamilyTreeContainerStyle}> <FamilyTree/> </div>
            </div>
            ) : (
            <Outlet />
            )}
        </div>
    )
}

export default Tree;