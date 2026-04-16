import { useForm } from 'react-hook-form'
import React, { useState, useEffect } from 'react'
import { yupResolver } from "@hookform/resolvers/yup"
import { handleRegister } from '../../utils/authHandlers';
import * as yup from "yup"
import * as styles from './styles'
import logo from '../../assets/kintreelogo-adobe.png';
import { useSearchParams } from 'react-router-dom';
import {familyTreeService} from '../../services/familyTreeService';
import { SERVER_URL } from '../../config/urls';

//validation functionality
const yupValidation = yup.object().shape(
    {
        firstname: yup.string().required("First name is a required field."),
        lastname: yup.string().required("Last name is a required field."),
        birthdate: yup.date().required("Birthdate is a required field."),
        gender: yup.string().oneOf(['M', 'F'], 'Please select a valid option').required('Gender field is required'),
        email: yup.string().required("Email is a required field.")
            .matches(
                "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
                , "Invalid email format."
            ),
        address: yup.string(),
        city: yup.string(),
        state: yup.string(),
        country: yup.string().required("Country of residence is a required field."),
        phonenum: yup.string()
            .nullable()
            .test('phone-format', 'Invalid phone number format.', function (value) {
                if (!value || value.trim() === '') return true; // Allow empty
                return /^(\+\d{1,2}\s?)?1?-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(value);
            }),
        zipcode: yup.string()
            .nullable()
            .test('zipcode-format', 'Invalid zip code format.', function (value) {
                if (!value || value.trim() === '') return true; // Allow empty
                return /^\d{5}(?:[-\s]\d{4})?$/.test(value);
            }),
        password: yup.string().required("Password is required")
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/,
                "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character"
            )
    }
);

