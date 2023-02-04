import React, { createContext, useState, useEffect } from 'react'; 
import { useNavigate, Navigate } from 'react-router-dom'; 
export const AuthContext = createContext();  

const AuthContextProvider = (props) => {
    function getCookie(cookie_name) {
        let name = cookie_name + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let cookies = decodedCookie.split(';');
        for(let i = 0; i <cookies.length; i++) {
            let cur_cookie = cookies[i];
            while (cur_cookie.charAt(0) == ' ') {
                cur_cookie = cur_cookie.substring(1);
            }
        
            if (cur_cookie.indexOf(name) == 0) {
                return cur_cookie.substring(name.length, cur_cookie.length);
            }
        }
    }

    const [status, setStatus] = useState(getCookie('token')); 
    const [admin, setAdmin] = useState(getCookie('admin')); 
    const [renderVerifyCredentials, setRenderVerifyCredentials] = useState(false);
    const [retrievedAuth, setRetrievedAuth] = useState(false); 

    if (!retrievedAuth) {

        fetch('https://jt6z2tunnora6oi6u6x37zl3cq0rgqwq.lambda-url.us-west-2.on.aws/is-logged-in', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',  
                'Cookies': document.cookie
            }
        }).then(response => setStatus(response.status == 200)); 

        fetch('https://jt6z2tunnora6oi6u6x37zl3cq0rgqwq.lambda-url.us-west-2.on.aws/is-privileged', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json', 
                'Cookies': document.cookie
            }
        }).then(response => setAdmin(response.status == 200));

        setRetrievedAuth(true);

    }
    
    const login = (event, username, password) => {
        event.preventDefault();

        if ((!username) || (!password)) {
          setRenderVerifyCredentials(true);
          return;
        }
            
        const loginResource = async (username, password) => {
          

          const promise = await fetch('https://jt6z2tunnora6oi6u6x37zl3cq0rgqwq.lambda-url.us-west-2.on.aws/login', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json', 
              'Cookies': document.cookie
            },
            body: JSON.stringify({ 'username': username.trimEnd(), 'password': password }) 
          }); 
        
          const response = await promise.json();
          
          if ((response.loggedIn) && (promise.status == 200)) {
            if (!getCookie('token') || (!status)) {
              const session_id_cookie = 'token='.concat(response.token)
              document.cookie = session_id_cookie;
              setStatus(true);
            } 
            
              
            const username_cookie = 'username='.concat(username.trimEnd()); 
            document.cookie = username_cookie;
            
  
            if (response.admin) { 
              setAdmin(true);
              if (!getCookie('admin')){
                document.cookie = 'admin=True';
              }
            } 
            
            setRenderVerifyCredentials(false);
  
          } else {
            setRenderVerifyCredentials(true);
          }
        };
        
        loginResource(username, password);
    }

    const logout = () => {
        if (!status) {
            alert('Primero necesitas iniciar sesión');
        } else {
            
            setStatus(false); 
            setAdmin(false); 

            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "admin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
    }

    return (
        <AuthContext.Provider value = {{status, admin, renderVerifyCredentials, login, logout, getCookie}}> 
          { props.children }
        </AuthContext.Provider>
    );

}

export default AuthContextProvider;