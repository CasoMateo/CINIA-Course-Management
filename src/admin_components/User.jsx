import React, { useState, useContext } from 'react';
import ReactDOM from 'react-dom'; 
import { useNavigate, useParams } from 'react-router-dom';
import '../index.css';
import { AuthContext } from '../contexts/AuthContext';

function User(props) {
    const navigate = useNavigate();
    const params = useParams(); 
    const { getCookie, logout } = useContext(AuthContext);

    const username = getCookie('username');
    const rank = 'Admin.';
    
    const [retrievedUser, setRetrievedUser] = useState(false); 
    const [changedNumber, setChangedNumber] = useState();
    const [hiddenMenu, setHiddenMenu] = useState(false);
    const [user, setUser] = useState({ 'name': '', 'rank': false, 'area': '', 'courses': [] });
    const [verifyRef, setVerifyRef] = useState(false); 

    const getUserResource = async () => {
        
        const url = 'https://jt6z2tunnora6oi6u6x37zl3cq0rgqwq.lambda-url.us-west-2.on.aws/get-user/'.concat(params.cur_user);
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
          alert('No se retiró el usuario correctamente');
          navigate('/usuarios');
        }  
        
        setUser(response.user);
      
    };

    const handleChangePhoneNumber = () => {

      const changePhoneResource = async () => {
        
        const url = 'https://jt6z2tunnora6oi6u6x37zl3cq0rgqwq.lambda-url.us-west-2.on.aws/change-phone-number';
        const promise = await fetch(url, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cookies': document.cookie
          },
          body: JSON.stringify({ 'username': params.cur_user, 'phone_number': changedNumber })
        }); 
        
        const response = await promise.json();
        
        if (promise.status == 429) {
          alert('Demasiadas solicitudes, espera un poco');
          return;
        }
        
        if ((!response.changedPhone) || (promise.status != 200)) {
          alert('Ingresa datos correctos');
          return;
        }  
        
      };

      changePhoneResource();
    }
    
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

                    <button className = 'logout' onClick = { () => setVerifyRef(true) } > Cerrar sesión </button>

                </div> 
            </div>

            <div className = 'main-page'>
              <h5 className = 'course-header'> { user.username } </h5> 

              <form className = 'change-phone-form' onSubmit = { () => handleChangePhoneNumber() }>
                {user.phone_number ? (<label className = 'change-phone-label'> <b> Cambiar </b> <i> { user.phone_number } </i>  </label> ) : (<label> Agregar contacto </label>) } 
                <input className = 'change-phone-input' placeholder = 'Nuevo teléfono' onChange = { (e) => setChangedNumber(e.target.value) } />
                <button className = 'submit-form' type = 'submit' id = 'change-phone-submit'> Cambiar </button> 
              </form>

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

            <div className = { !hiddenMenu ? 'corner-popup-aid' : 'display-false' }>

                <div className = 'corner-popup'> 
                    <div onClick = { () => { user.phone_number ? window.open("https://wa.me/".concat(user.phone_number).concat("?text=Tu mensaje")) : alert('No lo puedes contactar') } }> { user.phone_number ? (<p> CONTACTAR <br /> { user.phone_number } </p> ) : (<p> NO HAY <br /> CONTACTO </p> )} </div>
                </div> 

            </div>

            <div className = { verifyRef ? 'verify-button' : 'display-false' } >
                <h5> No puedes deshacer esta acción </h5> 

                <div className = 'verifying-buttons'>
                    <button id = 'verify-yes' onClick = { () => logout() }>
                        SÍ
                    </button>

                    <button id = 'verify-no' onClick = { () => { setVerifyRef(false) } }>
                        CANCELAR 
                    </button>
            
                </div>
            </div>
      </div>

    );
}

export default User;