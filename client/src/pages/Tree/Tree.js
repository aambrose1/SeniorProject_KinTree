import React, { useEffect, useState } from 'react';
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
import { removeNodeFromTree, rebuildTreeFromDatabase } from '../../utils/relationUtil';
import * as d3 from 'd3';
import { ReactComponent as ImportIcon } from '../../assets/import.svg';

// see https://github.com/donatso/family-chart/

function FamilyTree() {
    const contRef = React.useRef();
    const { currentAccountID } = useCurrentUser();
    const [errorMessage, setErrorMessage] = useState('');
    const [rootMemberId, setRootMemberId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch user root member first for safety check
                const member = await familyTreeService.getFamilyMemberByUserId(currentAccountID);
                const currentRootId = member ? member.id.toString() : null;
                setRootMemberId(currentRootId);

                // 2. Fetch the entire tree
                const [treeData, familyMembers] = await Promise.all([
                    familyTreeService.getFamilyTreeByUserId(currentAccountID),
                    familyTreeService.getFamilyMembersByUserId(currentAccountID)
                ]);

                console.log('Tree data fetched:', treeData);
                create(treeData, familyMembers, currentRootId);
            } catch (error) {
                console.error('Error fetching family tree data:', error);
                setErrorMessage('No family tree found for this user.');
            }
        };

        async function handleDeleteMember(memberId, firstName, lastName, currentRootId) {
            const safetyId = currentRootId || rootMemberId;
            if (String(memberId) === String(safetyId)) {
                alert("You cannot delete yourself from the family tree.");
                return;
            }
            
            const confirmed = window.confirm(`Are you sure you want to delete ${firstName} ${lastName} from your family tree? This will also remove any relationships associated with them.`);
            if (!confirmed) return;

            try {
                // 1. Delete from database (member and relationships)
                await familyTreeService.deleteFamilyMember(memberId);

                // 2. Update tree JSON
                const treeData = await familyTreeService.getFamilyTreeByUserId(currentAccountID);
                // The treeData is the current JSON array. We need to convert to index, remove, and convert back.
                const treeIndex = Object.fromEntries(treeData.map(person => [person.id, person]));
                
                removeNodeFromTree(treeIndex, memberId);
                
                const updatedTreeData = Object.values(treeIndex);
                await familyTreeService.updateTreeInfo(currentAccountID, updatedTreeData);

                // 3. Refresh page to show updated tree
                window.location.reload();
            } catch (error) {
                console.error('Error deleting family member:', error);
                alert('Failed to delete family member. Please try again.');
            }
        }

        function create(data, familyMembers, currentRootId) {
            setErrorMessage('');
            if (!Array.isArray(data) || data.length === 0) {
                console.error('Invalid data for createChart:', data);
                setErrorMessage('No family tree data available to display.');
                return;
            }

            // Clean up any existing chart first
            const existingChart = document.querySelector('#FamilyChart');
            if (existingChart) {
                existingChart.innerHTML = '';
            }

            if (!contRef.current) return;

            try { // build chart
                console.log(data)
                const f3chart = f3.createChart('#FamilyChart', data)
                    .setTransitionTime(1000)
                    .setCardXSpacing(200)
                    .setCardYSpacing(200)
                    .setShowSiblingsOfMain(true)
                    .setSingleParentEmptyCard(false)
                    .setOrientationVertical()
                    .setAncestryDepth(5)
                    .setProgenyDepth(5);

                const f3Card = f3chart.setCardHtml()
                    .setCardDisplay([["first name"], ["last name"]])
                    .setCardDim({})
                    .setMiniTree(true)
                    .setStyle('imageCircle')
                    .setOnHoverPathToMain();

                f3chart.updateTree({ initial: true });

                // Event delegation for delete buttons
                const chartElement = document.querySelector('#FamilyChart');
                const handleChartClick = (e) => {
                    const deleteBtn = e.target.closest('.card-delete');
                    if (deleteBtn) {
                        e.stopPropagation();
                        const card = deleteBtn.closest('.card');
                        // f3 stores data in the __data__ property of the element
                        const nodeData = d3.select(card).datum();
                        if (nodeData && nodeData.data) {
                            handleDeleteMember(nodeData.data.id, nodeData.data.data["first name"], nodeData.data.data["last name"], currentRootId);
                        }
                    }
                };
                chartElement.addEventListener('click', handleChartClick);

                // Since we can't easily modify setCardHtml's output without re-implementing it,
                // we can use a small trick: after the chart is drawn, we inject the buttons into the nodes.
                // This is a bit hacky but works for this library's structure.
                setTimeout(() => {
                    d3.selectAll('#FamilyChart .card').each(function(d) {
                        // Don't allow deleting the root/account user
                        // DEBUG: console.log('Checking node:', d.data.id, 'against root:', currentRootId);
                        if (String(d.data.id) === String(currentRootId)) {
                            console.log('Skipping delete button for self:', d.data.id);
                            return;
                        }
                        
                        const card = d3.select(this);
                        if (card.select('.card-delete').empty()) {
                            card.append('div')
                                .attr('class', 'card-delete')
                                .html('×')
                                .attr('title', 'Delete person');
                        }
                    });
                }, 500);

            }
            catch (error) {
                console.error('Error creating family tree chart:', error);
                setErrorMessage("Failed to create family tree chart");
            };
        }

        if (currentAccountID) fetchData();
    }, [currentAccountID, contRef]);


    const handleResetTree = async () => {
        const confirmed = window.confirm("WARNING: This will completely delete all family members and relationships from your tree (except yourself). This cannot be undone. Are you sure?");
        if (!confirmed) return;

        const doubleCheck = window.confirm("FINAL CONFIRMATION: Are you absolutely certain you want to start from scratch?");
        if (!doubleCheck) return;

        try {
            setErrorMessage('Resetting tree...');
            await familyTreeService.clearFamilyTree(currentAccountID);
            window.location.reload();
        } catch (error) {
            console.error('Failed to reset tree:', error);
            setErrorMessage('Reset failed: ' + error.message);
        }
    };

    const handleSyncTree = async () => {
        try {
            setErrorMessage('Syncing with database...');
            const [members, relationships] = await Promise.all([
                familyTreeService.getFamilyMembersByUserId(currentAccountID),
                familyTreeService.getRelationshipsByUser(currentAccountID)
            ]);

            console.log('Rebuilding tree from:', { members: members.length, relationships: relationships.length });
            const rebuiltTree = rebuildTreeFromDatabase(members, relationships);
            
            await familyTreeService.updateTreeInfo(currentAccountID, rebuiltTree);
            window.location.reload();
        } catch (error) {
            console.error('Failed to sync tree:', error);
            setErrorMessage('Sync failed: ' + error.message);
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {errorMessage && (
                <div style={{ 
                    position: 'absolute', 
                    top: '10px', 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    zIndex: 100,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    padding: '5px 15px',
                    borderRadius: '20px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    color: '#333',
                    fontSize: '14px'
                }}>
                    {errorMessage}
                </div>
            )}
            <div className="f3 f3-cont" id="FamilyChart" ref={contRef}></div>
            
            {/* Action Buttons Overlay */}
            <div style={{
                position: 'absolute',
                bottom: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 100,
                display: 'flex',
                gap: '15px'
            }}>
                {/* Sync Button */}
                <button 
                    onClick={handleSyncTree}
                    title="Sync tree with database records if missing members"
                    style={{
                        backgroundColor: '#fff',
                        border: '2px solid #333',
                        borderRadius: '25px',
                        padding: '10px 25px',
                        fontFamily: 'Alata',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0f0f0';
                        e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    <ImportIcon style={{ width: '18px', height: '18px' }} />
                    Sync Tree
                </button>

                {/* Reset Button */}
                <button 
                    onClick={handleResetTree}
                    title="Clear everything and start fresh"
                    style={{
                        backgroundColor: '#fff',
                        border: '2px solid #e74c3c',
                        color: '#e74c3c',
                        borderRadius: '25px',
                        padding: '10px 25px',
                        fontFamily: 'Alata',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff5f5';
                        e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    <span style={{ fontSize: '18px', lineHeight: '1' }}>↺</span>
                    Reset Tree
                </button>
            </div>
        </div>
    );
}

// builds the actual page
function Tree() {
    const location = useLocation();
    const { currentAccountID, supabaseUser } = useCurrentUser();
    const isTreePage = location.pathname === '/tree';

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        document.body.style.width = '100%';

        return () => {
            document.body.style.overflow = '';
            document.body.style.width = '';
        };
    }, []);

    return (
        <div style={styles.DefaultStyle}>
            <NavBar />
            {isTreePage ? (
                <div style={styles.MainContainerStyle} className="main-container">
                    {/* header content */}
                    <div style={styles.HeaderStyle}>
                        {/* titles */}
                        <div>
                            <h1 style={{ marginBottom: "0px" }}>Your Tree</h1>
                            <hr style={{
                                color: '#000000',
                                backgroundColor: '#000000',
                                height: .1,
                                width: '200px',
                                borderColor: '#000000'
                            }} />
                            <h2 style={{ fontFamily: "Aboreto", marginTop: "0px" }}>The {supabaseUser?.user_metadata?.last_name} Family</h2>
                        </div>
                        {/* add family member button */}
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <AddFamilyMemberPopup trigger={<PlusSign style={{ width: '24px', height: '24px' }} />} userid={currentAccountID} />
                        </div>
                    </div>


                    {/* family tree container */}
                    {/* using a border for now to differentiate tree's viewable/draggable area, and to contain automatic scaling of the tree */}
                    <div style={styles.FamilyTreeContainerStyle}> <FamilyTree /> </div>
                </div>
            ) : (
                <Outlet />
            )}
        </div>
    )
}

export default Tree;