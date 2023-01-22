import React, { useState, useContext } from 'react';
import ReactDOM from 'react-dom'; 
import '../index.css';
import { useNavigate, useParams } from 'react-router-dom';   
import { AuthContext } from '../contexts/AuthContext'; 

function Login(props) {

    const [username, setUsername] = useState(); 
    const [password, setPassword] = useState(); 
    
    const { renderVerifyCredentials, login } = useContext(AuthContext);
    
    return (
        <div className = 'login-box'>
            <img src = '/cinia_logo (1).png' className = 'login-logo' />
            <form className = 'login-form' onSubmit = { (event) => login(event, username, password) }>
                <label className = 'form-label'> Nombre de usuario </label>
                <input placeholder = 'Escribe tu nombre de usuario' type = 'text' onChange = { (e) => setUsername(e.target.value)} required /> 
                <br />
                <label className = 'form-label'> Contraseña </label> 
                <input placeholder = 'Escribe tu contraseña' type = 'password' onChange = { (e) => setPassword(e.target.value) } required />
                <br />
                <button type = 'submit' className = 'submit-form' id = 'login-button'> <div> Ingresar </div> </button>
            </form>

            <p className = { renderVerifyCredentials ? 'invalid-login-credentials' : 'display-false' } > Usuario o contraseña incorrecto </p>
        </div>
    );
} 

export default Login;