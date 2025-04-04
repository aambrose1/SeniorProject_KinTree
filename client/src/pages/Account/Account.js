import React from 'react';
import * as styles from './styles';
import NavBar from '../../components/NavBar/NavBar';
import CreateAccount from '../CreateAccount/CreateAccount';
import './Account.css';

function Account() {
    return (
        <>
            <NavBar />
            <div>
                <CreateAccount />
            </div>
        </>
    )
}

export default Account;