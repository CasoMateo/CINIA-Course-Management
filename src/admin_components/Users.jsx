
import React, { useState, useContext } from 'react';
import ReactDOM from 'react-dom'; 
import '../index.css';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext'; 
import fileDownload from 'js-file-download'

function Users(props) {

    const navigate = useNavigate();
    const { getCookie, logout } = useContext(AuthContext); 

    const username = getCookie('username');
    const rank = 'Admin.';

    const [users, setUsers] = useState([]); 
    const [verifyRef, setVerifyRef] = useState(false);
    const [deletedUser, setDeletedUser] = useState();
    const [clickedLogout, setClickedLogout] = useState(false); 
    const [retrievedUsers, setRetrievedUsers] = useState(false);
    const [hiddenChanges, setHiddenChanges] = useState(false);
    const [addUserForm, setAddUserForm] = useState(false);
    const [addUserAttributes, setAddUserAttributes] = useState({ 'username': '', 'password': '', 'employee_number': '', 'rank': false, 'area': '' })
    const [search, setSearch] = useState();

    const getUsersResource = async () => {
        
        if (retrievedUsers) {  
          return;
        }
    
        const promise = await fetch('https://jt6z2tunnora6oi6u6x37zl3cq0rgqwq.lambda-url.us-west-2.on.aws/get-users', { 
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
          alert('Failed to retrieve users');
          return;
        } 
    
        const response = await promise.json();
      
        
        setUsers(response.users);
        console.log(response.users);
    };  

    const getCSVResource = async () => {
        
        const promise = await fetch('https://jt6z2tunnora6oi6u6x37zl3cq0rgqwq.lambda-url.us-west-2.on.aws/users-csv-file', { 
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
          alert('No se recuperó el archivo de Excel');
          return;
        } 
    
        const response = await promise.blob();

    
        fileDownload(response, "usuarios_exporte.csv");
        
    };  


    if (!retrievedUsers) {
        getUsersResource();
        setRetrievedUsers(true);
    }

    const handleAddUser = (event) => {
        event.preventDefault();
        
        if (addUserAttributes.rank) {
            if (addUserAttributes.area != 'Administra.') {
                alert('Si es un administrador, debe pertenecer al área administrativa');
                return;
            }
        }
        
        if (!addUserAttributes.phone_number) {
            delete addUserAttributes.phone_number;
        }

        const addUserResource = async () => {
            const promise = await fetch('https://jt6z2tunnora6oi6u6x37zl3cq0rgqwq.lambda-url.us-west-2.on.aws/add-user', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cookies': document.cookie
              },
              body: JSON.stringify(addUserAttributes)
            });
      
            
            const response = await promise.json(); 

            if (promise.status == 429) {
                alert('Demasiadas solicitudes, espera un poco');
                return;
            }
            
            if (promise.status == 422) {
                alert('Refresca la página para añadir a un nuevo usuario');
                return;
            }

            if ((promise.status !== 200) || (!response.addedUser)) {
                alert('No se añadió correctamente. Es probable que tengas que escoger otro nombre para el usuario');
                return;
            } else {
                setRetrievedUsers(false);
            }
            
      
        };
      
        addUserResource();

        setAddUserForm(false);
    }

    const handleRemoveUser = (username) => {
        const deleteUserResource = async () => {
            const promise = await fetch('https://jt6z2tunnora6oi6u6x37zl3cq0rgqwq.lambda-url.us-west-2.on.aws/delete-user', {
              method: 'DELETE',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cookies': document.cookie
              },
              body: JSON.stringify({ 'username': username })
            });
      
            
            const response = await promise.json(); 
            
            if (promise.status == 429) {
                alert('Demasiadas solicitudes, espera un poco');
                return;
            }

            if ((promise.status != 200) || (!response.deletedUser)) {
                alert('No se eliminó correctamente (no intentes eliminarte a ti mismo)');
                return;
            } else {
                setRetrievedUsers(false);
            }
            
      
        };
      
        deleteUserResource();
    }

    const handleVerifyConfirm = () => {
        if (deletedUser) {
            handleRemoveUser(deletedUser); 
            setDeletedUser();
        } else if (clickedLogout) {
            logout(); 
            setClickedLogout(false);
        }

        setVerifyRef(false);
    }

    return (
        <div> 
            <div className = 'sidebar'>
                
                <img src = '/cinia_logo (1).png' alt = 'Logo' className = 'cinia-logo'/> 

                <div className = 'sidebar-options'> 
                    <p className = 'sidebar-option' id = 'selected-page'> Usuarios </p>
                    <p className = 'sidebar-option' onClick = { () => navigate('/cursos') }> Cursos </p>
                    <p className = 'sidebar-option' onClick = { () => navigate('/contactos') }> Contactos y Mensajes </p>
                    
                </div>

                <div className = 'profile-details'>
                    <div className = 'credentials'> 
                        <p className = 'username' > { username } </p>
                        <p className = 'rank'> { rank } </p>
                        <p className = 'hide-menu' onClick = { () => setHiddenChanges(!hiddenChanges) }> Ocultar/poner menú </p>
                    </div>

                    <button className = 'logout' onClick = { () => { setVerifyRef(true); setClickedLogout(true) } } > Cerrar sesión </button>

                </div> 
            </div>

            <div className = 'main-page'>
                
                <p className = 'welcome'>
                    ¡Bienvenido a tu página de capacitación! Podrás ver los usuarios de la plataforma, 
                    los cursos asignados, y los contactos proporcionados aquí...
                </p>

                <button className = 'download-button' onClick = { () => getCSVResource() }>
                    Descargar la base de datos 
                </button>

                <div className = 'search-box'>
                    <input type = 'text' placeholder = 'Escriba el nombre del usuario' onChange = { (e) => setSearch(e.target.value) } />
                    <img src = '/search_button.png' className = 'search-button' /> 

                </div>

                <div className = 'user-instance'>
                    <p className = 'instance-attribute-header'> Nombre </p>
                    <p className = 'instance-attribute-header'> Posición </p>
                    <p className = 'instance-attribute-header'> # Empleado </p>
                    <p className = 'instance-attribute-header'> Área </p>
                    <p className = 'instance-attribute-header'> Cursos </p>

                </div>

                <div className = 'access-retrieval'> 
                    {
                        users.length === 0 
                        ?
                        <div className = 'message-no-data'> 
                            No hay usuarios disponibles
                        </div> 

                        : users.map(user => {
                            if (!search || user.username.toLowerCase().includes(search.toLowerCase())) {
                                return (
                                    <div key = { user._id.$oid } className = 'user-instance'> 
                                        <p className = 'instance-attribute' id = 'name-attribute' onClick = { () => { !user.rank ? navigate('/usuario/'.concat(user.username)) : alert('Este usuario no completa cursos, es administrador') } }> { user.username } </p>
                                        <p className = 'instance-attribute'> { user.rank ? 'Admin.' : 'Operador'} </p>
                                        <p className = 'instance-attribute'> { user.employee_number } </p>
                                        <p className = 'instance-attribute'> { user.area } </p>
                                        <p className = 'instance-attribute'> { !user.rank ? Object.keys(user.courses).length : 'NO OPERA'} </p>
                                        <img className = 'trash-button-user' src = '/trash_button.png' alt = 'Trash button' onClick = { () => { setDeletedUser(user.username); setVerifyRef(true) } }/> 
                                    </div>
                                )
                            }
                        })
                    }
                </div>

            </div>

            <div className = { !hiddenChanges ? 'corner-popup-aid' : 'display-false' }>

                <div className = 'corner-popup'> 
                    <p onClick = { () => setAddUserForm(true) }> Añadir <br /> Usuario </p>
                </div> 

            </div>

            <div className = { addUserForm ? 'pop-up-form' : 'display-false' }> 
               
                <div className = 'title-close-form'>
                    <h5 className = 'form-title'> 
                        Añadir Usuario 
                    </h5>
                    <img onClick = { () => setAddUserForm(false) } className = 'close-pop-up-form' src = '/close_button.png' />
                    
                </div>

                <form class = 'add-whatever-form' onSubmit = { (event) => handleAddUser(event) }>
                    <label className = 'form-label'> Nombre </label>
                    <br/>
                    <input className = 'input-field-add' type="text" placeholder = 'Escriba el nombre sin acentos' required onChange = { e => setAddUserAttributes(prevState => ({ ...prevState, username : e.target.value })) }/> 
                    <br/>
                    <br />
                    <label className = 'form-label'> Contraseña </label>
                    <br/>
                    <input className = 'input-field-add' type="text" placeholder = 'Escriba la contraseña' required onChange = { e => setAddUserAttributes(prevState => ({ ...prevState, password : e.target.value })) }/> 
                    <br/>
                    <br />
                    <label className = 'form-label'> Número de empleado </label>
                    <br/>
                    <input className = 'input-field-add' type="text" placeholder = 'Escriba el número de empleado' required onChange = { e => setAddUserAttributes(prevState => ({ ...prevState, employee_number : e.target.value })) }/> 
                    <br/>
                    <br />
                    <label className = 'form-label'> Número de teléfono </label>
                    <br/>
                    <input className = 'input-field-add' type="text" placeholder = 'Escriba el número de teléfono' onChange = { e => setAddUserAttributes(prevState => ({ ...prevState, phone_number : e.target.value })) }/> 
                    <br/>
                    <br />
                    <label className = 'form-label'> Posición </label>
                    <div>
                        <form> 
                        <div className = 'radio-option'>
                            <input name = 'level' type="radio" 
                                    required onChange = { () => setAddUserAttributes(prevState => ({ ...prevState, rank: true })) } />
                            <label>Admin.</label>
                        </div>

                        <div className = 'radio-option'>
                            <input name = 'level' type="radio" required onChange = { () => setAddUserAttributes(prevState => ({ ...prevState, rank: false})) } />
                            <label >Operador</label>
                        </div>
                        </form>
                    </div>
                    <br/>
                    <label className = 'form-label'> Área </label>
                    <br/>
                    <div>
                        <form>
                        <div className = 'radio-option'>
                            <input name = 'level' type="radio" 
                                    required onChange = { () => setAddUserAttributes(prevState => ({ ...prevState, area: 'Jardineria'})) }/>
                            <label>Jardinería</label>
                        </div>

                        <div className = 'radio-option'>
                            <input name = 'level' type="radio" required onChange = { () => setAddUserAttributes(prevState => ({ ...prevState, area: 'Limpieza'})) }/>
                            <label >Limpieza</label>
                        </div> 
                        <div className = 'radio-option'>
                            <input name = 'level' type="radio" required onChange = { () => setAddUserAttributes(prevState => ({ ...prevState, area: 'Textil'})) }/>
                            <label >Textil</label>
                        </div> 
                        <div className = 'radio-option'>
                            <input name = 'level' type="radio" required onChange = { () => setAddUserAttributes(prevState => ({ ...prevState, area: 'Acondi.'})) }/>
                            <label >Acondicionamiento</label>
                        </div> 
                        <div className = 'radio-option'>
                            <input name = 'level' type="radio" required onChange = { () => setAddUserAttributes(prevState => ({ ...prevState, area: 'Automocion'})) }/>
                            <label >Automoción</label>
                        </div> 
                        <div className = 'radio-option'>
                            <input name = 'level' type="radio" required onChange = { () => setAddUserAttributes(prevState => ({ ...prevState, area: 'Administra.'})) }/>
                            <label >Administrativo</label>
                        </div> 
                        </form>
                    </div>
                    <br />
                    <button type = 'submit' className = 'submit-form'> AÑADIR </button>
                
                </form>

            </div>

            <div className = { verifyRef ? 'verify-button' : 'display-false' } >
                <h5> No puedes deshacer esta acción </h5> 

                <div className = 'verifying-buttons'>
                    <button id = 'verify-yes' onClick = { () => handleVerifyConfirm() }>
                        SÍ
                    </button>

                    <button id = 'verify-no' onClick = { () => { setVerifyRef(false); setDeletedUser(); setClickedLogout(false) }}>
                        CANCELAR 
                    </button>
            
                </div>
            </div>

        </div>
    );
}

export default Users;