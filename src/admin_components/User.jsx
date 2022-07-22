import React, { useState } from 'react';
import ReactDOM from 'react-dom'; 
import { useNavigate, useParams } from 'react-router-dom';
import '../index.css';

function User(props) {
    const navigate = useNavigate();
    const params = useParams(); 

    const username = 'Mateo Caso';
    const rank = 'Admin.';

    const [retrievedUser, setRetrievedUser] = useState(false); 
    const [hiddenMenu, setHiddenMenu] = useState(false);
    const [user, setUser] = useState({ 'name': '', 'rank': false, 'area': '', 'courses': [] });

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
          navigate('/usuarios');
        }  
        
        setUser(response.user);
        console.log(response.user);
      
    };
    
    if (!retrievedUser) {
        getUserResource(); 
        setRetrievedUser(true);
    }

    return (
      <div>
            <div className = 'sidebar'>
                
                <img src = '/cinia_logo (1).png' alt = 'Logo' className = 'cinia-logo'/> 

                <div className = 'sidebar-options'> 
                    <p className = 'sidebar-option' onClick = { () => navigate('/usuarios') }> Usuarios </p>

                    <p className = 'sidebar-option' onClick = { () => navigate('/cursos') }> Cursos </p>
                    
                    <p className = 'sidebar-option' id = 'selected-page'> Usuario </p>
                </div>

                <div className = 'profile-details'>
                    <div className = 'credentials'> 
                        <p className = 'username' > { username } </p>
                        <p className = 'rank'> { rank } </p>
                        <p className = 'hide-menu' onClick = { () => setHiddenMenu(!hiddenMenu) }> Ocultar/poner menú </p>
                    </div>

                    <button className = 'logout' onClick = { () => alert('Logged out')} > Cerrar sesión </button>

                </div> 
            </div>

            <div className = 'main-page'>
              <h5 className = 'course-header'> { user.username } </h5> 

              {
                user.courses.length == 0 
                &&
                <div className = 'message-no-data'> No tiene cursos el usuario </div>
              }

              <div className = 'performance-summary'> 
                {
                  user.courses.map(course => {
                    return (
                      <div className = 'course-summary'>
                        <i className = 'course-summary-name'> { course.name } </i>
                        <p>
                          <b> Capacitación: </b>
                        {
                          course.stage1 ?
                          <p> Completó la primera etapa </p> :
                          <p> No se ha capacitado </p>
                        }
                        </p>
                        <p>
                          <b> Evaluación: </b>
                        {
                          course.stage2 ?
                          <p> Aprobó con { course.stage2 * 100 }% </p> :
                          <p> Reprobó o no lo ha hecho</p>
                        }
                        </p>
                      </div>
                    )
                  })
                }
              </div>
            </div>
      </div>

    );
}

export default User;