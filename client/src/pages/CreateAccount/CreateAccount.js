import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import * as styles from './styles'

function createAccount() {
    const {register, handleRegister} = useForm();

    //ToDo: code linkage to backend
    const onSubmit = (data) => {
        alert(JSON.stringify(data));
        console.log(data);
    };

    return (
        <form onSubmit={handleRegister(onSubmit)}>
            <head >
                Create Account
            </head>
            <div>
                <label >
                    First Name
                    <input id="firstname" {...register("firstName", { required: true })} type="text" />
                    {errors.username && <p>{errors.username.message}</p>}
                </label>
            </div>
            <label >
                Last Name
                <input id="lastname"{...register("lastName")} type='password' />
            </label>
            <label >
                Email
                <input {...register("emailAddress")} type='email' />
            </label>
            <br />
            <button type='submit'>Submit</button>
        </form>
    );
};