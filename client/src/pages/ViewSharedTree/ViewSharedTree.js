import React, { useRef, useEffect, useState } from 'react';
import * as styles from './styles';
import { useParams } from 'react-router-dom';
import f3 from 'family-chart';
import NavBar from '../../components/NavBar/NavBar';
import { Outlet } from 'react-router-dom';

function FamilyTree({ treeData }) {
    const contRef = useRef();

    useEffect(() => {
        if (!treeData || !Array.isArray(treeData) || treeData.length === 0) {
            console.error('Invalid treeData for FamilyTree:', treeData);
            return;
        }

        if (!contRef.current) {
            console.error('Invalid contRef for FamilyTree');
            return;
        }

        // Clean up any existing chart first
        const existingChart = document.querySelector('#FamilyChart');
        if (existingChart) {
            existingChart.innerHTML = '';
        }

        try {
            console.log('Creating chart with treeData:', treeData);
            const f3chart = f3.createChart('#FamilyChart', treeData)
                .setTransitionTime(1000)
                .setCardXSpacing(250)
                .setCardYSpacing(150)
                .setShowSiblingsOfMain(true)
                .setSingleParentEmptyCard(false)
                .setOrientationVertical();

            const f3Card = f3chart.setCardHtml()
                .setCardDisplay([["first name"], ["last name"]])
                .setCardDim({})
                .setMiniTree(true)
                .setStyle('imageCircle')
                .setOnHoverPathToMain()
                .setOnCardClick((e, data) => {
                    window.location.href = `/account/${data?.data?.id}`;
                });

            f3chart.updateTree({ initial: true });
        } catch (error) {
            console.error('Error creating family tree chart:', error);
        }
    }, [treeData]);

    return <div className="f3 f3-cont" id="FamilyChart" ref={contRef}></div>;
}

function ViewSharedTree() {
    const { id } = useParams();
    const [username, setUsername] = useState("");
    const [treeData, setTreeData] = useState(null);

    useEffect(() => {
        if (!id) return;

        async function fetchData() {
            try {
                const treeResponse = await fetch(`http://localhost:5000/api/share-trees/${id}`);
                if (!treeResponse.ok) {
                    console.error('Error fetching tree:', treeResponse);
                    return;
                }
                const data = await treeResponse.json();
                
                // Parse treeinfo - handles double stringification
                let parsedTreeData = JSON.parse(data.treeinfo);
                while (typeof parsedTreeData === 'string') { 
                    parsedTreeData = JSON.parse(parsedTreeData);
                }
                setTreeData(parsedTreeData);

                const userResponse = await fetch(`http://localhost:5000/api/auth/user/${data.senderid}`);
                if (!userResponse.ok) {
                    console.error('Error fetching user:', userResponse);
                    return;
                }
                const userData = await userResponse.json();
                setUsername(`${userData?.firstname} ${userData?.lastname}`);
            } catch (error) {
                console.error('Error in fetchData:', error);
            }
        }

        fetchData();
    }, [id]);

    return (
        <div style={styles.DefaultStyle}>
            <NavBar />
            <div style={styles.MainContainerStyle} className="main-container">
                {/* header content */}
                <div style={styles.HeaderStyle}>
                    {/* titles */}
                    <div>
                        <h1 style={{marginBottom: "0px"}}>{username.split(" ")[0]}'s Tree</h1>
                        <hr  style={{
                            color: '#000000',
                            backgroundColor: '#000000',
                            height: .1,
                            width: '200px',
                            borderColor : '#000000'
                        }}/>
                        <h2 style={{fontFamily: "Aboreto", marginTop: "0px"}}>The {username.split(" ")[1]} Family</h2> 
                    </div>
                </div>
                

                {/* family tree container */}
                {/* using a border fo</div>r now to differentiate tree's viewable/draggable area, and to contain automatic scaling of the tree */}
                <div style={styles.FamilyTreeContainerStyle}> <FamilyTree treeData={treeData} /> </div>
            </div>  
            <Outlet />
        </div>
    )
}

export default ViewSharedTree;