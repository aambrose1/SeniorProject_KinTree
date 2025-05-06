import React from 'react';
import logo from '../../assets/kintreelogo-adobe.png';
import { Link } from 'react-router-dom';
import * as styles from './styles';
import { ReactComponent as CalendarIcon } from '../../assets/calendar.svg';
import { ReactComponent as PlusIcon } from '../../assets/plus-sign.svg';
import CreateEventPopup from '../../components/CreateEvent/CreateEvent';
import CreateMemoryPopup from '../../components/CreateMemory/CreateMemory';
import NavBar from '../../components/NavBar/NavBar';

// TODO: need to implement auth check for this page (and others), redirect to login if not authenticated
function Home() {
    document.body.style.overflow = 'hidden';
    document.body.style.width = '100%'; 
    return (
        <div style={styles.DefaultStyle}>
            <NavBar />
            <Link to="/tree" >View Tree Page</Link>
            
        </div>
    )
}

export default Home;