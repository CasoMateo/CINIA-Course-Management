
import React, { useState } from 'react';
import ReactDOM from 'react-dom'; 
import '../index.css';
import { useNavigate, useParams } from 'react-router-dom';


function Users(props) {

    const navigate = useNavigate();
    const username = 'Mateo Caso';
    const rank = 'Admin.';
    const [users, setUsers] = useState([]); 
    const [verifyRef, setVerifyRef] = useState(false);
    const [deletedUser, setDeletedUser] = useState();
    const [retrievedUsers, setRetrievedUsers] = useState(false);
    const [hiddenChanges, setHiddenChanges] = useState(false);
    const [addUserForm, setAddUserForm] = useState(false);
    const [addUserAttributes, setAddUserAttributes] = useState({ 'username': '', 'password': '', 'employee_number': '', 'rank': false, 'area': '' })

    const getUsersResource = async () => {
        
        if (retrievedUsers) {  
          return;
        }
    
        const promise = await fetch('http://127.0.0.1:8000/get-users', { 
          method: 'GET',
          credentials: 'include'
        }); 
        
        if (promise.status !== 200) {
          alert('Failed to retrieve users');
        } 
    
        const response = await promise.json();
      
        
        setUsers(response.users);
    };  

    if (!retrievedUsers) {
        getUsersResource();
        setRetrievedUsers(true);
    }

    const handleAddUser = () => {

        if (addUserAttributes.rank) {
            if (addUserAttributes.area != 'Adminis.') {
                alert('Si es un administrador, debe pertenecer al área administrativa');
                return;
            }
        }

        const addUserResource = async () => {
            const promise = await fetch('http://127.0.0.1:8000/add-user', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(addUserAttributes)
            });
      
            
            const response = await promise.json(); 
            
            if ((promise.status !== 200) || (!response.addedUser)) {
                alert('Not properly added');
            } else {
                setRetrievedUsers(false);
            }
            
      
        };
      
        addUserResource();
          
        setAddUserAttributes();

        setAddUserForm(false);
    }

    const handleRemoveUser = (username) => {
        const deleteUserResource = async () => {
            const promise = await fetch('http://127.0.0.1:8000/delete-user', {
              method: 'DELETE',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 'username': username })
            });
      
            
            const response = await promise.json(); 

            if ((promise.status != 200) || (!response.deletedUser)) {
                alert('Not properly removed');
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
                    
                </div>

                <div className = 'profile-details'>
                    <div className = 'credentials'> 
                        <p className = 'username' > { username } </p>
                        <p className = 'rank'> { rank } </p>
                        <p className = 'hide-menu' onClick = { () => setHiddenChanges(!hiddenChanges) }> Ocultar/poner menú </p>
                    </div>

                    <button className = 'logout' onClick = { () => alert('Logged out')} > Cerrar sesión </button>

                </div> 
            </div>

            <div className = 'main-page'>
                
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
                        })
                    }
                </div>

            </div>

            <div className = { !hiddenChanges ? 'corner-popup-aid' : 'display-false' }>

                <div className = 'corner-popup'> 
                    <p onClick = { () => setAddUserForm(true) }> AÑADIR <br /> USUARIO </p>
                </div> 

            </div>

            <div className = { addUserForm ? 'pop-up-form' : 'display-false' }> 
               
                <div className = 'title-close-form'>
                    <h5 className = 'form-title'> 
                        Añadir Usuario 
                    </h5>
                    <img onClick = { () => setAddUserForm(false) } className = 'close-pop-up-form' src = '/close_button.png' />
                    
                </div>

                <form onSubmit = { () => handleAddUser() }>
                    <label className = 'form-label'> Nombre </label>
                    <br/>
                    <input className = 'input-field-add' type="text" placeholder = 'Escriba el nombre del usuario' required onChange = { e => setAddUserAttributes(prevState => ({ ...prevState, username : e.target.value })) }/> 
                    <br/>
                    <br />
                    <label className = 'form-label'> Contraseña </label>
                    <br/>
                    <input className = 'input-field-add' type="text" placeholder = 'Escriba el nombre del usuario' required onChange = { e => setAddUserAttributes(prevState => ({ ...prevState, password : e.target.value })) }/> 
                    <br/>
                    <br />
                    <label className = 'form-label'> Número de empleado </label>
                    <br/>
                    <input className = 'input-field-add' type="text" placeholder = 'Escriba el número de empleado' required onChange = { e => setAddUserAttributes(prevState => ({ ...prevState, employee_number : e.target.value })) }/> 
                    <br/>
                    <br />
                    <label className = 'form-label'> Posición </label>
                    <form>
                        <div className = 'radio-option'>
                            <input name = 'level' type="radio" 
                                    required onChange = { () => setAddUserAttributes(prevState => ({ ...prevState, rank: true })) } />
                            <label>Admin.</label>
                        </div>

                        <div className = 'radio-option'>
                            <input name = 'level' type="radio" required onChange = { () => setAddUserAttributes(prevState => ({ ...prevState, rank: false})) }/>
                            <label >Operador</label>
                        </div>
                    </form>
                    <br/>
                    <label className = 'form-label'> Área </label>
                    <br/>
                    <form>
                        <div className = 'radio-option'>
                            <input name = 'level' type="radio" 
                                    required onChange = { () => setAddUserAttributes(prevState => ({ ...prevState, area: 'Jardinería'})) }/>
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
                            <input name = 'level' type="radio" required onChange = { () => setAddUserAttributes(prevState => ({ ...prevState, area: 'Automoción'})) }/>
                            <label >Automoción</label>
                        </div> 
                        <div className = 'radio-option'>
                            <input name = 'level' type="radio" required onChange = { () => setAddUserAttributes(prevState => ({ ...prevState, area: 'Adminis.'})) }/>
                            <label >Administrativo</label>
                        </div> 
                    </form>
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

                    <button id = 'verify-no' onClick = { () => setVerifyRef(false) }>
                        CANCELAR 
                    </button>
            
                </div>
            </div>

        </div>
    );
}

export default Users;