import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    const { supabaseUser, currentAccountID } = useCurrentUser();
    const [familyMembers, setFamilyMembers] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [messageInputValue, setMessageInputValue] = useState("");
    const [unreadCounts, setUnreadCounts] = useState({}); // { sender_id: count }
    const [lastMessages, setLastMessages] = useState({}); // { sender_id: "last message text" }
    const [messageError, setMessageError] = useState(null);

    const messagesEndRef = useRef(null);

    // Fetch unread counts for all conversations
    const fetchUnreadCounts = useCallback(async () => {
        if (!supabaseUser) return;

        const { data, error } = await supabase
            .from('messages')
            .select('sender_id')
            .eq('receiver_id', supabaseUser.id)
            .eq('is_read', false);

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
                .select('content, created_at')
                .or(
                    `and(sender_id.eq.${supabaseUser.id},receiver_id.eq.${member.auth_uid}),and(sender_id.eq.${member.auth_uid},receiver_id.eq.${supabaseUser.id})`
                )
                .order('created_at', { ascending: false })
                .limit(1);

            if (!error && data && data.length > 0) {
                // Truncate long messages for preview
                const preview = data[0].content.length > 35
                    ? data[0].content.substring(0, 35) + '...'
                    : data[0].content;
                previews[member.auth_uid] = preview;
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
            setMessageError(null);

            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(
                    `and(sender_id.eq.${supabaseUser.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${supabaseUser.id})`
                )
                .order('created_at', { ascending: true });

            if (error) {
                console.error("Error fetching messages:", error);
                setMessageError("Could not load messages. Please try again.");
            } else {
                setMessages(data || []);
            }

            // Mark messages from this sender as read
            // NOTE: requires an UPDATE RLS policy on the messages table
            const { error: updateError } = await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('receiver_id', supabaseUser.id)
                .eq('sender_id', otherUserId)
                .eq('is_read', false);

            if (updateError) {
                console.error("Error marking messages as read:", updateError);
                // This will fail if no UPDATE RLS policy exists — see README
            } else {
                // Clear unread count for this conversation
                setUnreadCounts((prev) => {
                    const updated = { ...prev };
                    delete updated[otherUserId];
                    return updated;
                });
            }
        };

        fetchMessages();

        // Set up Realtime Subscription scoped to this conversation pair
        const channelName = `messages:${[supabaseUser.id, otherUserId].sort().join('-')}`;
        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    // Only append if it belongs to this conversation
                    if (
                        (payload.new.sender_id === supabaseUser.id && payload.new.receiver_id === otherUserId) ||
                        (payload.new.sender_id === otherUserId && payload.new.receiver_id === supabaseUser.id)
                    ) {
                        setMessages((prev) => {
                            // Avoid duplicates from optimistic update
                            const isDuplicate = prev.some(
                                (m) => m.content === payload.new.content &&
                                    m.sender_id === payload.new.sender_id &&
                                    typeof m.id === 'string' && m.id.startsWith('temp-')
                            );
                            if (isDuplicate) {
                                // Replace the temp message with the real one
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
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeConversation, supabaseUser]);

    // Auto-scroll to the newest message whenever the messages array changes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleConversationClick = (member) => {
        setActiveConversation(member);
        setMessages([]); // Clear messages while new ones load
        setMessageError(null);
    };

    const handleSend = async (textContent) => {
        if (!textContent || !textContent.trim() || !activeConversation || !supabaseUser) return;

        const otherUserId = activeConversation.auth_uid;
        if (!otherUserId) {
            console.error("Cannot send message: family member has no linked account");
            return;
        }

        // Strip HTML tags that chatscope's contentEditable may inject
        const cleanText = textContent.replace(/<[^>]*>/g, '').trim();
        if (!cleanText) return;

        const newMessage = {
            sender_id: supabaseUser.id,
            receiver_id: otherUserId,
            content: cleanText,
            is_read: false
        };

        // Optimistic update — show the message immediately
        setMessages((prev) => [
            ...prev,
            { ...newMessage, id: `temp-${Date.now()}`, created_at: new Date().toISOString() }
        ]);

        const { error } = await supabase
            .from('messages')
            .insert([newMessage]);

        if (error) {
            console.error("Error sending message:", error);
            // Remove optimistic message on failure
            setMessages((prev) => prev.filter((m) => !(typeof m.id === 'string' && m.id.startsWith('temp-'))));
        }

        // Update last message preview for this conversation
        setLastMessages((prev) => ({
            ...prev,
            [otherUserId]: cleanText.length > 35 ? cleanText.substring(0, 35) + '...' : cleanText
        }));

        setMessageInputValue("");
    };

    // Format timestamp for message grouping
    const formatDateSeparator = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    };

    // Determine if we should show a date separator before this message
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
                            <h3>Messages</h3>
                        </div>
                        <ConversationList>
                            {isLoading ? (
                                <div className="chat-loading-state">
                                    <div className="chat-spinner"></div>
                                    <p>Loading family members...</p>
                                </div>
                            ) : familyMembers.length === 0 ? (
                                <div className="chat-empty-members">
                                    <p>No family members with accounts found.</p>
                                    <p className="chat-empty-hint">
                                        Family members need a KinTree account to chat.
                                    </p>
                                </div>
                            ) : (
                                familyMembers.map((member) => {
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
                                            />
                                        </Conversation>
                                    );
                                })
                            )}
                        </ConversationList>
                    </Sidebar>

                    <ChatContainer>
                        {activeConversation ? (
                            <ConversationHeader>
                                <Avatar
                                    src={activeConversation.avatar || defaultAvatar}
                                    name={`${activeConversation.firstname} ${activeConversation.lastname}`}
                                />
                                <ConversationHeader.Content
                                    userName={`${activeConversation.firstname} ${activeConversation.lastname}`}
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

                        <MessageList>
                            {!activeConversation && (
                                <div className="chat-empty-state">
                                    <div className="chat-empty-icon">💬</div>
                                    <h3>Welcome to KinTree Chat</h3>
                                    <p>Select a family member from the sidebar to start a conversation.</p>
                                </div>
                            )}

                            {messageError && (
                                <MessageSeparator content={messageError} />
                            )}

                            {messages.map((msg, index) => {
                                const isOurs = msg.sender_id === supabaseUser.id;
                                const isLastMessage = index === messages.length - 1;
                                const showDateSep = shouldShowDateSeparator(messages, index);

                                return (
                                    <React.Fragment key={msg.id}>
                                        {showDateSep && (
                                            <MessageSeparator content={formatDateSeparator(msg.created_at)} />
                                        )}
                                        <div ref={isLastMessage ? messagesEndRef : null}>
                                            <Message
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
                                            >
                                                <Message.Footer
                                                    sentTime={new Date(msg.created_at).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                />
                                            </Message>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </MessageList>

                        <MessageInput
                            placeholder="Type a message..."
                            value={messageInputValue}
                            onChange={(val) => setMessageInputValue(val)}
                            onSend={(innerHtml) => {
                                // chatscope passes the innerHTML; strip tags for clean text
                                const text = innerHtml.replace(/<[^>]*>/g, '');
                                handleSend(text);
                            }}
                            disabled={!activeConversation}
                            attachButton={false}
                        />
                    </ChatContainer>
                </MainContainer>
            </div>
        </div>
    );
}

export default Chat;