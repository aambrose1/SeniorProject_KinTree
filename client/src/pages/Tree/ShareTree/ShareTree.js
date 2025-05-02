import React, { useState, useEffect } from 'react';
import * as styles from './styles';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

function ShareTree() {

    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [email, setEmail] = useState("");
    const { register, handleSubmit, setValue } = useForm();
    const onSubmit = (data) => {
        window.location.href = '/';
    }

    useEffect(() => {
        if (searchTerm === "") {
        setSearchResults([]);
        setSelectedMember(null);
        setEmail("");
        return;
        }

        // simulate an API call
        const fetchResults = async () => {
        // TODO: replace with actual API call
        const results = [
            { id: 1, name: "John Doe", email: "john@gmail.com" },
            { id: 2, name: "Jane Smith" },
            { id: 3, name: "Alice Johnson" }
        ].filter(member => member.name.toLowerCase().includes(searchTerm.toLowerCase()));
        setSelectedMember(null);
        setEmail("");
        setSearchResults(results);
        };

        fetchResults();
    }, [searchTerm]);

    return (
        <div style={styles.DefaultStyle}>
            <div style={styles.ContainerStyle}>
                {/* title */}
                <h1 style={{ margin: '0px' }}>Share Tree</h1>
                <hr style={{ width: '50%', border: '1px solid #000', margin: '1px 0' }} />

                {/* form */}
                <form onSubmit={handleSubmit(data => onSubmit(data))} style={styles.FormStyle}>
                    <ul style={styles.ListStyle}>
                        <li style={styles.ItemStyle}>
                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                            <input
                                type="text"
                                placeholder="Search for a family member..."
                                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontFamily: 'Alata' }}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* search results */}
                        <div style={styles.AddOptionsStyle}>
                        {searchResults.length > 0 ? (
                            searchResults.map(result => (
                            <div key={result.id} style={styles.ListingStyle}>
                                <label>
                                <input
                                    type="radio"
                                    name="selectedMember"
                                    value={result.id}
                                    onChange={() => {
                                    setSelectedMember(result.id);
                                    setEmail(result.email ? result.email : "");
                                    setValue("selectedMember", result.id);
                                    }}
                                    checked={selectedMember === result.id}
                                    // {...register("selectedMember", { required: true })} // TODO make work
                                />
                                <Link to={`/account/${result.id}`} style={{ marginLeft: '10px' }}>
                                    {result.name}
                                </Link>
                                </label>
                            </div>
                            ))
                        ) : (
                            <div style={styles.ListingStyle}>
                            No Results
                            </div>
                        )}
                        </div>
                        </li>

                        <li style={styles.ItemStyle}>
                            <label>Email Address:</label>
                            <input
                                {...register("email", { required: true })}
                                type="text"
                                value={email} // Dynamically update the value
                                onChange={e => setEmail(e.target.value)} // Allow the user to edit the value
                                style={styles.FieldStyle}
                            />
                        </li>

                        <li style={styles.ItemStyle}>
                            <label>
                                Comments:
                            </label>
                            <textarea {...register("comments")} type="text" style={styles.TextAreaStyle} />
                        </li>
                    </ul>
                    <button type="submit" style={styles.ButtonStyle}>Share</button>
                </form>
            </div>
        </div>
    )
}

export default ShareTree;