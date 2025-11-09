import { useForm } from 'react-hook-form'
import { React, useState } from 'react'
import { yupResolver } from "@hookform/resolvers/yup"
import { handleRegister } from '../../utils/authHandlers';
import * as yup from "yup"
import * as styles from './styles'
import logo from '../../assets/kintreelogo-adobe.png';
import { familyTreeService } from '../../services/familyTreeService';

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
                /^(\+\d{1,2}\s?)?1?-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/
                , "Invalid phone number format."
            ),
        zipcode: yup.string().matches(/^\d{5}(?:[-\s]\d{4})?$/, "Invalid zip code format."),
        password: yup.string().required("Password is required")
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/,
                "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character"
            )
    }
);

const CreateAccount = () => {
    const {register, handleSubmit, formState: {errors}} = useForm({resolver: yupResolver(yupValidation)});
    const [errorMessage, setErrorMessage] = useState("");
    const [isHovering, setIsHovering] = useState(false);

    const onSubmit = async (formData) => {
        setErrorMessage(""); // clear previous errors

        try {
            const data = await handleRegister(formData.email, formData.password, {
                first_name: formData.firstname,
                last_name: formData.lastname,
                birthdate: formData.birthdate,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                country: formData.country,
                phone_number: formData.phonenum,
                zipcode: formData.zipcode,
                gender: formData.gender
            }); // frontend Supabase registration

            // add new user as family member 
            const memberData = {
                firstname: formData.firstname,
                lastname: formData.lastname,
                birthdate: formData.birthdate,
                location: `${formData.city}, ${formData.state}, ${formData.country}`,
                phonenumber: formData.phonenum,
                userid: data.user.id,
                memberuserid: data.user.id,
                gender: formData.gender
            };
            await familyTreeService.createFamilyMember(memberData); 
            
            // add new user to their tree object
            await familyTreeService.initializeTreeInfo(data.user.id, memberData, data.user.id);

            console.log('Registration successful:', data);
            window.location.href = '/login'; // redirect after registration to login
        } catch (error) {
            setErrorMessage(error.message);
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
                <form onSubmit={handleSubmit(onSubmit)} style={styles.FormStyle}>
                
                {/* Error Message Display */}
                {errorMessage && (
                    <div style={{color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#ffe6e6', border: '1px solid red', borderRadius: '4px'}}>
                        {errorMessage}
                    </div>
                )}
                
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
                        <input id="birthdate" type="date" {...register("birthdate")} style={styles.FieldStyle}/>
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
                        <input id="phone" {...register("phonenum")} style={styles.FieldStyle}/>
                        {errors.phonenum && <p>{errors.phonenum.message}</p>}
                    </div>
                    <div style={styles.ItemStyle}>
                        <label>Password</label>
                        <input id="password" {...register("password")} style={styles.FieldStyle}/>
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
                
                <div style={{textAlign: 'center', marginTop: '20px', fontFamily: 'Alata'}}>
                    <p style={{color: '#666', fontSize: '14px'}}>
                        Already have an account? 
                        <a href="/login" style={{color: '#3a5a40', textDecoration: 'none', marginLeft: '5px', fontWeight: 'bold'}}>
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