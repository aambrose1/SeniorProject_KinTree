import React from 'react';
import { Link } from 'react-router-dom';
import * as styles from './styles';
import NavBar from '../../components/NavBar/NavBar';

//ToDo: Import tree and display it on the user's home page
function Home() {
    return (
        <>
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <div className="Container">
                    <p>
                        Welcome to KinTree! This is the client side of the application. It's in progress.
                    </p>
                </div>
                <a
                    className="App-link"
                    href="https://github.com/OwenAdams2023/SeniorProject_KinTree"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Github Repository
                </a>
            </header>

        </>
        
    )
}

export default Home;