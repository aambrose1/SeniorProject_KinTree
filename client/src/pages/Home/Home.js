import React from 'react';
import { Link } from 'react-router-dom';
import * as styles from './styles';
import { ReactComponent as CalendarIcon } from '../../assets/calendar.svg';
import { ReactComponent as PlusIcon } from '../../assets/plus-sign.svg';
import CreateEventPopup from '../../components/CreateEvent/CreateEvent';
import CreateMemoryPopup from '../../components/CreateMemory/CreateMemory';

// TODO: need to implement auth check for this page (and others), redirect to login if not authenticated
function Home() {
    return (
        <div style={styles.DefaultStyle}>
            <Link to="/tree" >View Tree Page</Link>
            <CreateEventPopup trigger={<CalendarIcon style={styles.CalendarButton} />} />
            <CreateMemoryPopup trigger={<PlusIcon style={styles.PlusButton} />} />
        </div>
    )
}

export default Home;