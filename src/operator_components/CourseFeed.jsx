import React, { useState, useContext } from 'react';
import ReactDOM from 'react-dom'; 
import '../index.css';
import { useNavigate, useParams } from 'react-router-dom'; 
import { AuthContext } from '../contexts/AuthContext';

function CourseFeed(props) {

    const { getCookie, logout } = useContext(AuthContext);
    const rank = 'Operador';
    const username = getCookie('username');

    // make get user request
    // arrange courses with name and date 
    // mark completed courses with green 
    // añadir curso general opción

    const navigate = useNavigate();
    const params = useParams(); 

    const [retrievedUser, setRetrievedUser] = useState(false); 
    const [hiddenContact, setHiddenContact] = useState(false);
    const [user, setUser] = useState({ 'name': '', 'rank': false, 'area': '', 'courses': [] });
    const [search, setSearch] = useState();
    const [verifyRef, setVerifyRef] = useState(false);
    const [messages, setMessages] = useState([]);

    const getUserResource = async () => {
        
        const url = 'https://jt6z2tunnora6oi6u6x37zl3cq0rgqwq.lambda-url.us-west-2.on.aws/get-user/'.concat(username);
        const promise = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cookies': document.cookie
          }
        }); 
        
        const response = await promise.json();
        
        if (promise.status == 429) {
            alert('Demasiadas solicitudes, espera un poco');
            return;
        }

        if ((!response.user) || (promise.status != 200)) {
          alert('No se retiró tu información adecuadamente');
          return;
          
        }  
        
        setUser(response.user);
      
    };

    const getMessagesResource = async () => {
        
        if (retrievedUser) {  
          return;
        }
    
        const promise = await fetch('https://jt6z2tunnora6oi6u6x37zl3cq0rgqwq.lambda-url.us-west-2.on.aws/get-messages', { 
          method: 'GET',
          headers: {
            'Cookies': document.cookie
          }
        }); 
        
        if (promise.status == 429) {
            alert('Demasiadas solicitudes, espera un poco');
            return;
        }

        if (promise.status !== 200) {
          alert('No se retiraron los contactos adecuadamente');
          return;
        } 
    
        const response = await promise.json();
      
        setMessages(response.messages);
    };  
    
    if (!retrievedUser) {
        getUserResource(); 
        getMessagesResource();
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
                    <p className = 'sidebar-option' onClick = { () => navigate('/contactos') }> Contactos </p>
              
                </div>

                <div className = 'profile-details'>
                    <div className = 'credentials'> 
                        <p className = 'username' > { username } </p>
                        <p className = 'rank'> { rank } </p>
                        <p className = 'hide-menu' onClick = { () => setHiddenContact(!hiddenContact) }> Ocultar/poner menú </p>
                    </div>

                    <button className = 'logout' onClick = { () => setVerifyRef(true)} > Cerrar sesión </button>

                </div> 
            </div>

            <div className = 'main-page'>

                <div className = 'message-no-data' id = 'mensajes-importantes'> Mensajes importantes </div>
                
                    <p className = 'welcome'>
                        {"¡Hola " + username.split(" ")[0] + "! Te damos la bienvenida a tu plataforma de capacitación..." }
                    </p>

                    {
                    messages.map(message => {
                        return (
                            <p className = 'welcome'>
                                { message.message }
                            </p>
                        )
                    })

                }

                <div className = 'search-box'>
                    <input type = 'text' placeholder = 'Escriba el nombre del curso' onChange = { (e) => setSearch(e.target.value) } />
                    <img src = '/search_button.png' className = 'search-button' /> 

                </div>

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
                            if (!search || course.name.toLowerCase().includes(search.toLowerCase())) {
                                return (
                                    <div className = 'operator-course-instance' id = { course.stage2 && 'completed-course' } onClick = { () => handleExploreCourse(course)}> 
                                        <p className = 'instance-attribute' id = 'course-feed-instance'> <b> { course.name } </b> </p>
                                        <p className = 'instance-attribute' id = 'course-feed-instance'> { (course.stage1 && course.stage2) ? 'Completado' : 'En progreso...' }</p>
                                    </div>
                                );
                            }
                        })

                    }
                </div>

            </div>
            
            <div className = { !hiddenContact ? 'corner-popup-aid' : 'display-false' } id = { !hiddenContact && 'gerencias-contacts' }>

                <div className = 'corner-popup-gerencias'> 
                    <div className = 'contacts-popup-pointer' onClick = { () => window.open("/contactos", "_self") }> Tengo una duda </div>
                </div> 

            </div>

            <div className = { verifyRef ? 'verify-button' : 'display-false' } >
                <h5> No puedes deshacer esta acción </h5> 

                <div className = 'verifying-buttons'>
                    <button id = 'verify-yes' onClick = { () => logout() }>
                        SÍ
                    </button>

                    <button id = 'verify-no' onClick = { () => { setVerifyRef(false) }}>
                        CANCELAR 
                    </button>
            
                </div>
            </div>

        </div>
    );
}

export default CourseFeed;