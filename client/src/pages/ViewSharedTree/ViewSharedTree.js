import React, { useRef, useEffect, useState } from 'react';
import * as styles from './styles';
import { useParams } from 'react-router-dom';
import f3 from 'family-chart';
import NavBar from '../../components/NavBar/NavBar';
import { Outlet } from 'react-router-dom';
import { useCurrentUser } from '../../CurrentUserProvider'; // import the context

var treeResponseData;
var parsedData;

function FamilyTree() {
    let {id} = useParams();
    const contRef = useRef(null); // Use a ref for the container
    const { currentAccountID } = useCurrentUser(); // Use the hook in the function component

    useEffect(() => {
        if (!contRef.current) {
            console.log("failure");
            return;
        }
        console.log("success");

        function create(data) {
            const f3Chart = f3.createChart('#FamilyChart', data)
                .setTransitionTime(0)
                .setCardXSpacing(250)
                .setCardYSpacing(150)
                .setOrientationVertical()
                .setSingleParentEmptyCard(false);

            const f3Card = f3Chart.setCard(f3.CardHtml)
                .setCardDisplay([["first name"], []])
                .setCardDim({ width: 80, height: 80 })
                .setMiniTree(false)
                .setStyle('imageCircle')
                .setOnHoverPathToMain();

            f3Card.setOnCardClick((e, d) => {}); // Remove zooming transitions

            f3Chart.updateMainId("21");
            f3Chart.updateTree({ initial: true });
        }

        let getRequestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch(`http://localhost:5000/api/share-trees/${id}`, getRequestOptions)
            .then(async (response) => {
                if (response.ok) {
                    let treeData = await response.json();
                    console.log(treeData);
                    create(treeData.treeInfo);
                } else {
                    console.error('Error:', response);
                }
            });
    }, [currentAccountID]);

    return <div className="f3 f3-cont" id="FamilyChart" ref={contRef}></div>;
}

function ViewSharedTree() {
    // takes id from url path
    const { id } = useParams();
    const [username, setUsername] = useState("");

    let getRequestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    };

    fetch(`http://localhost:5000/api/share-trees/${id}`, getRequestOptions)
            .then(async (response) => {
                if (response.ok) {
                    let treeData = await response.json();
                    console.log(treeData);
                    return treeData;
                } else {
                    console.error('Error:', response);
                }
            })
    // find user's name from senderID
    .then(async (treeData) => {
    fetch(`http://localhost:5000/api/auth/user/${treeData.senderID}`)
        .then(async (response) => {
            if (response.ok) {
                let responseData = await response.json();
                console.log(responseData);
                setUsername(responseData?.username);
            } 
            else {
                console.log('Error:', response);
            }
        })});

    return (
        <div style={styles.DefaultStyle}>
            <NavBar />
            {/* TODO make these work again, removed them for now so I could work with the header placement; might want to integrate these with actual background somehow */}
            {/* <div style={styles.ArrowContainerStyle}>
                <div style={{flex: '50%'}}></div>
                <ArrowTR style={styles.TopRightArrowStyle} />
                <ArrowBL style={styles.BottomLeftArrowStyle} />
                <div style={{flex: '50%', textAlign: 'right'}}></div>
            </div>  */}

            <div style={styles.MainContainerStyle} className="main-container">
                {/* <Link to="/" style={{ position: 'absolute', top: '0px', left: '0px', margin: '10px' }}>Home</Link> */}
                

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
                <div style={styles.FamilyTreeContainerStyle}> <FamilyTree/> </div>
            </div>
            <Outlet />
        </div>
    )
}

export default ViewSharedTree;