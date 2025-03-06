import React from 'react';
import * as styles from './styles';
import logo from '../../assets/kintreelogo-adobe.png';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

function Login() {
    const { register, handleSubmit } = useForm();
    
    // TODO: connect to backend
    const onSubmit = (data) => {
        // TODO auth loop
        window.location.href='/'
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