import { React, useState } from 'react';
import * as styles from './styles';
import logo from '../../assets/kintreelogo-adobe.png';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../../CurrentUserProvider';

function Login() {
    const { register, handleSubmit } = useForm();
    const [ errorMessage, setErrorMessage ] = useState("");
    const { setCurrentUserID } = useCurrentUser();
    
    // TODO: connect to backend
    const onSubmit = (data) => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
        fetch('http://localhost:5000/api/auth/login', requestOptions)
            .then(async(response) => {
                if (response.ok) {
                    window.location.href='/'
                    fetch(`http://localhost:5000/api/auth/users/${data.email}`, requestOptions)
                    .then(async(response) => {
                        if (response.ok) {
                            let userData = await response.json();
                            setCurrentUserID(userData.id); // Set the current user ID in context
                        }
                    })
                    return response.json();
                }
                else {
                    const errorData = await response.json();
                    console.error('Error:', errorData.message);
                    setErrorMessage(errorData.message); // Set the error message in state
                    throw new Error('Network response was not ok');
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            })
    };

    document.body.style.overflow = 'hidden';
    document.body.style.width = '100%'; 

    return (
        <div style={styles.DefaultStyle}>
            <div style={styles.Container}>
                <img src={logo} alt="KinTree Logo" style={styles.Logo} />
                <h1 style={styles.Header}>Sign In</h1>
                <form onSubmit={handleSubmit(data => onSubmit(data))} style={styles.FormStyle}>
                    <ul style={styles.ListStyle}>
                        <li style={styles.ItemStyle}>
                            <label>
                                Email Address:
                            </label>
                            <input {...register("email", { required: true })} type="text" placeholder="" style={styles.FieldStyle} required />
                        </li>
                        <li style={styles.ItemStyle}>
                            <label>
                                Password:
                            </label>
                            <input {...register("password", { required: true })} type="password" autoComplete='current-password' placeholder="" style={styles.FieldStyle} required />
                        </li>
                    </ul>

                    {/* Display error message */}
                    {errorMessage && (
                        <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>
                            {errorMessage}
                        </p>
                    )}

                    {/* buttons */}
                    <div style={styles.ButtonDivStyle}>
                        <button type="submit" style={styles.ButtonStyle}><h3 style={styles.Header}>Login</h3></button>
                        <div style={{width: '40%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                            <p style={styles.TextStyle}>Don't have an account?</p>
                            <button type="button" onClick={()=>{window.location.href='/register'}} style={styles.WhiteButtonStyle}><h3 style={styles.Header}><a style={styles.LinkStyle} href="/register">Register</a></h3></button>
                        </div>
                    </div>

                    {/* forgot password */}
                    <div style={{marginTop: '10%', display: 'flex', justifyContent: 'center'}}>
                        <Link to="/reset" style={styles.TextStyle}>Forgot your password?</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login;