import React, { useState } from 'react';
import ReactDOM from 'react-dom'; 
import { useNavigate, useParams } from 'react-router-dom';
import '../index.css';

function User(props) {
    const navigate = useNavigate();
    const params = useParams(); 

    const [retrievedUser, setRetrievedUser] = useState(false); 
    const [user, setUser] = useState({ 'name': '', 'rank': false, 'area': '', 'courses': {} });

    const getUserResource = async () => {
        
        const url = 'http://127.0.0.1:8000/get-user/'.concat(params.cur_user);
        const promise = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }); 
        
        const response = await promise.json();
        
        
        if ((!response.user) || (promise.status != 200)) {
          alert('Error retrieving user');
          
        }  
        
        setUser(response.user);
        console.log(response.user);
      
    };
    
    if (!retrievedUser) {
        getUserResource(); 
        setRetrievedUser(true);
    }
}

export default User;