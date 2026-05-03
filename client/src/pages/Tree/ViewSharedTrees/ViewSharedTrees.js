import React, { useState, useEffect } from 'react';
import * as styles from './styles';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../../../CurrentUserProvider';
import { SERVER_URL } from '../../../config/urls';
import { AiOutlineDelete, AiOutlineCheckCircle } from 'react-icons/ai';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

// const defaultAvatar = require('../../../assets/default-avatar.png');

function ViewSharedTrees() {
    const [trees, setTrees] = useState([]);
    const [userData, setUserData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const { currentAccountID } = useCurrentUser();

    const getTimeAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return '1 day ago';
        return `${diffDays} days ago`;
    };

    const handleDeleteTree = async (sharedTreeId) => {
        if (!window.confirm('Are you sure you want to delete this shared tree?')) {
            return;
        }

        try {
            const response = await fetch(`${SERVER_URL}/api/share-trees/${sharedTreeId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setTrees(prevTrees => prevTrees.filter(tree => tree.sharedtreeid !== sharedTreeId));
                setModalMessage('Shared tree deleted successfully');
                setShowModal(true);
            } else {
                const errorData = await response.json();
                setModalMessage('Failed to delete shared tree: ' + (errorData.error || 'Unknown error'));
                setShowModal(true);
            }
        } catch (error) {
            console.error('Error deleting shared tree:', error);
            setModalMessage('Failed to delete shared tree');
            setShowModal(true);
        }
    };

    const handleUpdateStatus = async (sharedTreeId, status) => {
        try {
            const response = await fetch(`${SERVER_URL}/api/share-trees/${sharedTreeId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                if (status === 'rejected') {
                    setTrees(prevTrees => prevTrees.filter(tree => tree.sharedtreeid !== sharedTreeId));
                    setModalMessage('Invitation rejected');
                    setShowModal(true);
                } else {
                    setTrees(prevTrees =>
                        prevTrees.map(tree =>
                            tree.sharedtreeid === sharedTreeId ? { ...tree, status } : tree
                        )
                    );
                    setModalMessage('Invitation accepted!');
                    setShowModal(true);
                }
            } else {
                const errorData = await response.json();
                setModalMessage(`Failed to ${status} invitation: ` + (errorData.error || 'Unknown error'));
                setShowModal(true);
            }
        } catch (error) {
            console.error('Error updating tree status:', error);
            setModalMessage(`Failed to ${status} invitation`);
            setShowModal(true);
        }
    };

    useEffect(() => {
        async function fetchTrees() {
            const response = await fetch(`${SERVER_URL}/api/share-trees/receiver/${currentAccountID}`)
            if (response.ok) {
                let responseData = await response.json();
                console.log(responseData);
                return responseData;
            } 
            else {
                console.log('Error:', response);
            }
        }
    
        async function fetchUserData() {
            const response = await fetch(`${SERVER_URL}/api/auth/users/`);
            if (response.ok) {
                const userData = await response.json();
                return userData;
            } 
            else {
                console.error(`Error fetching user data`);
                return null;
            }
        }

        const fetchData = async () => {
            const results = await fetchTrees();
            setTrees(results);
            const userData = await fetchUserData();
            setUserData(userData);
        };
        fetchData();
    }, [currentAccountID]);

    return (
        <div style={styles.DefaultStyle}>
            <div style={{width: '150px'}}></div>
            <div style={styles.RightSide}>
            <div className="animate-in" style={styles.ContainerStyle}>
                {/* title */}
                <h1 style={{ margin: '0px', color: 'var(--text-color)' }}>Shared Trees</h1>
                <hr style={{ width: '50px', border: 'none', height: '2px', backgroundColor: 'var(--kt-green-primary)', margin: 'var(--space-2) 0 var(--space-6) 0' }} />

                {/* dynamic list of results */}
                <ul style={styles.ListStyle}>
                    {trees && trees.length > 0 ? (
                        trees.map(tree => (
                            <li key={tree.sharedtreeid} style={styles.ItemStyle} className="kt-card-interactive">
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: '600', color: 'var(--text-color)', marginRight: '10px' }}>
                                                {userData.find(user => user.id === tree.senderid)?.firstname}{' '}
                                                {userData.find(user => user.id === tree.senderid)?.lastname}'s Tree
                                            </span>
                                            {tree.status === 'pending' && (
                                                <span style={{ 
                                                    fontSize: '0.7em', 
                                                    backgroundColor: 'var(--kt-warning-bg)', 
                                                    color: 'var(--kt-warning-text)', 
                                                    padding: '2px 8px', 
                                                    borderRadius: '12px',
                                                    fontWeight: '500'
                                                }}>
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>
                                                Shared {getTimeAgo(tree.sharedate)}
                                            </span>
                                        </div>
                                        {tree?.comment && (
                                            <div style={{ color: 'var(--text-color)', fontSize: '0.9em', marginTop: '4px', fontStyle: 'italic', opacity: 0.8 }}>
                                                "{tree?.comment}"
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        {tree.status === 'pending' ? (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateStatus(tree.sharedtreeid, 'accepted')}
                                                    className="kt-button kt-button-ghost-success"
                                                    style={{ padding: '6px 16px', fontSize: '13px' }}
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(tree.sharedtreeid, 'rejected')}
                                                    className="kt-button kt-button-ghost-danger"
                                                    style={{ padding: '6px 16px', fontSize: '13px' }}
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <Link 
                                                    to={`/sharedtree/${tree.sharedtreeid}`} 
                                                    className="kt-button kt-button-primary"
                                                    style={{ padding: '6px 16px', textDecoration: 'none', fontSize: '13px' }}
                                                >
                                                    View Tree
                                                </Link>
                                                <button 
                                                    onClick={() => handleDeleteTree(tree.sharedtreeid)}
                                                    className="kt-button kt-button-danger"
                                                    style={{ padding: '8px', borderRadius: 'var(--radius-md)' }}
                                                    title="Delete Shared Tree"
                                                >
                                                    <AiOutlineDelete size={18} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))
                    ) : (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: 'var(--space-8) var(--space-4)',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 'var(--space-4)'
                        }}>
                             <div style={{ fontSize: '40px', opacity: 0.5 }}>🌳</div>
                             <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '500' }}>No shared trees yet.</p>
                             <p style={{ margin: 0, fontSize: '0.9rem', maxWidth: '300px', lineHeight: '1.5' }}>
                                Invite family members and start building your story together!
                             </p>
                        </div>
                    )}
                </ul>
            </div>
            </div>

            {/* Success/Error Modal */}
            <Popup
                open={showModal}
                onClose={() => setShowModal(false)}
                modal
                nested
                contentStyle={{ 
                    borderRadius: 'var(--radius-lg)', 
                    padding: 'var(--space-8)', 
                    border: '1px solid var(--border-color)', 
                    boxShadow: 'var(--shadow-premium)',
                    width: '400px',
                    textAlign: 'center',
                    backgroundColor: 'var(--card-bg)'
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div style={{ 
                        backgroundColor: modalMessage.toLowerCase().includes('failed') || modalMessage.toLowerCase().includes('error') ? 'rgba(180, 35, 24, 0.1)' : 'var(--kt-green-soft)', 
                        borderRadius: 'var(--radius-full)', 
                        width: '64px', 
                        height: '64px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center'
                    }}>
                        {modalMessage.toLowerCase().includes('failed') || modalMessage.toLowerCase().includes('error') ? (
                            <span style={{ fontSize: '32px', color: 'var(--kt-danger)' }}>⚠</span>
                        ) : (
                            <AiOutlineCheckCircle size={40} color="var(--kt-green-primary)" />
                        )}
                    </div>
                    
                    <h2 style={{ margin: 0, color: 'var(--text-color)', fontSize: '1.5rem' }}>
                        {modalMessage.toLowerCase().includes('failed') || modalMessage.toLowerCase().includes('error') ? 'Oops!' : 'Done!'}
                    </h2>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        {modalMessage}
                    </p>
                    
                    <button 
                        className="kt-button kt-button-primary"
                        style={{ marginTop: 'var(--space-4)', width: '100%' }}
                        onClick={() => setShowModal(false)}
                    >
                        Close
                    </button>
                </div>
            </Popup>
        </div>
    )
}

export default ViewSharedTrees;