const CreateAccount = () => {
    const { register, handleSubmit, formState: { errors }, setValue } = useForm({ resolver: yupResolver(yupValidation) });
    const [errorMessage, setErrorMessage] = useState("");
    const [isHovering, setIsHovering] = useState(false);
    const [searchParams] = useSearchParams();
    const [inviteToken, setInviteToken] = useState(null);
    const [inviteEmail, setInviteEmail] = useState(null);
    const [isLoadingInvite, setIsLoadingInvite] = useState(false);

    // Check for invitation token on mount
    useEffect(() => {
        const token = searchParams.get('inviteToken');
        if (token) {
            setInviteToken(token);
            setIsLoadingInvite(true);
            // Fetch invitation details to get the email
            fetch(`${SERVER_URL}/api/share-trees/token/${token}`)
                .then(response => response.json())
                .then(data => {
                    console.log('Invitation data:', data);
                    if (data && data.receiveremail) {
                        setInviteEmail(data.receiveremail);
                        setValue('email', data.receiveremail);
                        console.log('Invitation found for email:', data.receiveremail);
                    }
                })
                .catch(error => {
                    console.error('Error fetching invitation:', error);
                })
                .finally(() => {
                    setIsLoadingInvite(false);
                });
        }
    }, [searchParams, setValue]);

    // TODO: find out what happened to the family tree creation on registration :(
    const onSubmit = async (data) => {
        setErrorMessage(""); // clear previous errors

        try {
            console.log('Starting registration with data:', { email: data.email, hasPassword: !!data.password });

            const metadata = {
                first_name: data.firstname,
                last_name: data.lastname,
                birthdate: data.birthdate,
                address: data.address,
                city: data.city,
                state: data.state,
                country: data.country,
                phone_number: data.phonenum,
                zipcode: data.zipcode
            };

            console.log('Registering with metadata:', metadata);

            const user = await handleRegister(data.email, data.password, metadata);

            console.log('Registration successful:', user);

            // add new user as family member 
            const memberData = {
                firstname: data.firstname,
                lastname: data.lastname,
                birthdate: data.birthdate,
                location: `${data.city}, ${data.state}, ${data.country}`,
                phonenumber: data.phonenum,
                userid: user.user.id,
                memberuserid: user.user.id,
                gender: data.gender
            };

            await familyTreeService.createFamilyMember(memberData);
            await familyTreeService.initializeTreeInfo(user.user.id, memberData, user.user.id);

            // If this registration is from an invitation, process pending invitations
            if (inviteToken || inviteEmail) {
                try {
                    // Find that user if exists
                    const userResponse = await fetch(`${SERVER_URL}/api/auth/users`);
                    const allUsers = await userResponse.json();
                    const dbUser = allUsers.find(u => u.email === data.email);
                    
                    if (dbUser && dbUser.id) {
                        // Process pending invitations
                        const processResponse = await fetch(`${SERVER_URL}/api/share-trees/process-pending`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                email: data.email,
                                userId: dbUser.id
                            })
                        });
                        
                        if (processResponse.ok) {
                            const processData = await processResponse.json();
                            console.log('Processed pending invitations:', processData);
                            alert(`Account created successfully! ${processData.count > 0 ? `You now have access to ${processData.count} shared tree(s).` : ''}`);
                        }
                    }
                } catch (inviteError) {
                    console.error('Error processing invitations:', inviteError);
                }
            }

            // Redirect to login - email verification can be done later from account page
            window.location.href = '/login'; // redirect after registration to login
        } catch (error) {
            console.error('Registration error:', error);
            setErrorMessage(error.message || 'Registration failed. Please check your information and try again.');
        }
    };

    const ButtonStyle = {
        fontFamily: 'Alata',
        backgroundColor: '#3a5a40',
        color: 'white',
        borderRadius: '10px',
        border: 'none',
        padding: '10px 20px',
        margin: '10px',
        cursor: 'pointer',
        width: '60%',
        height: '45px'
    };

    return (
        <div style={styles.DefaultStyle}>

            <div style={styles.Container}>
                <img src={logo} alt="KinTree Logo" style={styles.Logo} />
                <h1 style={styles.Header}>Create Account</h1>
                
                {inviteToken && (
                    <div style={{ 
                        backgroundColor: '#e8f5e9', 
                        color: '#2e7d32', 
                        padding: '10px', 
                        borderRadius: '5px', 
                        marginBottom: '15px',
                        fontFamily: 'Alata',
                        textAlign: 'center'
                    }}>
                        🎉 You've been invited to view a family tree! Complete your registration to accept.
                    </div>
                )}
                
                <form onSubmit={handleSubmit(onSubmit)} style={styles.FormStyle}>

                    {/* Error Message Display */}
                    {errorMessage && (
                        <div style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#ffe6e6', border: '1px solid red', borderRadius: '4px' }}>
                            {errorMessage}
                        </div>
                    )}

                    <div style={styles.ListStyle}>
                        <div style={styles.ItemStyle}>
                            <label>First Name</label>
                            <input id="firstname" {...register("firstname")} style={styles.FieldStyle} />
                            {errors.firstname && <p>{errors.firstname.message}</p>}
                        </div>
                        <div style={styles.ItemStyle}>
                            <label>Last Name</label>
                            <input id="lastname" {...register("lastname")} style={styles.FieldStyle} />
                            {errors.lastname && <p>{errors.lastname.message}</p>}
                        </div>
                        <div style={styles.ItemStyle}>
                            <label>Birthdate</label>
                            <input id="birthdate" type="date" {...register("birthdate")} style={styles.FieldStyle} />
                            {errors.birthdate && <p>{errors.birthdate.message}</p>}
                        </div>
                        <div style={styles.ItemStyle}>
                            <label>Gender
                                <select id="gender" {...register("gender")} style={{ fontFamily: 'Alata', marginLeft: '10px', width: '145px' }}>
                                    <option value="" disabled hidden>Select</option>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                </select>
                            </label>
                            {errors.gender && <p>{errors.gender.message}</p>}
                        </div>
                        <div style={styles.ItemStyle}>
                            <label>Email {inviteToken && <span style={{ color: '#2e7d32', fontSize: '12px' }}>(from invitation)</span>}</label>
                            <input 
                                id="email" 
                                {...register("email")} 
                                style={inviteToken ? {...styles.FieldStyle, backgroundColor: '#f5f5f5'} : styles.FieldStyle}
                                readOnly={!!inviteToken}
                            />
                            {errors.email && <p>{errors.email.message}</p>}
                        </div>
                        <div style={styles.ItemStyle}>
                            <label>Address</label>
                            <input id="address" {...register("address")} style={styles.FieldStyle} />
                            {errors.address && <p>{errors.address.message}</p>}
                        </div>
                        <div style={styles.ItemStyle}>
                            <label>City</label>
                            <input id="city" {...register("city")} style={styles.FieldStyle} />
                            {errors.city && <p>{errors.city.message}</p>}
                        </div>
                        <div style={styles.ItemStyle}>
                            <label>State</label>
                            <input id="state" {...register("state")} style={styles.FieldStyle} />
                            {errors.state && <p>{errors.state.message}</p>}
                        </div>
                        <div style={styles.ItemStyle}>
                            <label>Country</label>
                            <input id="country" {...register("country")} style={styles.FieldStyle} />
                            {errors.country && <p>{errors.country.message}</p>}
                        </div>
                        <div style={styles.ItemStyle}>
                            <label>Zip Code</label>
                            <input id="zipcode" {...register("zipcode")} style={styles.FieldStyle} />
                            {errors.zipcode && <p>{errors.zipcode.message}</p>}
                        </div>
                        <div style={styles.ItemStyle}>
                            <label>Phone</label>
                            <input id="phonenum" {...register("phonenum")} style={styles.FieldStyle} placeholder="XXX-XXX-XXXX" />
                            {errors.phonenum && <p>{errors.phonenum.message}</p>}
                        </div>
                        <div style={styles.ItemStyle}>
                            <label>Password</label>
                            <input id="password" {...register("password")} style={styles.FieldStyle} />
                            {errors.password && <p>{errors.password.message}</p>}
                        </div>
                        <br />
                    </div>
                    <div style={styles.ButtonDivStyle}>
                        <button type="submit" style={{
                            ...ButtonStyle,
                            backgroundColor: isHovering ? '#2d4a33' : '#3a5a40'
                        }}
                            onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                            Create Account
                        </button>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '20px', fontFamily: 'Alata' }}>
                        <p style={{ color: '#666', fontSize: '14px' }}>
                            Already have an account?
                            <a href="/login" style={{ color: '#3a5a40', textDecoration: 'none', marginLeft: '5px', fontWeight: 'bold' }}>
                                Login here
                            </a>
                        </p>
                    </div>

                </form>
            </div>
        </div>

    );
};

export default CreateAccount;