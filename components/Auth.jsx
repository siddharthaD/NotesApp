import {auth, registerWithEmailAndPassword, logout, logInWithEmailAndPassword} from "../firebase.js";
import {useState} from "react";


export default function Auth({user,handleAuthChange})
{
    const [formData,setFormData] = useState({email:"",password:""});

    console.log("In Auth:"+JSON.stringify(user))
    function handleChange(event)
    {
        setFormData(old=>{ return {...old,[event.target.name]:event.target.value}})
    }

    function handleSignup(event)
    {
        event.preventDefault();
        registerWithEmailAndPassword("", formData.email, formData.password)
            .then((userCredential) => {
                // Signed up
                const user = userCredential.user;
               handleAuthChange();
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
        });
    }

    function handleLogin(event)
    {
        event.preventDefault();
        logInWithEmailAndPassword(formData.email, formData.password)
            .then(r => { console.log("Logged int"); handleAuthChange();})
            .catch(err=>console.error(err))
    }

    function handleLogout(event)
    {
        event.preventDefault();
        logout();
        handleAuthChange();
    }

    return <>{user.uid? <button onClick={handleLogout}>
                Logout
            </button>:

            <form>

        <input type="text" name="email" onChange={handleChange} value={formData.email}/>
        <input type="password" name="password" onChange={handleChange} value={formData.password}/>
        <button onClick={handleLogin}>Login</button>
        <button onClick={handleSignup}>Signup</button>
    </form> }</>
}