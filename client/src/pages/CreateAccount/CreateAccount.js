import { set, useForm } from 'react-hook-form'
import { React, useState } from 'react'
import { Link } from 'react-router-dom'
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import * as styles from './styles'
import logo from '../../assets/kintreelogo-adobe.png';

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
            .matches(
                /^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/
                , "Invalid phone number format."
            ),
        zipcode: yup.string().matches(/^\d{5}(?:[-\s]\d{4})?$/, "Invalid zip code format."),
        password: yup.string().required("Password is a required field.")
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
                , "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character"
            )

    }
);

const CreateAccount = () => {
    const {register, handleSubmit, formState: {errors}} = useForm({resolver: yupResolver(yupValidation)});
    const [isHovering, setIsHovering] = useState(false);
    const [formData, setFormData] = useState({});

    const onSubmit = (data) => {
        console.log(data);
    
        // register account
        fetch(`http://localhost:5000/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: data.firstname + " " + data.lastname,
                email: data.email,
                password: data.password,
            }),
        })
            .then(async (response) => {
                if (response.ok) {
                    const responseData = await response.json();
                    console.log(responseData);
    
                    // Use responseData.user directly
                    const accountID = responseData.user;
    
                    // Add user as a family member
                    return fetch(`http://localhost:5000/api/family-members/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            firstName: data.firstname,
                            lastName: data.lastname,
                            birthdate: data.birthdate,
                            email: data.email,
                            location: `${data.address}, ${data.city}, ${data.state} ${data.zipcode}, ${data.country}`,
                            phoneNumber: data.phonenum,
                            userId: accountID,
                            memberUserId: accountID,
                            gender: data.gender,
                        }),
                    }).then(async (response) => { // Initialize user's tree by adding themself
                        if (response.ok) {
                            const familyMemberResponse = await response.json();
                            console.log(familyMemberResponse);
                            return fetch(`http://localhost:5000/api/tree-info/`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    object: [{
                                        "id": familyMemberResponse.member,
                                        "data": {
                                            "first name": data.firstname,
                                            "last name": data.lastname,
                                            "gender": data.gender,
                                        },
                                        "rels": {
                                            "children": [],
                                            "spouses": [],
                                        }
                                    }],
                                    userId: accountID, 
                                }),
                            });
                        }})
                    }
                    else {
                        const errorData = await response.json();
                        console.error('Error registering account:', errorData);
                        throw new Error('Account registration failed');
                    }
            })
            .then(async (response) => {
                if (response.ok) {
                    const responseData = await response.json();
                    console.log(responseData);
                    window.location.href = '/';
                } else {
                    const errorData = await response.json();
                    console.error('Error initializing family member:', errorData);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
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
                <form onSubmit={handleSubmit(onSubmit)} style={styles.FormStyle}>
                <div style={styles.ListStyle}>
                    <div style={styles.ItemStyle}>
                        <label>First Name</label>
                        <input id="firstname" {...register("firstname")} style={styles.FieldStyle}/>
                        {errors.firstname && <p>{errors.firstname.message}</p>}
                    </div>
                    <div style={styles.ItemStyle}>
                        <label>Last Name</label>
                        <input id="lastname" {...register("lastname")} style={styles.FieldStyle}/>
                        {errors.lastname && <p>{errors.lastname.message}</p>}
                    </div>
                    <div style={styles.ItemStyle}>
                        <label>Birthdate</label>
                        <input id="birthdate" {...register("birthdate")} style={styles.FieldStyle}/>
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
                        <label>Email</label>
                        <input id="email" {...register("email")} style={styles.FieldStyle}/>
                        {errors.email && <p>{errors.email.message}</p>}
                    </div>
                    <div style={styles.ItemStyle}>
                        <label>Address</label>
                        <input id="address" {...register("address")} style={styles.FieldStyle}/>
                        {errors.address && <p>{errors.address.message}</p>}
                    </div>
                    <div style={styles.ItemStyle}>
                        <label>City</label>
                        <input id="city" {...register("city")} style={styles.FieldStyle}/>
                        {errors.city && <p>{errors.city.message}</p>}
                    </div>
                    <div style={styles.ItemStyle}>
                        <label>State</label>
                        <input id="state" {...register("state")} style={styles.FieldStyle}/>
                        {errors.state && <p>{errors.state.message}</p>}
                    </div>
                    <div style={styles.ItemStyle}>
                        <label>Country</label>
                        <input id="country" {...register("country")} style={styles.FieldStyle}/>
                        {errors.country && <p>{errors.country.message}</p>}
                    </div>
                    <div style={styles.ItemStyle}>
                        <label>Zip Code</label>
                        <input id="zipcode" {...register("zipcode")} style={styles.FieldStyle}/>
                        {errors.zipcode && <p>{errors.zipcode.message}</p>}
                    </div>
                    <div style={styles.ItemStyle}>
                        <label>Phone</label>
                        <input id="phone" {...register("phone")} style={styles.FieldStyle}/>
                        {errors.phone && <p>{errors.phone.message}</p>}
                    </div>
                    <div style={styles.ItemStyle}>
                        <label>Password</label>
                        <input id="password" {...register("password")} style={styles.FieldStyle}/>
                        {errors.password && <p>{errors.password.message}</p>}
                    </div>
                    <br />
                </div>
                <div style={styles.ButtonDivStyle}>
                    <button type="submit" style={ButtonStyle}
                    onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                        Create Account
                    </button>
                </div>
                
                </form>
            </div>
        </div>
       
    );
};

export default CreateAccount;