import React from 'react';
import { Link } from 'react-router-dom';
import * as styles from './styles';
import { ReactComponent as CalendarIcon } from '../../assets/calendar.svg';
import CreateEventPopup from '../../components/CreateEvent/CreateEvent';

// TODO: need to implement auth check for this page (and others), redirect to login if not authenticated
function Home() {
    return (
        <div style={styles.DefaultStyle}>
            <Link to="/tree" >View Tree Page</Link>
            <CreateEventPopup trigger={<CalendarIcon style={styles.CalendarButton} />} />
        </div>
    )
}

export default Home;