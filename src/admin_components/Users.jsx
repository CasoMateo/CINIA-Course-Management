
import React, { useState } from 'react';
import ReactDOM from 'react-dom'; 
import '../index.css';
import { useNavigate, useParams } from 'react-router-dom';


function Users(props) {

    const navigate = useNavigate();
    const username = 'Mateo Caso';
    const rank = 'Admin.';
    const [users, setUsers] = useState([{'username': 'Mateo Caso', 'rank': 'Admin.', 'area': 'Jardinería', 'courses': {}}, {'username': 'Mateo Caso', 'rank': 'Admin.', 'area': 'Jardinería', 'courses': {}}]); 
    const [hiddenChanges, setHiddenChanges] = useState(false);
    const [addUserForm, setAddUserForm] = useState(false);
    const [addUserAttributes, setAddUserAttributes] = useState({'username': '', 'rank': '', 'area': '', 'courses': {} })

    const handleAddUser = (event) => {
        event.preventDefault();
        setUsers([...users, addUserAttributes]);
        setAddUserAttributes({'username': '', 'rank': '', 'area': '', 'courses': {} });
        setAddUserForm(false);
    }

    const handleRemoveUser = (username) => {
        setUsers(users.filter(user => user.username != username));
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

            <div className = 'users-main-page'>
                
                <div className = 'user-instance'>
                    <p className = 'user-attribute-header'> Nombre </p>
                    <p className = 'user-attribute-header'> Posición </p>
                    <p className = 'user-attribute-header'> Área </p>
                    <p className = 'user-attribute-header'> Cursos </p>

                </div>

                <div className = 'access-retrieval'> 
                    {
                        users.length == 0 
                        ?
                        <div className = 'message-no-data'> 
                            No hay usuarios disponibles
                        </div> 

                        : users.map(user => {
                            
                            return (
                                <div className = 'user-instance'> 
                                    <p className = 'user-attribute'> { user.username } </p>
                                    <p className = 'user-attribute'> { user.rank } </p>
                                    <p className = 'user-attribute'> { user.area } </p>
                                    <p className = 'user-attribute'> { Object.keys(user.courses).length } </p>
                                    <img className = 'trash-button-user' src = '/trash_button.png' alt = 'Trash button' onClick = { () => handleRemoveUser(user.username) }/> 
                                </div>
                            )
                        })
                    }
                </div>

            </div>

            <div className = { !hiddenChanges ? 'change-users' : 'display-false' }>

                <div className = 'add-user'> 
                    <p onClick = { () => setAddUserForm(true) }> AÑADIR <br /> USUARIO </p>
                </div> 

            </div>

            <div className = { addUserForm ? 'add-user-form' : 'display-false' }> 
               
                <div className = 'title-close-form'>
                    <h5 className = 'form-title'> 
                        Añadir Usuario 
                    </h5>
                    <img onClick = { () => setAddUserForm(false) } className = 'close-pop-up-form' src = '/close_button.png' />
                    
                </div>

                <form onSubmit = { (event) => handleAddUser(event) }>
                    <label className = 'form-label'> Nombre </label>
                    <br/>
                    <input className = 'input-field-add' type="text" placeholder = 'Escriba el nombre del usuario' required onChange = { e => setAddUserAttributes(prevState => ({ ...prevState, username : e.target.value })) }/> 
                    <br/>
                    <br />
                    <label className = 'form-label'> Posición </label>
                    <form>
                        <div className = 'radio-option'>
                            <input name = 'level' type="radio" 
                                    required onChange = { () => setAddUserAttributes(prevState => ({ ...prevState, rank: 'Admin.'})) } />
                            <label>Admin.</label>
                        </div>

                        <div className = 'radio-option'>
                            <input name = 'level' type="radio" required onChange = { () => setAddUserAttributes(prevState => ({ ...prevState, rank: 'Operador'})) }/>
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
                            <input name = 'level' type="radio" required onChange = { () => setAddUserAttributes(prevState => ({ ...prevState, area: 'Acondicionamiento'})) }/>
                            <label >Acondicionamiento</label>
                        </div> 
                        <div className = 'radio-option'>
                            <input name = 'level' type="radio" required onChange = { () => setAddUserAttributes(prevState => ({ ...prevState, area: 'Automoción'})) }/>
                            <label >Automoción</label>
                        </div> 
                    </form>
                    <br />
                    <button type = 'submit' className = 'submit-form'> AÑADIR </button>
                
                </form>

            </div>

        </div>
    );
}

export default Users;