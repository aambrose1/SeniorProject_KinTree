import { useForm } from 'react-hook-form'

function createAccount() {
    const {register, handleRegister} = useForm();
    const onSubmit = (data) => {
        alert(JSON.stringify(data));
        console.log(data);
    };

    return (
        <form onSubmit={handleRegister(onSubmit)}>
            <h2 className='acc-form-header'>Create Account</h2>
            <label className='field'>
                First Name
                <input {...register("firstName")} type='text' />
            </label>
            <label className='field'>
                Last Name
                <input {...register("lastName")} type='password' />
            </label>
            <label className='field'>
                Email
                <input {...register("emailAddress")} type='email' />
            </label>
            <br />
            <button type='submit'>Submit</button>
        </form>
    );
};