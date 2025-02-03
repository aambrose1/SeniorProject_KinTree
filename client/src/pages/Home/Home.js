import React from 'react';
import { Link } from 'react-router-dom';
import * as styles from './styles';
import NavBar from '../../components/NavBar/NavBar';

//ToDo: Import tree and display it on the user's home page
function Home() {
    return (
        <>
            <div className="home-page">
                <NavBar/>
            </div>

        </>
        
    )
}

export default Home;