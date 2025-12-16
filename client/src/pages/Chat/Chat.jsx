import React from 'react';
import * as styles from './styles';
import NavBar from '../../components/NavBar/NavBar';


function Chat() {
    return (
        <div style={styles.DefaultStyle}>
            <NavBar />
            <div style={styles.RightSide}>
                <div style={{width: '150px'}}></div>
                <div style={styles.ContainerStyle}>
                    <h1 style={styles.Title}>Chat</h1>
                    <p style={styles.Text}>Chat functionality coming soon!</p>
                </div>
            </div>
        </div>
    )
}
export default Chat;