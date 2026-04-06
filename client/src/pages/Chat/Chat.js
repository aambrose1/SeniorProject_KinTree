import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import NavBar from '../../components/NavBar/NavBar';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
    MainContainer,
    ChatContainer,
    MessageList,
    Message,
    MessageInput,
    Sidebar,
    ConversationList,
    Conversation,
    ConversationHeader,
    Avatar,
    MessageSeparator
} from '@chatscope/chat-ui-kit-react';
import { useCurrentUser } from '../../CurrentUserProvider';
import { familyTreeService } from '../../services/familyTreeService';
import { supabase } from '../../utils/supabaseClient';
import './Chat.css';

const defaultAvatar = require('../../assets/default-avatar.png');

function Chat() {
    const navigate = useNavigate();
    const { supabaseUser, currentAccountID } = useCurrentUser();
    const [familyMembers, setFamilyMembers] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);
    const [messageInputValue, setMessageInputValue] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [activeSidebarTab, setActiveSidebarTab] = useState("messages"); // "messages" or "family"
    const [unreadCounts, setUnreadCounts] = useState({}); // { sender_id: count }
    const [lastMessages, setLastMessages] = useState({}); // { sender_id: "last message text" }
    const [messageError, setMessageError] = useState(null);

    const messagesEndRef = useRef(null);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, messageId: null });

    // Fetch unread counts for all conversations
    const fetchUnreadCounts = useCallback(async () => {
        if (!supabaseUser) return;

        const { data, error } = await supabase
            .from('messages')
            .select('sender_id')
            .eq('receiver_id', supabaseUser.id)
            .eq('is_read', false)
            .eq('deleted_by_receiver', false);

        if (error) {
            console.error("Error fetching unread counts:", error);
            return;
        }

        // Group by sender_id to get per-conversation unread counts
        const counts = {};
        if (data) {
            data.forEach((msg) => {
                counts[msg.sender_id] = (counts[msg.sender_id] || 0) + 1;
            });
        }
        setUnreadCounts(counts);
    }, [supabaseUser]);

    // Fetch the last message for each family member conversation
    const fetchLastMessages = useCallback(async (members) => {
        if (!supabaseUser || !members.length) return;

        const previews = {};
        for (const member of members) {
            if (!member.auth_uid) continue;

            const { data, error } = await supabase
                .from('messages')
                .select('*') // Get all fields to check deletion flags
                .or(`and(sender_id.eq.${supabaseUser.id},receiver_id.eq.${member.auth_uid}),and(sender_id.eq.${member.auth_uid},receiver_id.eq.${supabaseUser.id})`)
                .order('created_at', { ascending: false });

            if (!error && data && data.length > 0) {
                // Find the first message that isn't deleted for the current user
                const latestValidMessage = data.find(msg => {
                    const isOurs = msg.sender_id === supabaseUser.id;
                    return isOurs ? !msg.deleted_by_sender : !msg.deleted_by_receiver;
                });

                if (latestValidMessage) {
                    const previewText = latestValidMessage.content.length > 35
                        ? latestValidMessage.content.substring(0, 35) + '...'
                        : latestValidMessage.content;
                    previews[member.auth_uid] = previewText;
                }
            }
        }
        setLastMessages(previews);
    }, [supabaseUser]);

    // Fetch family members on component mount
    useEffect(() => {
        const fetchFamilyMembers = async () => {
            if (!currentAccountID) return;
            try {
                const responseData = await familyTreeService.getFamilyMembersByUserId(currentAccountID);

                // Only include members who have a linked user account with auth_uid
                const validChatMembers = responseData.filter(member => member.auth_uid);

                setFamilyMembers(validChatMembers);

                // Auto-select the first conversation if none is active
                if (validChatMembers.length > 0 && !activeConversation) {
                    handleConversationClick(validChatMembers[0]);
                }

                // Fetch last message previews and unread counts
                await fetchLastMessages(validChatMembers);
                await fetchUnreadCounts();
            } catch (error) {
                console.error('Error fetching family data for chat:', error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFamilyMembers();
    }, [currentAccountID, fetchLastMessages, fetchUnreadCounts]);

    // Fetch messages when a conversation is selected
    useEffect(() => {
        if (!activeConversation || !supabaseUser) return;

        const otherUserId = activeConversation.auth_uid;
        if (!otherUserId) {
            console.error("Cannot load messages: family member has no linked account (auth_uid missing)");
            return;
        }

        const fetchMessages = async () => {
            setIsMessagesLoading(true);
            setMessageError(null);
            
            try {
                const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${supabaseUser.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${supabaseUser.id})`)
                .order('created_at', { ascending: true });

            if (error) {
                console.error("Error fetching messages:", error);
                setMessageError("Could not load messages. Please try again.");
                return;
            }

            // Filter out messages that the current user has "soft-deleted"
            const filteredMessages = (data || []).filter(msg => {
                const isOurs = msg.sender_id === supabaseUser.id;
                return isOurs ? !msg.deleted_by_sender : !msg.deleted_by_receiver;
            });

            setMessages(filteredMessages);

            // Mark messages from this sender as read
            const { error: updateError } = await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('receiver_id', supabaseUser.id)
                .eq('sender_id', otherUserId)
                .eq('is_read', false);

            if (updateError) {
                console.error("Error marking messages as read:", updateError);
            } else {
                // Clear unread count for this conversation
                setUnreadCounts((prev) => {
                    const updated = { ...prev };
                    delete updated[otherUserId];
                    return updated;
                });
            }
        } catch (e) {
            console.error("Error in fetchMessages:", e);
        } finally {
            setIsMessagesLoading(false);
        }
    };

        fetchMessages();

        // Set up Realtime Subscription scoped to this conversation pair
        const channelName = `messages:${[supabaseUser.id, otherUserId].sort().join('-')}`;
        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'messages' },
                (payload) => {
                    // Update unread counts and previews regardless of current view
                    fetchUnreadCounts();
                    
                    if (payload.eventType === 'INSERT') {
                        // Only append if it belongs to this conversation and isn't deleted
                        if (
                            ((payload.new.sender_id === supabaseUser.id && payload.new.receiver_id === otherUserId && !payload.new.deleted_by_sender) ||
                            (payload.new.sender_id === otherUserId && payload.new.receiver_id === supabaseUser.id && !payload.new.deleted_by_receiver))
                        ) {
                            setMessages((prev) => {
                                // Avoid duplicates from optimistic update
                                const isDuplicate = prev.some(
                                    (m) => m.content === payload.new.content &&
                                        m.sender_id === payload.new.sender_id &&
                                        typeof m.id === 'string' && m.id.startsWith('temp-')
                                );
                                if (isDuplicate) {
                                    return prev.map((m) =>
                                        (typeof m.id === 'string' && m.id.startsWith('temp-') &&
                                            m.content === payload.new.content &&
                                            m.sender_id === payload.new.sender_id)
                                            ? payload.new
                                            : m
                                    );
                                }
                                return [...prev, payload.new];
                            });
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        // Handle soft deletes or read status updates
                        const updatedMsg = payload.new;
                        const isDeletedForUs = (updatedMsg.sender_id === supabaseUser.id && updatedMsg.deleted_by_sender) ||
                                              (updatedMsg.receiver_id === supabaseUser.id && updatedMsg.deleted_by_receiver);
                        
                        if (isDeletedForUs) {
                            setMessages(prev => prev.filter(m => m.id !== updatedMsg.id));
                        } else {
                            setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
                        }

                        // Also refresh the sidebar preview
                        if (activeConversation) {
                            fetchLastMessages([activeConversation]);
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeConversation, supabaseUser, fetchUnreadCounts]);

    // Auto-scroll to the newest message whenever the messages array changes
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollToBottom();
        }
    }, [messages]);

    // Handle clicks outside the context menu to close it
    useEffect(() => {
        const handleClickOutside = () => setContextMenu({ ...contextMenu, visible: false });
        if (contextMenu.visible) {
            window.addEventListener('click', handleClickOutside);
        }
        return () => window.removeEventListener('click', handleClickOutside);
    }, [contextMenu.visible, contextMenu]);

    const handleConversationClick = (member) => {
        setActiveConversation(member);
        setMessages([]); // Clear messages while new ones load
        setIsMessagesLoading(true);
        setMessageError(null);
        setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
    };

    const handleSend = async (textContent) => {
        if (!textContent || !textContent.trim() || !activeConversation || !supabaseUser) return;

        const otherUserId = activeConversation.auth_uid;
        if (!otherUserId) {
            console.error("Cannot send message: family member has no linked account");
            return;
        }

        const cleanText = textContent.replace(/<[^>]*>/g, '').trim();
        if (!cleanText) return;

        const newMessage = {
            sender_id: supabaseUser.id,
            receiver_id: otherUserId,
            content: cleanText,
            is_read: false,
            deleted_by_sender: false,
            deleted_by_receiver: false
        };

        setMessages((prev) => [
            ...prev,
            { ...newMessage, id: `temp-${Date.now()}`, created_at: new Date().toISOString() }
        ]);

        const { error } = await supabase
            .from('messages')
            .insert([newMessage]);

        if (error) {
            console.error("Error sending message:", error);
            setMessages((prev) => prev.filter((m) => !(typeof m.id === 'string' && m.id.startsWith('temp-'))));
        }

        setLastMessages((prev) => ({
            ...prev,
            [otherUserId]: cleanText.length > 35 ? cleanText.substring(0, 35) + '...' : cleanText
        }));

        setMessageInputValue("");
    };

    const handleDeleteMessage = async (messageId) => {
        if (!supabaseUser || !messageId) return;
        setContextMenu({ ...contextMenu, visible: false });

        // Guard against deleting optimistic (temp) messages
        if (typeof messageId === 'string' && messageId.startsWith('temp-')) {
            console.warn("Cannot delete message before it is synced to database.");
            return;
        }

        const messageToDelete = messages.find(m => m.id === messageId);
        if (!messageToDelete) return;

        const isSender = messageToDelete.sender_id === supabaseUser.id;
        const updateField = isSender ? 'deleted_by_sender' : 'deleted_by_receiver';

        // Optimistic update
        setMessages(prev => prev.filter(m => m.id !== messageId));

        const { error } = await supabase
            .from('messages')
            .update({ [updateField]: true })
            .eq('id', messageId);

        if (error) {
            console.error("Error deleting message from database:", error);
            // Revert on error
            fetchMessagesForActiveConversation();
            alert("Failed to delete message. This might be due to server permissions.");
        } else {
            // Successfully deleted - refresh the preview in the sidebar
            if (activeConversation) {
                fetchLastMessages([activeConversation]);
            }
        }
    };

    const handleContextMenu = (e, messageId) => {
        const bubble = e.target.closest('.cs-message__content');
        if (!bubble) return;

        e.preventDefault();

        // Professional boundary check
        const menuWidth = 160; 
        const menuHeight = 50;  
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let x = e.clientX;
        let y = e.clientY;

        // Flip horizontally if near the right edge
        if (x + menuWidth > viewportWidth) {
            x = x - menuWidth;
        }

        // Flip vertically if near the bottom edge
        if (y + menuHeight > viewportHeight) {
            y = y - menuHeight;
        }

        setContextMenu({
            visible: true,
            x,
            y,
            messageId
        });
    };

    // Helper to refresh messages (used for revert)
    const fetchMessagesForActiveConversation = async () => {
        if (!activeConversation || !supabaseUser) return;
        setIsMessagesLoading(true);
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${supabaseUser.id},receiver_id.eq.${activeConversation.auth_uid}),and(sender_id.eq.${activeConversation.auth_uid},receiver_id.eq.${supabaseUser.id})`)
            .order('created_at', { ascending: true });
            
        if (!error && data) {
            const filtered = data.filter(msg => {
                const isOurs = msg.sender_id === supabaseUser.id;
                return isOurs ? !msg.deleted_by_sender : !msg.deleted_by_receiver;
            });
            setMessages(filtered);
        }
        setIsMessagesLoading(false);
    };

    const handleProfileNavigation = (userId) => {
        if (userId) {
            navigate(`/account/${userId}`);
        }
    };

    const formatDateSeparator = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    };

    const shouldShowDateSeparator = (messages, index) => {
        if (index === 0) return true;
        const prevDate = new Date(messages[index - 1].created_at).toDateString();
        const currDate = new Date(messages[index].created_at).toDateString();
        return prevDate !== currDate;
    };

    return (
        <div className="chat-page-container">
            <NavBar />
            <div className="chat-wrapper">
                <MainContainer responsive>
                    <Sidebar position="left" scrollable={true}>
                        <div className="chat-sidebar-header">
                            <div className="chat-sidebar-tabs">
                                <button 
                                    className={`sidebar-tab ${activeSidebarTab === "messages" ? "active" : ""}`}
                                    onClick={() => setActiveSidebarTab("messages")}
                                >
                                    Messages
                                </button>
                                <button 
                                    className={`sidebar-tab ${activeSidebarTab === "family" ? "active" : ""}`}
                                    onClick={() => setActiveSidebarTab("family")}
                                >
                                    All Family
                                </button>
                            </div>
                            <div className="chat-search-container">
                                <input 
                                    type="text" 
                                    placeholder={activeSidebarTab === "messages" ? "Search chats..." : "Find family members..."}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="chat-search-input"
                                />
                                <span className="chat-search-icon">🔍</span>
                            </div>
                        </div>
                        {isLoading ? (
                            <div className="chat-loading-state">
                                <div className="chat-spinner"></div>
                                <p>Loading family members...</p>
                            </div>
                        ) : (
                            <ConversationList>
                                {familyMembers
                                    .filter(m => {
                                        const fullName = `${m.firstname} ${m.lastname}`.toLowerCase();
                                        const matchesSearch = fullName.includes(searchTerm.toLowerCase());
                                        
                                        if (activeSidebarTab === "messages") {
                                            // Only show those with message history
                                            return matchesSearch && lastMessages[m.auth_uid];
                                        }
                                        // Show everyone with an account
                                        return matchesSearch;
                                    })
                                    .map((member) => {
                                    const memberUid = member.auth_uid;
                                    const unreadCount = unreadCounts[memberUid] || 0;
                                    const lastMsg = lastMessages[memberUid] || "Start a conversation";

                                    return (
                                        <Conversation
                                            key={member.id}
                                            name={`${member.firstname} ${member.lastname}`}
                                            info={lastMsg}
                                            active={activeConversation?.id === member.id}
                                            unreadCnt={unreadCount > 0 ? unreadCount : undefined}
                                            unreadDot={unreadCount > 0}
                                            onClick={() => handleConversationClick(member)}
                                        >
                                            <Avatar
                                                src={member.avatar || defaultAvatar}
                                                name={`${member.firstname} ${member.lastname}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleProfileNavigation(member.auth_uid);
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </Conversation>
                                    );
                                })}
                            </ConversationList>
                        )}
                    </Sidebar>

                    <ChatContainer>
                        {activeConversation ? (
                            <ConversationHeader>
                                <Avatar
                                    src={activeConversation.avatar || defaultAvatar}
                                    name={`${activeConversation.firstname} ${activeConversation.lastname}`}
                                    onClick={() => handleProfileNavigation(activeConversation.auth_uid)}
                                    style={{ cursor: 'pointer' }}
                                />
                                <ConversationHeader.Content
                                    userName={`${activeConversation.firstname} ${activeConversation.lastname}`}
                                    onClick={() => handleProfileNavigation(activeConversation.auth_uid)}
                                    style={{ cursor: 'pointer' }}
                                />
                            </ConversationHeader>
                        ) : (
                            <ConversationHeader>
                                <ConversationHeader.Content
                                    userName="KinTree Chat"
                                    info="Select a family member to start chatting"
                                />
                            </ConversationHeader>
                        )}

                        <MessageList ref={messagesEndRef}>
                            {messageError ? (
                                <MessageSeparator content={messageError} />
                            ) : null}

                            {!activeConversation ? (
                                <div className="chat-empty-state">
                                    <div className="chat-empty-icon">💬</div>
                                    <h3>Welcome to KinTree Chat</h3>
                                    <p>Select a family member from the sidebar to start a private conversation.</p>
                                </div>
                            ) : isMessagesLoading ? (
                                <div className="chat-loading-state">
                                    <div className="chat-spinner"></div>
                                    <p>Loading conversation...</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="chat-empty-state">
                                    <div className="chat-empty-icon">👋</div>
                                    <h3>Say hello!</h3>
                                    <p>This is the beginning of your conversation with {activeConversation.firstname}.</p>
                                    <p className="chat-empty-hint">Type a message below to start chatting.</p>
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                const isOurs = msg.sender_id === supabaseUser.id;
                                const showDateSep = shouldShowDateSeparator(messages, index);

                                return (
                                    <React.Fragment key={msg.id}>
                                        {showDateSep && (
                                            <MessageSeparator key={`sep-${msg.id}`} content={formatDateSeparator(msg.created_at)} />
                                        )}
                                        <Message
                                            key={msg.id}
                                            model={{
                                                message: msg.content,
                                                sentTime: new Date(msg.created_at).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }),
                                                sender: isOurs ? "You" : activeConversation.firstname,
                                                direction: isOurs ? "outgoing" : "incoming",
                                                position: "single"
                                            }}
                                            onContextMenu={(e) => handleContextMenu(e, msg.id)}
                                        >
                                            <Message.Footer
                                                sentTime={new Date(msg.created_at).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            />
                                        </Message>
                                    </React.Fragment>
                                );
                            }))}
                        </MessageList>

                        {activeConversation && (
                            <MessageInput
                                placeholder="Type a message..."
                                value={messageInputValue}
                                onChange={(val) => setMessageInputValue(val)}
                                onSend={(innerHtml) => {
                                    const text = innerHtml.replace(/<[^>]*>/g, '');
                                    handleSend(text);
                                }}
                                disabled={!activeConversation}
                                attachButton={false}
                            />
                        )}
                    </ChatContainer>
                </MainContainer>
            </div>

            {/* Custom Context Menu */}
            <AnimatePresence>
                {contextMenu.visible && (
                    <motion.div 
                        className="message-context-menu" 
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        transition={{ duration: 0.1 }}
                    >
                        <div 
                            className="context-menu-item delete" 
                            onClick={() => handleDeleteMessage(contextMenu.messageId)}
                        >
                            <span>🗑️</span> Delete Message
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Chat;