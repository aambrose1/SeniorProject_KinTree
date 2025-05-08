import React, { useRef, useEffect } from 'react';
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
import { useCurrentUser } from '../../CurrentUserProvider'; // import the context

// FamilyTree class structure derived from family-chart package sample code
// see https://github.com/donatso/family-chart/

function FamilyTree() {
    const contRef = useRef(null); // Use a ref for the container
    const { currentAccountID } = useCurrentUser(); // Use the hook in the function component

    useEffect(() => {
        if (!contRef.current) {
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
                .setSingleParentEmptyCard(false);

            const f3Card = f3Chart.setCard(f3.CardHtml)
                .setCardDisplay([["first name"], []])
                .setCardDim({ width: 80, height: 80 })
                .setMiniTree(false)
                .setStyle('imageCircle')
                .setOnHoverPathToMain();

            f3Card.setOnCardClick((e, d) => {}); // Remove zooming transitions

            f3Chart.updateMainId("21");
            f3Chart.updateTree({ initial: true });
        }

        let getRequestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch(`http://localhost:5000/api/tree-info/${currentAccountID}`, getRequestOptions)
            .then(async (response) => {
                if (response.ok) {
                    let treeData = await response.json();
                    console.log(treeData.object);
                    const parsedData = treeData.object;
                    console.log(parsedData);
                    create(parsedData);
                } else {
                    console.error('Error:', response);
                }
            });
    }, [currentAccountID]);

    return <div className="f3 f3-cont" id="FamilyChart" ref={contRef}></div>;
}

let parsedData = [];

// builds the actual page
function Tree() {
    const { currentAccountID, currentUserName, fetchCurrentUserID } = useCurrentUser(); // Use the hook in the function component
    fetchCurrentUserID();
    const location = useLocation();
    const isTreePage = location.pathname === '/tree';
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
                        <h2 style={{fontFamily: "Aboreto", marginTop: "0px"}}>The {currentUserName?.split(" ")[1]} Family</h2> 
                    </div>
                    {/* add family member button */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {/* TODO: fix hard coding of passed user ID (service?) */}
                        <AddFamilyMemberPopup trigger={<PlusSign style={{ width: '24px', height: '24px'}}/>} userid={currentAccountID}/>
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