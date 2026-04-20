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
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

// see https://github.com/donatso/family-chart/

function FamilyTree({ refreshKey }) {
    const contRef = React.useRef();
    const { currentAccountID } = useCurrentUser();
    const [errorMessage, setErrorMessage] = useState('');
    const [rootMemberId, setRootMemberId] = useState(null);
    
    const [isDeleting, setIsDeleting] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null); // { id, firstName, lastName }

    const handleDeleteClick = (memberId, firstName, lastName) => {
        if (String(memberId) === String(rootMemberId)) {
            setErrorMessage("Action Denied: You cannot delete yourself (the root node) from the family tree.");
            return;
        }
        setDeleteTarget({ id: memberId, firstName, lastName });
        setIsDeleting(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const { id, firstName, lastName } = deleteTarget;
        setIsDeleting(false);
        
        try {
            setErrorMessage(`Deleting ${firstName}...`);
            
            // GHOST NODE CHECK: Only delete from DB if it's a real record (not a ghost)
            const isGhost = id.toString().startsWith('ghost_');
            
            if (!isGhost) {
                // 1. Delete from database (real nodes)
                await familyTreeService.deleteFamilyMember(id);
            } else {
                console.log("Skipping DB delete for ghost node:", id);
            }

            // 2. Update tree JSON (always remove from visualization)
            const treeData = await familyTreeService.getFamilyTreeByUserId(currentAccountID);
            const treeIndex = Object.fromEntries(treeData.map(person => [person.id, person]));
            removeNodeFromTree(treeIndex, id);
            
            const updatedTreeData = Object.values(treeIndex);
            await familyTreeService.updateTreeInfo(currentAccountID, updatedTreeData);

            setErrorMessage(`Successfully removed ${firstName} ${lastName}`);
            setTimeout(() => {
                setErrorMessage('');
                // If onTreeUpdate is provided (from props), use it to refresh instead of reload
                if (window.refreshTree) {
                    window.refreshTree();
                } else {
                    window.location.reload();
                }
            }, 1000);
        } catch (error) {
            console.error('[DETAILED DEBUG] Deletion Error:', error);
            setErrorMessage(`Deletion Failed: ${error.message}`);
        }
    };

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


        function create(data, familyMembers, currentRootId) {
            setErrorMessage('');
            if (!Array.isArray(data) || data.length === 0) {
                console.error('Invalid data for createChart:', data);
                setErrorMessage('No family tree data available to display.');
                return;
            }

            const treeIndex = Object.fromEntries(data.map(person => [String(person.id), person]));

            function getRelationshipToRoot(rootId, nodeId) {
                if (String(rootId) === String(nodeId)) return null;
                const node = treeIndex[nodeId];
                if (!node) return null;
                
                const root = treeIndex[rootId];
                if (!root) return null;
                
                const isM = node.data.gender === 'M';
                const isF = node.data.gender === 'F';

                if (root.rels?.parents?.includes(nodeId)) return isM ? 'Father' : isF ? 'Mother' : 'Parent';
                if (root.rels?.children?.includes(nodeId)) return isM ? 'Son' : isF ? 'Daughter' : 'Child';
                if (root.rels?.spouses?.includes(nodeId)) return isM ? 'Husband' : isF ? 'Wife' : 'Spouse';

                const isSibling = root.rels?.parents?.some(p => treeIndex[p]?.rels?.children?.includes(nodeId));
                if (isSibling) return isM ? 'Brother' : isF ? 'Sister' : 'Sibling';

                const isGrandparent = root.rels?.parents?.some(p => treeIndex[p]?.rels?.parents?.includes(nodeId));
                if (isGrandparent) return isM ? 'Grandfather' : isF ? 'Grandmother' : 'Grandparent';

                const isAuntUncle = root.rels?.parents?.some(p => treeIndex[p]?.rels?.parents?.some(gp => treeIndex[gp]?.rels?.children?.includes(nodeId) && String(nodeId) !== String(p)));
                if (isAuntUncle) return isM ? 'Uncle' : isF ? 'Aunt' : 'Aunt/Uncle';

                const isNieceNephew = node.rels?.parents?.some(pId => String(pId) !== String(rootId) && root.rels?.parents?.some(gp => treeIndex[gp]?.rels?.children?.includes(pId)));
                if (isNieceNephew) return isM ? 'Nephew' : isF ? 'Niece' : 'Niece/Nephew';

                const isCousin = node.rels?.parents?.some(pId => treeIndex[pId]?.rels?.parents?.some(p => treeIndex[p]?.rels?.children?.includes(pId))); // Simplified Check
                if (isCousin) return 'Cousin';

                const isGrandchild = root.rels?.children?.some(cId => treeIndex[cId]?.rels?.children?.includes(nodeId));
                if (isGrandchild) return isM ? 'Grandson' : isF ? 'Granddaughter' : 'Grandchild';

                return null;
            }

            // Transform data: Change root node name to "You", fix ghost names, and attach subscripts
            const rootName = data.find(n => String(n.id) === String(currentRootId))?.data["first name"];
            const displayData = data.map(node => {
                const subStr = getRelationshipToRoot(currentRootId, String(node.id));

                if (String(node.id) === String(currentRootId)) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            "first name": "You",
                            "last name": "",
                            "subscript": ""
                        }
                    };
                }
                
                // If it's a ghost node, try to make its name relative to "You"
                if (node.data.isGhost && rootName) {
                    const firstName = node.data["first name"] || "";
                    if (firstName.includes(`of ${rootName}`)) {
                        const relationship = firstName.split(' ')[0]; // E.g., "Parent" or "Sibling"
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                "first name": `Your ${relationship}`,
                                "subscript": ""
                            }
                        };
                    }
                }
                
                return {
                    ...node,
                    data: {
                        ...node.data,
                        subscript: subStr || ""
                    }
                };
            });

            // Clean up any existing chart first
            const existingChart = document.querySelector('#FamilyChart');
            if (existingChart) {
                existingChart.innerHTML = '';
            }

            if (!contRef.current) return;

            try { // build chart
                console.log(displayData)
                const f3chart = f3.createChart('#FamilyChart', displayData)
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

                // Injects delete buttons and relationship subscripts into cards
                const injectCardElements = () => {
                    d3.selectAll('#FamilyChart .card').each(function(d) {
                        if (!d || !d.data) return;
                        
                        const card = d3.select(this);
                        
                        // Inject Delete Button (if not root)
                        if (String(d.data.id) !== String(currentRootId) && card.select('.card-delete').empty()) {
                            card.append('div')
                                .attr('class', 'card-delete')
                                .html('×')
                                .attr('title', 'Delete person');
                        }

                        // Inject Relationship Subscript
                        if (d.data.data.subscript && card.select('.card-subscript').empty()) {
                            const isFemale = d.data.data.gender === 'F';
                            const isMale = d.data.data.gender === 'M';
                            const color = isFemale ? '#e91e63' : (isMale ? '#1976d2' : '#666'); // Pink vs Blue
                            
                            const labelBox = card.select('.card-label');
                            
                            // Style the label box to allow multiple lines
                            labelBox
                                .style('display', 'flex')
                                .style('flex-direction', 'column')
                                .style('align-items', 'center')
                                .style('justify-content', 'center')
                                .style('min-height', 'auto')
                                .style('padding', '4px 8px')
                                .style('bottom', '-10px'); // Keep it centered on the bottom edge

                            labelBox.append('div')
                                .attr('class', 'card-subscript')
                                .style('font-size', '9px')
                                .style('font-weight', 'bold')
                                .style('color', color)
                                .style('text-transform', 'uppercase')
                                .style('margin-top', '2px')
                                .style('line-height', '1')
                                .style('pointer-events', 'none')
                                .html(d.data.data.subscript);
                        }
                    });
                };

                // Event delegation for delete buttons
                const chartElement = document.querySelector('#FamilyChart');
                const handleChartClick = (e) => {
                    const deleteBtn = e.target.closest('.card-delete');
                    if (deleteBtn) {
                        e.stopPropagation();
                        const card = deleteBtn.closest('.card');
                        const nodeData = d3.select(card).datum();
                        if (nodeData && nodeData.data) {
                            handleDeleteClick(nodeData.data.id, nodeData.data.data["first name"], nodeData.data.data["last name"]);
                        }
                    }
                };
                // Use .onclick to overwrite any previous listeners
                chartElement.onclick = handleChartClick;

                f3chart.updateTree({ initial: true });
                
                // Watch for DOM changes to re-inject buttons after library re-renders nodes (like after transitions)
                const observer = new MutationObserver(() => injectCardElements());
                observer.observe(chartElement, { childList: true, subtree: true });

                // Initial injection
                injectCardElements();

                // CLEANUP: Remove listener and observer when component re-renders or unmounts
                return () => {
                    chartElement.onclick = null;
                    observer.disconnect();
                };
            }
            catch (error) {
                console.error('Error creating family tree chart:', error);
                setErrorMessage("Failed to create family tree chart");
            };
        }

        if (currentAccountID) fetchData();
    }, [currentAccountID, contRef, refreshKey]);


    const handleResetTree = () => {
        setIsResetting(true);
    };

    const confirmReset = async () => {
        setIsResetting(false);
        try {
            setErrorMessage('Resetting tree...');
            await familyTreeService.clearFamilyTree(currentAccountID);
            if (window.refreshTree) {
                window.refreshTree();
                setErrorMessage('');
            } else {
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to reset tree:', error);
            setErrorMessage('Reset failed: ' + error.message);
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
            
            {/* Reset Button Overlay */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                zIndex: 100
            }}>
                <button 
                    onClick={handleResetTree}
                    title="Clear everything and start fresh"
                    className="kt-card-interactive"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-muted)',
                        borderRadius: 'var(--radius-md)',
                        padding: '8px 16px',
                        fontFamily: 'inherit',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease',
                        boxShadow: 'var(--shadow-sm)'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.color = 'var(--kt-danger)';
                        e.currentTarget.style.borderColor = 'var(--kt-danger)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                >
                    <span style={{ fontSize: '14px' }}>↺</span>
                    Reset Tree
                </button>
            </div>

            {/* CUSTOM DELETE CONFIRMATION MODAL */}
            <Popup
                open={isDeleting}
                onClose={() => setIsDeleting(false)}
                modal
                nested
                contentStyle={{ 
                    borderRadius: '12px', 
                    padding: '24px', 
                    border: '1px solid #eee', 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                    fontFamily: 'Alata',
                    width: '380px',
                    textAlign: 'center',
                    backgroundColor: '#fff'
                }}
            >
                <div>
                    <h3 style={{ color: '#333', marginBottom: '12px', fontSize: '20px' }}>Remove Family Member?</h3>
                    <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.5', margin: '0 0 24px 0' }}>
                        Are you sure you want to remove <strong>{deleteTarget?.firstName} {deleteTarget?.lastName}</strong>?
                        <br /><span style={{ fontSize: '12px', color: '#999' }}>This will also remove any relationship links associated with them.</span>
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                        <button 
                            onClick={confirmDelete}
                            style={{
                                backgroundColor: '#e74c3c',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Delete Member
                        </button>
                        <button 
                            onClick={() => setIsDeleting(false)}
                            style={{
                                backgroundColor: '#f5f5f5',
                                color: '#666',
                                border: '1px solid #ddd',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Popup>

            {/* CUSTOM RESET CONFIRMATION MODAL (Professional Warning) */}
            <Popup
                open={isResetting}
                onClose={() => setIsResetting(false)}
                modal
                nested
                contentStyle={{ 
                    borderRadius: '12px', 
                    padding: '32px', 
                    border: '1px solid #eee', 
                    boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
                    fontFamily: 'Alata',
                    width: '420px',
                    textAlign: 'center',
                    backgroundColor: '#fff'
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ 
                        backgroundColor: '#fff5f5', 
                        borderRadius: '50%', 
                        width: '60px', 
                        height: '60px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        marginBottom: '20px'
                    }}>
                        <span style={{ fontSize: '30px', color: '#e74c3c' }}>⚠</span>
                    </div>
                    
                    <h2 style={{ color: '#2c3e50', marginBottom: '12px', fontSize: '22px' }}>Reset Family Tree?</h2>
                    <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.6', marginBottom: '28px' }}>
                        This will permanently remove all members and relationships except for your own profile. 
                        <strong> This action cannot be undone.</strong>
                    </p>
                    
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button 
                            onClick={confirmReset}
                            style={{
                                backgroundColor: '#e74c3c',
                                color: 'white',
                                border: 'none',
                                padding: '12px',
                                borderRadius: '10px',
                                fontWeight: 'bold',
                                fontSize: '15px',
                                cursor: 'pointer'
                            }}
                        >
                            Yes, Reset Everything
                        </button>
                        <button 
                            onClick={() => setIsResetting(false)}
                            style={{
                                backgroundColor: 'transparent',
                                color: '#999',
                                border: 'none',
                                padding: '8px',
                                fontSize: '14px',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }}
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </Popup>
        </div>
    );
}

// builds the actual page
function Tree() {
    const location = useLocation();
    const { currentAccountID, supabaseUser } = useCurrentUser();
    const isTreePage = location.pathname === '/tree';

    const [refreshKey, setRefreshKey] = useState(0);
    
    // Attach to window so child components like AddFamilyMemberPopup can trigger it
    // Note: In a larger app, we'd use Context or Redux, but this works for this structure
    useEffect(() => {
        window.refreshTree = () => setRefreshKey(prev => prev + 1);
        window.refreshKey = refreshKey;
    }, [refreshKey]);

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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                            <h1 style={{ margin: 0, color: 'var(--text-color)', fontSize: '2rem' }}>Your Tree</h1>
                            <h2 style={{ fontFamily: "Aboreto", margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', letterSpacing: '1px' }}>
                                THE {supabaseUser?.user_metadata?.last_name || 'Family'} TREE
                            </h2>
                        </div>
                        {/* add family member button */}
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <AddFamilyMemberPopup 
                                trigger={<PlusSign className="tree-plus-button" style={{ width: '24px', height: '24px' }} />} 
                                userid={currentAccountID} 
                            />
                        </div>
                    </div>

                    {/* family tree container */}
                    <div style={styles.FamilyTreeContainerStyle}> <FamilyTree refreshKey={refreshKey} /> </div>
                </div>
            ) : (
                <Outlet />
            )}
        </div>
    )
}

export default Tree;