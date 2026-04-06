import React, { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { AiOutlineSetting, AiOutlineQuestion } from 'react-icons/ai';
import './NavBar.css';
import { useCurrentUser } from '../../CurrentUserProvider';
import { supabase } from '../../utils/supabaseClient';

function NavBar() {
    const [showNestedNav, setShowNestedNav] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { supabaseUser, currentAccountID } = useCurrentUser();
    const { id } = useParams();

    useEffect(() => {
        if (!supabaseUser) return;

        // Initial fetch of unread count (messages receiver is us, is_read is false, and NOT deleted by us)
        const fetchUnreadCount = async () => {
            const { count, error } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('receiver_id', supabaseUser.id)
                .eq('is_read', false)
                .eq('deleted_by_receiver', false);

            if (!error) {
                setUnreadCount(count || 0);
            }
        };

        fetchUnreadCount();

        // Subscribe to changes in the messages table
        const channel = supabase
            .channel('navbar-unread-count')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'messages' },
                () => {
                    fetchUnreadCount();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabaseUser]);

    return (
        <nav className="navbar">
            <ul className="nav-options-list">
                <NavLink to="/account" 
                    className={({isActive}) => 
                        isActive && Number(id) === Number(currentAccountID) ? "nav-item-active" : "nav-item"} 
                    onClick={() => setShowNestedNav(false)}> 
                    Account 
                </NavLink>
                <br></br>
                <NavLink to="/" 
                    className={({isActive}) => isActive ? "nav-item-active" : "nav-item"} 
                    onClick={() => setShowNestedNav(false)}> 
                    Home 
                </NavLink>
                <br></br>
                <NavLink to="/family" 
                    className={({isActive}) => isActive ? "nav-item-active" : "nav-item"}  
                    onClick={() => setShowNestedNav(false)}> 
                    Family 
                </NavLink>
                <br></br>
                <li 
                    className="nav-item"
                    onMouseEnter={() => setShowNestedNav(true)} 
                    onMouseLeave={() => setShowNestedNav(false)}
                >
                    <NavLink 
                        to="/tree" 
                        className={({isActive}) => isActive ? "nav-item-active" : "nav-item"}
                        onClick={() => setShowNestedNav(true)}
                    >
                        Tree
                    </NavLink>
                    {showNestedNav && (
                        <div className="nested-navbar">
                            <div>
                                <NavLink 
                                    to="/tree/sharetree" 
                                    className={({isActive}) => isActive ? "nav-item-nested-active" : "nav-item-nested"} 
                                >
                                    Share Tree
                                </NavLink>
                                <br />
                                <NavLink 
                                    to="/tree/viewsharedtrees" 
                                    className={({isActive}) => isActive ? "nav-item-nested-active" : "nav-item-nested"} 
                                >
                                    View Shared Trees
                                </NavLink>
                            </div>
                        </div>
                    )}
                </li>
                <br/>
                <NavLink to="/chat" 
                    className={({isActive}) => isActive ? "nav-item-active chat-nav-link" : "nav-item chat-nav-link"} 
                    onClick={() => setShowNestedNav(false)}> 
                    Chat
                    {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
                </NavLink>

                <div className="settings-and-help">
                    <NavLink to="/websitesettings" >
                        <AiOutlineSetting className="settings-icon"></AiOutlineSetting>
                    </NavLink>
                    <NavLink to="/help">
                        <AiOutlineQuestion className="help-icon"></AiOutlineQuestion>
                    </NavLink>
                </div>
            </ul>
        </nav>
    );
}

export default NavBar;