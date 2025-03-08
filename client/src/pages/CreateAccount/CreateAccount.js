import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import * as styles from './styles'

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
                "/^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/"
                , "Invalid phone number format."
            ),
        zipcode: yup.string().matches(/^\d{5}(?:[-\s]\d{4})?$/, "Invalid zip code format."),
        password: yup.string().required("Password is a required field.")
            .matches(
                "/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/"
                , "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character"
            )

    }
);

const CreateAccount = () => {
    const {register, handleSubmit, formState: {errors}} = useForm({resolver: yupResolver(yupValidation)});

    //ToDo: code linkage to backend
    const onSubmit = (data) => {
        console.log(data);
    };

    return (
        <>
            <head style={styles.Header}>
                Create Account
            </head>
            <div style={styles.Container}>
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
                    <button type="submit" style={styles.ButtonStyle}><h3 style={styles.Header}>Create Account</h3></button>
                </div>
                
                </form>
            </div>
        </>
       
    );
};

export default CreateAccount;