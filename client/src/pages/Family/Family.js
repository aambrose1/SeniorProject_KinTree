import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as styles from './styles';
import Popup from 'reactjs-popup';
import { ReactComponent as DropdownIcon } from '../../assets/dropdown-arrow.svg';
import NavBar from '../../components/NavBar/NavBar';

const defaultAvatar = require('../../assets/default-avatar.png');

function Family() {
    const sortOptionsRef = useRef(null);

    const [filterSelection, setFilter] = useState("");
    const [sortSelection, setSort] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredData, setFilteredData] = useState([]);

    let user_lastname = "Smith";

    document.body.style.overflow = 'hidden';
    document.body.style.width = '100%'; 

    // TODO replace with API retrieval
    const familyData = useMemo(() => [
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
    ], []);

    useEffect(() => {
        let filtered = familyData;

        if (searchTerm !== "") {
            filtered = filtered.filter(member =>
                member.data["first name"].toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.data["last name"].toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterSelection !== "") {
            filtered = filtered.filter(member => member.data["flag"] === filterSelection);
        }

        if (sortSelection !== "") {
            filtered = filtered.sort((a, b) => {
                if(sortSelection === "firstName") {
                    return a.data["first name"].localeCompare(b.data["first name"]);
                }
                else if(sortSelection === "lastName") {
                    return a.data["last name"].localeCompare(b.data["last name"]);
                }
                return 0;
            });
        }

        setFilteredData(filtered);
    }, [searchTerm, filterSelection, familyData, sortSelection]);

    return (
        <div style={styles.DefaultStyle}>
            <NavBar />
            {/* main container */}
            <div style={styles.ContainerStyle}>
                {/* header */}
                <h1 style={{ marginBottom: '0px'}}>The {user_lastname} Family</h1>
                <hr  style={{
                    color: '#000000',
                    backgroundColor: '#000000',
                    height: .1,
                    width: '90%',
                    borderColor : '#000000'
                }}/>

                {/* search bar */}
                <div style={{ display: 'flex', justifyContent: 'center', width: '70%', padding: '10px' }}>
                    <input
                        type="text"
                        placeholder="Search for family members..."
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontFamily: 'Alata' }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* member list header */}
                <div style={styles.SubtitleContainerStyle}>
                    <h2 style={styles.SubtitleStyle}>Member List</h2>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {/* filter button */}
                        <Popup
                            trigger={<button className="filterButton" style={styles.DropdownButtonStyle}>
                                        Filter
                                        <DropdownIcon style={{ width: '15px', height: '15px', marginLeft: '5px' }} />
                                    </button>}
                            position="bottom left"
                            contentStyle={styles.DropdownSelectorStyle}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', padding: '10px', fontFamily: 'Alata' }}>
                                    <label>
                                       <input type="radio" name="filter" onChange={e => {
                                        setFilter("maternal");
                                       }} checked={filterSelection === "maternal"}/> Maternal
                                    </label>
                                    <label>
                                       <input type="radio" name="filter" onChange={e => {
                                        setFilter("paternal");
                                       }} checked={filterSelection === "paternal"}/> Paternal
                                    </label>
                                    
                                    <button style={{ width: 'fit-content', fontFamily: 'Alata', marginTop: '10px'}} onClick={() => { setFilter("") }}>Clear</button>
                                </div>
                        </Popup>

                        {/* vertical line divider */}
                        <div style={{ width: '1px', height: '20px', backgroundColor: '#000', margin: '0 10px', alignSelf: 'flex-end' }}></div>

                        {/* sort button */}
                        <Popup
                            trigger={<button className="sortButton" style={styles.DropdownButtonStyle}>
                                        Sort
                                        <DropdownIcon style={{ width: '15px', height: '15px', marginLeft: '5px' }} />
                                    </button>}
                            position="bottom left"
                            contentStyle={styles.DropdownSelectorStyle}
                            >

                            <div style={{ display: 'flex', flexDirection: 'column', padding: '10px 0px' }}>
                                <select id="sortOptions" name="sortOptions" style={{fontFamily: 'Alata'}} ref={sortOptionsRef} onChange={e =>{
                                    setSort(e.target.value)
                                }} value={sortSelection}>
                                    <option value="">None</option>
                                    <option value="firstName">First Name (A-Z)</option>
                                    <option value="lastName">Last Name (A-Z)</option>
                                </select>
                            </div>
                            <button style={{fontFamily: 'Alata', width: 'fit-content', marginTop: '10px'}} onClick={() => { setSort(""); }}>Clear</button>

                        </Popup>
                    </div>
                </div>
                <hr style={{
                    color: '#000000',
                    backgroundColor: '#000000',
                    height: .1,
                    width: '90%',
                    borderColor: '#000000'
                }}/>

                {/* member list content */}
                <div style={styles.MemberListStyle}>
                    {filteredData.map((member) => (
                        <div key={member.id} style={styles.MemberStyle}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <img src={member.data["avatar"] ? member.data["avatar"] : defaultAvatar} alt={`${member.data["first name"]} ${member.data["last name"]}`} style={styles.AvatarStyle} />
                                {member.data["first name"]} {member.data["last name"]}
                            </div>
                            <div>
                                <Link to={`/account/${member.id}`} style={styles.MemberLinkStyle}>
                                    View
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Family;