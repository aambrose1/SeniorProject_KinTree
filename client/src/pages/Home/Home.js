import React from 'react';
import logo from '../../assets/kintreelogo-adobe.png';
import { Link } from 'react-router-dom';
import * as styles from './styles';
import NavBar from '../../components/NavBar/NavBar';

//ToDo: Import tree and display it on the user's home page
function Home() {
    return (
        <>
            <NavBar />
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
                <Link to='/useractivitydash'>Family Events</Link>
            </header>

        </>
        
    )
}

export default Home;