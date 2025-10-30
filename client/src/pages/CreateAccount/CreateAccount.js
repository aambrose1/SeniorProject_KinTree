import { useForm } from 'react-hook-form'
import { React, useState } from 'react'
import { yupResolver } from "@hookform/resolvers/yup"
import { handleRegister } from '../../utils/authHandlers';
import * as yup from "yup"
import * as styles from './styles'
import logo from '../../assets/kintreelogo-adobe.png';

//validation functionality
const yupValidation = yup.object().shape(
    {
        firstname: yup.string().required("First name is a required field."),
        lastname: yup.string().required("Last name is a required field."),
        birthdate: yup.date().required("Birthdate is a required field."),
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

    const onSubmit = async (data) => {
        setErrorMessage(""); // clear previous errors
        try {
            const user = await handleRegister(data.email, data.password, {
                first_name: data.firstname,
                last_name: data.lastname,
                birthdate: data.birthdate,
                address: data.address,
                city: data.city,
                state: data.state,
                country: data.country,
                phone_number: data.phonenum,
                zipcode: data.zipcode
            }); // frontend Supabase registration

            // TODO: store additional info in mysqldatabase later
            // await fetch('http://localhost:5000/api/users', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //       userId: user.id,
            //       firstname: data.firstname,
            //       lastname: data.lastname,
            //       birthdate: data.birthdate,
            //       address: data.address,
            //       city: data.city,
            //       state: data.state,
            //       zipcode: data.zipcode,
            //       country: data.country,
            //       phonenum: data.phonenum
            //     })
            //   });

            console.log('Registration successful:', user);
            window.location.href = '/home'; // redirect after registration to login, can change to login if we want
        } catch (error) {
          setErrorMessage(error.message);
          console.error('Password:', data.password);
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
                        <input id="birthdate" {...register("birthdate")} style={styles.FieldStyle}/>
                        {errors.birthdate && <p>{errors.birthdate.message}</p>}
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