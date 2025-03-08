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
                    <input id="birthdate" {...register("birthdate")} />
                    {errors.birthdate && <p>{errors.birthdate.message}</p>}
                </div>
                <div>
                    <label>Email</label>
                    <input id="email" {...register("email")} />
                    {errors.email && <p>{errors.email.message}</p>}
                </div>
                <div>
                    <label>Address</label>
                    <input id="address" {...register("address")} />
                    {errors.address && <p>{errors.address.message}</p>}
                </div>
                <div>
                    <label>City</label>
                    <input id="city" {...register("city")} />
                    {errors.city && <p>{errors.city.message}</p>}
                </div>
                <div>
                    <label>State</label>
                    <input id="state" {...register("state")} />
                    {errors.state && <p>{errors.state.message}</p>}
                </div>
                <div>
                    <label>Country</label>
                    <input id="country" {...register("country")} />
                    {errors.country && <p>{errors.country.message}</p>}
                </div>
                <div>
                    <label>Zip Code</label>
                    <input id="zipcode" {...register("zipcode")} />
                    {errors.zipcode && <p>{errors.zipcode.message}</p>}
                </div>
                <div>
                    <label>Phone</label>
                    <input id="phone" {...register("phone")} />
                    {errors.phone && <p>{errors.phone.message}</p>}
                </div>
                <div>
                    <label>Password</label>
                    <input id="password" {...register("password")} />
                    {errors.password && <p>{errors.password.message}</p>}
                </div>
                <br />
            </div>
            <button type='submit'>Submit</button>
            </form>
        </>
       
    );
};

export default CreateAccount;