import React, { useRef, useEffect } from 'react';
import * as styles from './styles';
// import { ReactComponent as TreeIcon } from '../../assets/background-tree.svg'; // background tree image from Figma; TODO configure overlay with tree svg
import * as f3 from 'family-chart';
import './tree.css'; // styling adapted from family-chart package sample code
import { ReactComponent as PlusSign } from '../../assets/plus-sign.svg';
import AddFamilyMemberPopup from '../../components/AddFamilyMember/AddFamilyMember';
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import { useLocation, Outlet } from 'react-router-dom';
import { useCurrentUser } from '../../CurrentUserProvider'; // import the context

// FamilyTree class structure derived from family-chart package sample code
// see https://github.com/donatso/family-chart/

function FamilyTree() {
    const contRef = React.createRef();
    const { currentAccountID } = useCurrentUser();

    useEffect(() => {
        if (!contRef.current) return;

        let chart = null;

        function create(data) {
            // Clean up any existing chart first
            const existingChart = document.querySelector('#FamilyChart');
            if (existingChart) {
                existingChart.innerHTML = '';
            }

            chart = f3.createChart('#FamilyChart', data)
                .setTransitionTime(500)
                .setCardXSpacing(250)
                .setCardYSpacing(150)
                .setSingleParentEmptyCard(false, {label: ''})
                .setShowSiblingsOfMain(true)
                .setOrientationVertical()
                
            
            chart.setCardHtml()
                .setCardDisplay([["first name"],[]])
                .setCardDim({})
                .setMiniTree(false)
                .setStyle('imageCircle')
                .setOnCardClick((e, data) => {
                    window.location.href = `/account/${data.data.id}`;
                });

            chart.updateTree({initial: true});
        }

        let getRequestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch(`http://localhost:5000/api/tree-info/${currentAccountID}`, getRequestOptions)
            .then(async (response) => {
                if (response.ok) {
                    let treeData = await response.json();
                    const parsedData = treeData.object;
                    console.log("Tree data: ", parsedData);
                    create(parsedData);
                } else {
                    console.error('Error in Loading Tree Data:', response);
                }
            });

        
    }, [contRef, currentAccountID]);

    return <div className="f3 f3-cont" id="FamilyChart" ref={contRef}></div>;
}

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
            {isTreePage ? (
            <div style={styles.MainContainerStyle} className="main-container">                
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