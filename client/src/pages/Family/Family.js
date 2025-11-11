import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as styles from './styles';
import Popup from 'reactjs-popup';
import { ReactComponent as DropdownIcon } from '../../assets/dropdown-arrow.svg';
import NavBar from '../../components/NavBar/NavBar';
import { useCurrentUser } from '../../CurrentUserProvider';
import { familyTreeService } from '../../services/familyTreeService';

const defaultAvatar = require('../../assets/default-avatar.png');

function Family() {
    const sortOptionsRef = useRef(null);

    const [filterSelection, setFilter] = useState("");
    const [sortSelection, setSort] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [familyData, setFamilyData] = useState([]);

    const { supabaseUser, currentAccountID } = useCurrentUser();

    document.body.style.overflow = 'hidden';
    document.body.style.width = '100%'; 
    
    useEffect(() => {
        const fetchFamilyData = async () => {
            try {
                const responseData = await familyTreeService.getFamilyMembersByUserId(currentAccountID);
                setFamilyData(responseData);
            } catch (error) {
                console.error('Error fetching family data:', error.message);
            }
        };
        
        fetchFamilyData();
    }, [currentAccountID]);

    useEffect(() => {
        let filtered = Array.isArray(familyData) ? familyData : [];

        if (searchTerm !== "") {
            filtered = filtered.filter(member =>
                member["firstname"].toLowerCase().includes(searchTerm.toLowerCase()) ||
                member["lastname"].toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // TODO: no longer works with the dynamic data bc mat/pat flags are not stored in treeMembers
        // if (filterSelection !== "") {
        //     filtered = filtered.filter(member => member.data["flag"] === filterSelection);
        // }

        if (sortSelection !== "") {
            filtered = filtered.sort((a, b) => {
                if(sortSelection === "firstname") {
                    return a["firstname"].localeCompare(b["firstname"]);
                }
                else if(sortSelection === "lastname") {
                    return a["lastname"].localeCompare(b["lastname"]);
                }
                return 0;
            });
        }
        console.log('Filtered family data:', filtered);

        setFilteredData(filtered);
    }, [searchTerm, filterSelection, sortSelection, familyData]);

    return (
        <div style={styles.DefaultStyle}>
            <NavBar />
            {/* main container */}
            <div style={{width: '150px'}}></div>
            <div style={styles.ContainerStyle}>
                {/* header */}
                <h1 style={{ marginBottom: '0px'}}>The {supabaseUser?.user_metadata?.last_name} Family</h1>
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
                                    <option value="firstname">First Name (A-Z)</option>
                                    <option value="lastname">Last Name (A-Z)</option>
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
                                <img src={member?.avatar ? member?.avatar : defaultAvatar} alt={`${member["firstname"]} ${member["lastname"]}`} style={styles.AvatarStyle} />
                                {member["firstname"]} {member["lastname"]}
                            </div>
                            <div>
                                <Link to={`/account/${member["userid"]}`} style={styles.MemberLinkStyle}>
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