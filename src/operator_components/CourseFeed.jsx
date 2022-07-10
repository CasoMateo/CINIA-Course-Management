import React, { useState } from 'react';
import ReactDOM from 'react-dom'; 
import '../index.css';
import { useNavigate, useParams } from 'react-router-dom'; 

function CourseFeed(props) {

    const rank = 'Operador';
    const username = 'Mateo Caso';
    const _id = '62c9ebc33aab475b6cdecb54';

    // make get user request
    // arrange courses with name and date 
    // mark completed courses with green 
    // añadir curso general opción

    const navigate = useNavigate();
    const params = useParams(); 

    const [retrievedUser, setRetrievedUser] = useState(false); 
    const [hiddenContact, setHiddenContact] = useState(false);
    const [user, setUser] = useState({ 'name': '', 'rank': false, 'area': '', 'courses': [] });

    const getUserResource = async () => {
        
        const url = 'http://127.0.0.1:8000/get-user/'.concat(_id);
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
      
    };
    
    if (!retrievedUser) {
        getUserResource(); 
        setRetrievedUser(true);
    }

    const handleExploreCourse = (course) => {
        if (!course.stage2) {
            navigate('/operador/'.concat(course.name));
        } else {
            alert('Ya completaste este curso');
        }
    }

    return ( 

        <div>
            <div className = 'sidebar'>
                
                <img src = '/cinia_logo (1).png' alt = 'Logo' className = 'cinia-logo'/> 

                <div className = 'sidebar-options'> 
                    <p className = 'sidebar-option' id = 'selected-page'> Cursos </p>
              
                </div>

                <div className = 'profile-details'>
                    <div className = 'credentials'> 
                        <p className = 'username' > { username } </p>
                        <p className = 'rank'> { rank } </p>
                        <p className = 'hide-menu' onClick = { () => setHiddenContact(!hiddenContact) }> Ocultar/poner menú </p>
                    </div>

                    <button className = 'logout' onClick = { () => alert('Logged out')} > Cerrar sesión </button>

                </div> 
            </div>

            <div className = 'main-page'>
                {
                    Object.keys(user.courses).length === 0 
                    && 
                    <div className = 'message-no-data'> 
                        No tienes cursos asignados
                    </div> 
                }
                <div className = 'operator-courses'>
                    {
                        user.courses.map(course => {
                            return (
                                <div className = 'operator-course-instance' id = { course.stage2 && 'completed-course' } onClick = { () => handleExploreCourse(course)}> 
                                    <p className = 'instance-attribute'> <b> { course.name } </b> </p>
                                    <p className = 'instance-attribute'> { (course.stage1 && course.stage2) ? 'Completado' : 'En progreso...' }</p>
                                </div>
                            );
                        })

                    }
                </div>

            </div>

        </div>
    );
}

export default CourseFeed;