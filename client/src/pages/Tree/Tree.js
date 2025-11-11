import React, { useEffect } from 'react';
import * as styles from './styles';
// import { ReactComponent as TreeIcon } from '../../assets/background-tree.svg'; // background tree image from Figma; TODO configure overlay with tree svg
import * as f3 from 'family-chart';
import './tree.css'; // styling adapted from family-chart package sample code
import { ReactComponent as PlusSign } from '../../assets/plus-sign.svg';
import AddFamilyMemberPopup from '../../components/AddFamilyMember/AddFamilyMember';
import NavBar from '../../components/NavBar/NavBar';
import { useLocation, Outlet } from 'react-router-dom';
import { useCurrentUser, supabaseUser } from '../../CurrentUserProvider'; // import the context
import { familyTreeService } from '../../services/familyTreeService';

// see https://github.com/donatso/family-chart/

function FamilyTree() {
    const contRef = React.useRef();
    const { currentAccountID } = useCurrentUser();

    
    useEffect(() => {
        function create(data) {
            if (!Array.isArray(data) || data.length === 0) {
                console.error('Invalid data for createChart:', data);
                return;
            }

            // Clean up any existing chart first
            const existingChart = document.querySelector('#FamilyChart');
            if (existingChart) {
                existingChart.innerHTML = '';
            }

            if (!contRef.current) return;

            const f3chart = f3.createChart('#FamilyChart', data)
            .setTransitionTime(1000)
            .setCardXSpacing(250)
            .setCardYSpacing(150)
            .setSingleParentEmptyCard(true, {label: 'ADD'})
            .setShowSiblingsOfMain(true)
            .setOrientationVertical()

            const f3Card = f3chart.setCardHtml()
                .setCardDisplay([["first name"],[]])
                .setCardDim({})
                .setMiniTree(true)
                .setStyle('imageCircle')
                .setOnHoverPathToMain()
                .setOnCardClick((e, data) => {
                    window.location.href = `/account/${data.userid}`;
                });

            f3chart.updateTree({initial: true});
        }

        try{
            const fetchData = async () => {
                const treeData = await familyTreeService.getFamilyTreeByUserId(currentAccountID);
                console.log('Tree data fetched:', treeData);
                create(treeData);
            };
            fetchData();
        } catch (error) {
            console.error('Error creating family tree chart:', error); 
        }
        
        
    }, [currentAccountID, contRef]);

    return <div className="f3 f3-cont" id="FamilyChart" ref={contRef}></div>;
    
}

// builds the actual page
function Tree() {
    const location = useLocation();
    const { currentAccountID, supabaseUser } = useCurrentUser();
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
                        <h2 style={{fontFamily: "Aboreto", marginTop: "0px"}}>The {supabaseUser?.user_metadata?.last_name} Family</h2> 
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