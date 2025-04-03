import React from 'react';
import * as styles from './styles';
import { useParams } from 'react-router-dom';

function ViewSharedTree() {
    // takes id from url path
    const { id } = useParams();
    return (
        <div style={styles.DefaultStyle}>

        </div>
    )
}

export default ViewSharedTree;