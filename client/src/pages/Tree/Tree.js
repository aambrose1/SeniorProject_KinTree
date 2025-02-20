import React from 'react';
import * as styles from './styles';
// import { ReactComponent as TreeIcon } from '../../assets/background-tree.svg'; // background tree image from Figma; TODO configure overlay with tree svg
import f3 from 'family-chart';
import './tree.css'; // styling adapted from family-chart package sample code
import { ReactComponent as PlusSign } from '../../assets/plus-sign.svg';
import { ReactComponent as ArrowTR } from '../../assets/arrow-1.svg';
import { ReactComponent as ArrowBL } from '../../assets/arrow-2.svg';
import AddFamilyMemberPopup from '../../components/AddFamilyMember/AddFamilyMember';
import { Link } from 'react-router-dom';

// FamilyTree class structure derived from family-chart package sample code
// see https://github.com/donatso/family-chart/

class FamilyTree extends React.Component {
    cont = React.createRef();
  
    componentDidMount() {
        if (!this.cont.current) return;
        
        create(treeData);

        function create(data) {
            const f3Chart = f3.createChart('#FamilyChart', data)
                .setTransitionTime(0)
                .setCardXSpacing(250)
                .setCardYSpacing(150)
                .setOrientationVertical()
                .setSingleParentEmptyCard(true, {label: 'ADD'})
            
            const f3Card = f3Chart.setCard(f3.CardHtml)
                // can edit displayed fields here
                .setCardDisplay([["first name"],[]])
                .setCardDim({"width":80,"height":80})
                .setMiniTree(true)
                .setStyle('imageCircle')
                .setOnHoverPathToMain()
            
            // remove zooming transitions
            f3Card.setOnCardClick((e, d) => {})
            
            f3Chart.updateTree({initial: true})
        }
    }
  
    render() {
      return <div className="f3 f3-cont" id="FamilyChart" ref={this.cont}></div>;
    }
  }

// sample data for now, but TODO retrieve from API
// can add "avatar" field and link under data object to show pfp on tree
let treeData = [
    {
    "id": "0",
    "rels": {
        "father": "1",
        "mother": "2",
        "children": ["5"]
    },
    "data": {
        "first name": "Ronald",
        "last name": "Smith",
        "avatar": "https://i.imgur.com/mfojszj.png"
    }
    },
    {
    "id": "1",
    "rels": {
        "father": "3",
        "mother": "4",
        "spouses": [
            "2"
        ],
        "children": [
            "0"
        ]
        },
    "data": {
        "first name": "John",
        "last name": "Smith",
        "flag": "paternal"
        }
    },
    {
        "id": "2",
        "rels": {
            "spouses": [
                "1"
            ],
            "children": [
                "0"
            ]
            },
        "data": {
            "first name": "Jane",
            "last name": "Smith",
            "flag": "maternal"
            }
    },
    {
        "id": "3",
        "rels": {
            "children": ["1"],
            "spouses": ["4"]
        },
        "data": {
            "first name": "Alice",
            "last name": "Smith",
            "flag": "paternal"
        }
    },
    {
        "id": "4",
        "rels": {
            "children": ["1"],
            "spouses": ["3"]
        },
        "data": {
            "first name": "Bob",
            "last name": "Smith",
            "flag": "paternal"
        }
    },
    {
        "id": "5",
        "rels": {
            "father": "0",
        },
        "data": {
            "first name": "Tom",
            "last name": "Smith"
        }
    },
];

// builds the actual page
function Tree() {
    let user_lastname = "Smith";
    document.body.style.overflow = 'hidden';
    document.body.style.width = '100%'; 
    return (
        <div style={styles.DefaultStyle}>

            <div style={{ display: 'flex', flexWrap: 'wrap', zIndex: '-1', position: 'relative', width: '100%', height: '100%' }}>
                <div style={{flex: '50%'}}></div>
                <ArrowTR style={{ width: '370px', height: '370px', margin: '20px 20px', flex: '50%', textAlign: 'right', paddingLeft: '70%' }} />
                <ArrowBL style={{ width: '370px', height: '370px', margin: '20px 20px', flex: '50%', paddingRight: '70%' }} />
                <div style={{flex: '50%', textAlign: 'right'}}></div>
            </div> 

            <div style={{width: '100%', height: '100%', position: 'absolute', top: '0', left: '0', zIndex: '10', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column'}}>
                <Link to="/" style={{ position: 'absolute', top: '0px', left: '0px', margin: '10px' }}>Home</Link>
                

                {/* header content */}
                <div style={{display: 'flex'}}>
                    {/* filler space to center header text on page */}
                    <div style={{ width: '64px' }}></div>
                    {/* titles */}
                    <div>
                        <h1 style={{marginBottom: "0px"}}>Your Tree</h1>
                        <hr  style={{
                            color: '#000000',
                            backgroundColor: '#000000',
                            height: .1,
                            width: '200px',
                            borderColor : '#000000'
                        }}/>
                        <h2 style={{fontFamily: "Aboreto", marginTop: "0px"}}>The {user_lastname} Family</h2> 
                    </div>
                    {/* add family member button */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <AddFamilyMemberPopup trigger={<PlusSign style={{ width: '24px', height: '24px', margin: '60px 20px' }} />} />
                    </div>
                </div>
                

                {/* family tree container */}
                {/* using a border fo</div>r now to differentiate tree's viewable/draggable area, and to contain automatic scaling of the tree */}
                <div style={{ width: '80%', height: '70vh', borderStyle: 'double', maxWidth: '800px', borderRadius: '30px' }}> <FamilyTree/> </div>
            </div>
        </div>
    );   
}

export default Tree;