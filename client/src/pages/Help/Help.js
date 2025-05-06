import React from "react";
import * as styles from './styles';
import NavBar from '../../components/NavBar/NavBar';

function Help() {
    return (
        <div style={styles.DefaultStyle}>
            <NavBar />
            <div style={styles.RightSide}>
                <div style={{width: '150px'}}></div>
                <div style={styles.ContainerStyle}>
                    <h1 style={styles.Title}>Frequently Asked Questions</h1>
                    <ul style={styles.List}>
                        <li style={styles.Question}>How can I find a family member?</li><br/>
                        <li style={styles.Text}>You can add a new family member from the <i>Tree</i> page. Click the `+` symbol to open the `Add Family Member` pop-up. Then, you can search for an existing user, or manually add a family member.</li><br/>
                        <li style={styles.Question}>How can I edit my family member's relationship type?</li><br/>
                        <li style={styles.Text}>To manage a family member's relationship type, navigate to the family member's account page. To find their account page, search for the family member on the <i>Family</i> page, then click `View`. From the family member's account page, simply click `Manage Relationship Type` to change their relationship to you.</li><br/>
                        <li style={styles.Question}>Where can I learn more about KinTree?</li><br/>
                        <li style={styles.Text}>KinTree is an open source application. To learn more about the KinTree platform, you can read our documentation at <a href="https://github.com/OwenAdams2023/SeniorProject_KinTree" target="_blank">https://github.com/OwenAdams2023/SeniorProject_KinTree</a>.</li><br/>
                    </ul>
                    
                    {/* line */}
                    <hr style={{
                        color: '#000000',
                        backgroundColor: '#000000',
                        height: .1,
                        width: '200px',
                        borderColor : '#000000',
                        margin: '5px 20px 5px 2px'
                    }}/>
                    <h1 style={styles.Title}>Feedback?</h1>
                    <p style={styles.Text}> We would love to hear from you! Please provide a rating based on your experience with KinTree.</p>
                    <p style={styles.Text}>(Feedback Mechanism Coming Soon)</p>
                </div>
            </div>
        </div>
    )
}

export default Help;