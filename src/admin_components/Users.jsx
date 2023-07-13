
import React, { useState, useContext } from 'react';
import ReactDOM from 'react-dom'; 
import '../index.css';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext'; 
import fileDownload from 'js-file-download';
import Papa from 'papaparse';

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
    const [addUserForm, setAddUserForm] = useState(false);
    const [addUserAttributes, setAddUserAttributes] = useState({ 'username': '', 'password': '', 'employee_number': '', 'rank': false, 'area': '' })
    const [search, setSearch] = useState();
    const [editUserForm, setEditUserForm] = useState(false);
    const [userFilter, setUserFilter] = useState();
    const [file, setFile] = useState();
    const [massiveUpload, setMassiveUpload] = useState([]);


    const getUsersResource = async () => {
        
        if (retrievedUsers) {  
          return;
        }
    
        const promise = await fetch('https://4n2uwcxavgyd66gnq2ltzvlfne0nusvp.lambda-url.us-west-2.on.aws/get-users', { 
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
    };  

    const getCSVResource = async () => {
        
        const promise = await fetch('https://4n2uwcxavgyd66gnq2ltzvlfne0nusvp.lambda-url.us-west-2.on.aws/users-csv-file', { 
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

        addUserAttributes.username = addUserAttributes.username.trimEnd();
        addUserAttributes.password = addUserAttributes.password.trimEnd();

        const addUserResource = async () => {
            const promise = await fetch('https://4n2uwcxavgyd66gnq2ltzvlfne0nusvp.lambda-url.us-west-2.on.aws/add-user', {
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
                alert('Ingresa todos los datos que se piden. Si sigue el problema, refrezca la página');
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
            const promise = await fetch('https://4n2uwcxavgyd66gnq2ltzvlfne0nusvp.lambda-url.us-west-2.on.aws/delete-user', {
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

    const handleEditUser = (event) => {
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

        if (!addUserAttributes.password) {
            delete addUserAttributes.password;
        } 

        addUserAttributes.username = addUserAttributes.username.trimEnd();
        
        addUserAttributes.prevUsername = editUserForm; 

        const changeUserResource = async () => {
            const promise = await fetch('https://4n2uwcxavgyd66gnq2ltzvlfne0nusvp.lambda-url.us-west-2.on.aws/change-user', {
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

            if ((promise.status !== 200) || (!response.changedUser)) {
                alert('No se cambió correctamente. Es probable que tengas que escoger otro nombre para el usuario');
                return;
            } else {
                setRetrievedUsers(false);
            }
            
      
        };
      
        changeUserResource();
        setEditUserForm(false);
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

    const handleFileChange = (event) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
        }
    };
    const handleUploadFile = (event) => {
        event.preventDefault();
        
        Papa.parse(file, {
            complete: (parsedData) => {
              const rows = parsedData.data;
              const parsedRows = rows.map((row) => {
                
                if (row.length != 8) {
                    alert("Todas las lineas deben de tener 8 elementos");
                    return;
                }

                if (!(["Jardineria", "Limpieza", "Textil", "Acondi.", "Automocion", "Administra."]).includes(row[5])) {
                    alert("Una de las areas es incorrecta");
                    return;
                }
      
                var rank_;

                if (row[2] == "TRUE" || row[2] == "VERDADERO") {
                    rank_ = true;
                }
                else {
                    rank_ = false;
                }

                
                const rowData = { 'username': row[0], 'password': row[1], 'rank': rank_, 'employee_number': row[3], 'phone_number': row[4], 'area': row[5], 'group': row[6], 'job': row[7] };
                return rowData;
              });

              fetch('https://4n2uwcxavgyd66gnq2ltzvlfne0nusvp.lambda-url.us-west-2.on.aws/upload-file', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': "application/json",
                    'Cookies': document.cookie,
                },
                body: JSON.stringify(parsedRows),
              })
                .then((response) => response.json())
                .then((responseData) => {
                    
                    if (!responseData.uploadedFile) {
                        alert('El archivo contiene un error. Es probable que haya usuarios duplicados o que ya se hayan añadido.');
                    return;
                    } else {
                        setRetrievedUsers(false);
                    }
                  
                })
            },
            header: false, 
          });
           
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
                    </div>

                    <button className = 'logout' onClick = { () => { setVerifyRef(true); setClickedLogout(true) } } > Cerrar sesión </button>

                </div> 
            </div>

            <div className = 'main-page'>
                
                <p className = 'welcome'>
                    ¡Bienvenido a tu página de capacitación! Podrás ver los usuarios de la plataforma, 
                    los cursos asignados, y los contactos proporcionados aquí...
                </p>

                <div className = "download-upload">
                    <button className = 'download-button' onClick = { () => getCSVResource() }>
                        Descargar la base de datos 
                    </button>

                    <form id = "massive-upload" onSubmit = { (event) => handleUploadFile(event) }>
                        <a id = 'massive-upload' href = "https://docs.google.com/presentation/d/1DomHlusf2Hewl-ekZSPU6TAuKu8C2JYsLFWTSiiSb3U/edit?usp=sharing" target = "new" for = "file-upload"> Carga masiva tutorial </a>
                        <input required id = "file-upload" type = "file" accept = ".csv" onChange = { (event) => handleFileChange(event) } />
                        <button type = 'submit' className = 'submit-form' id = "upload-file-button"> SUBIR </button>
                    </form>

                </div>


                <div className = 'search-box' id = 'search-filter'>
                    
                    <input type = 'text' placeholder = 'Escriba el nombre del usuario' onChange = { (e) => setSearch(e.target.value) } />
            
                    <select class="select-css" onChange = {(e) => setUserFilter(e.target.value)}>
                        <option value = "">Todos</option>
                        <option value = 'Jardineria'>Jardinería</option>
                        <option value = "Limpieza">Limpieza</option>
                        <option value = "Textil">Textil</option>
                        <option value = "Acondi.">Acondicionamiento</option>
                        <option value = "Automocion" >Automoción</option>
                        <option value = "Administra." >Administrativo</option>
                    </select>
                    <img src = '/search_button.png' className = 'search-button' /> 
                    <p className = 'add-popup-form' onClick = { () => setAddUserForm(true) }> Añadir <br /> Usuario </p>
                                        

                </div>

                <div className = 'user-instance'>
                    <p className = 'instance-attribute-header'> Nombre </p>
                    <p className = 'instance-attribute-header'> Posición </p>
                    <p className = 'instance-attribute-header'> # Empleado </p>
                    <p className = 'instance-attribute-header' id = 'area-header'> Área </p>
                    <p className = 'instance-attribute-header'> Puesto </p>

                </div>

                <div className = 'access-retrieval'> 
                    {
                        users.length === 0 
                        ?
                        <div className = 'message-no-data'> 
                            No hay usuarios disponibles
                        </div> 

                        : 
                        
                        users.slice(0)
                        .reverse()
                        .filter((user) => {
                            return (
                            (!search || user.username.toLowerCase().includes(search.toLowerCase())) &&
                            (!userFilter || userFilter === user.area)
                            );
                        })
                        .slice(0, 3)
                        .map((user) => {
                            return (
                                <div key = { user._id.$oid } className = 'user-instance'> 
                                    <p className = 'instance-attribute' id = 'name-attribute' onClick = { () => { !user.rank ? navigate('/usuario/'.concat(user.username)) : alert('Este usuario no completa cursos, es administrador') } }> { user.username } </p>
                                    <p className = 'instance-attribute'> { user.rank ? 'Admin.' : 'Operador'} </p>
                                    <p className = 'instance-attribute'> { user.employee_number } </p>
                                    <p className = 'instance-attribute'> { user.area } </p>
                                    <p className = 'instance-attribute'> { user.job } </p>
                                    <img className = 'edit-button-message-1' src = '/edit_button.png' onClick = { () => { setEditUserForm(user.username); setAddUserAttributes(prevState => ({ ...prevState, username : user.username, password: '', rank: user.rank, area: user.area, employee_number: user.employee_number, area: user.area, group: user.group, job: user.job, phone_number: user.phone_number } )); }}/> 
                                    <img className = 'trash-button-user' src = '/trash_button.png' alt = 'Trash button' onClick = { () => { setDeletedUser(user.username); setVerifyRef(true) } }/> 
                                </div>
                        )})

                        
                    }
                </div>

                <div className = "find-more-users">
                    Para encontrar a más usuarios, usa la barra de busqueda...
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
                    <label className = 'form-label'> Grupo </label>
                    <br/>
                    <input className = 'input-field-add' type="text" placeholder = 'Escriba el puesto' onChange = { e => setAddUserAttributes(prevState => ({ ...prevState, group: e.target.value })) }/> 
                    <br/>
                    <br />
                    <label className = 'form-label'> Puesto </label>
                    <br/>
                    <input className = 'input-field-add' required type="text" placeholder = 'Escriba el puesto' onChange = { e => setAddUserAttributes(prevState => ({ ...prevState, job: e.target.value })) }/> 
                    <br/>
                    <button type = 'submit' className = 'submit-form'> AÑADIR </button>
                
                </form>

            </div>

            <div className = { editUserForm ? 'pop-up-form' : 'display-false' }> 
               
                    <div className = 'title-close-form'>
                        <h5 className = 'form-title'> 
                            Editar Usuario 
                        </h5>
                        <img onClick = { () => setEditUserForm(false) } className = 'close-pop-up-form' src = '/close_button.png' />
                        
                    </div>

                    <form class = 'add-whatever-form' onSubmit = { (event) => handleEditUser(event) }>
                        <label className = 'form-label'> Nombre </label>
                        <br/>
                        <input className = 'input-field-add' value = { addUserAttributes.username } type="text" placeholder = 'Escriba el nombre sin acentos' required onChange = { e => setAddUserAttributes(prevState => ({ ...prevState, username : e.target.value })) }/> 
                        <br/>
                        <br />
                        <label className = 'form-label'> Contraseña </label>
                        <br/>
                        <input className = 'input-field-add' value = { addUserAttributes.password } type="text" placeholder = 'Escriba la contraseña' onChange = { e => setAddUserAttributes(prevState => ({ ...prevState, password : e.target.value })) }/> 
                        <br/>
                        <br />
                        <label className = 'form-label'> Número de empleado </label>
                        <br/>
                        <input className = 'input-field-add' type="text" value = { addUserAttributes.employee_number } placeholder = 'Escriba el número de empleado' required onChange = { e => setAddUserAttributes(prevState => ({ ...prevState, employee_number : e.target.value })) }/> 
                        <br/>
                        <br />
                        <label className = 'form-label'> Número de teléfono </label>
                        <br/>
                        <input className = 'input-field-add' type="text" value = { addUserAttributes.phone_number ? addUserAttributes.phone_number : ''} placeholder = 'Nuevo número de teléfono' onChange = { e => setAddUserAttributes(prevState => ({ ...prevState, phone_number : e.target.value })) }/> 
                        <br/>
                        <br />
                        <label className = 'form-label'> Posición </label>
                        <div>
                            <form> 
                            <div className = 'radio-option'>
                                <input checked = { addUserAttributes.rank } name = 'level' type="radio" 
                                        required onChange = { () => setAddUserAttributes(prevState => ({ ...prevState, rank: true })) } />
                                <label>Admin.</label>
                            </div>

                            <div className = 'radio-option'>
                                <input checked = { !addUserAttributes.rank } name = 'level' type="radio" required onChange = { () => setAddUserAttributes(prevState => ({ ...prevState, rank: false})) } />
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
                                <input checked = { addUserAttributes.area == "Jardineria" } name = 'level' type="radio" 
                                        required onChange = { () => setAddUserAttributes(prevState => ({ ...prevState, area: 'Jardineria'})) }/>
                                <label>Jardinería</label>
                            </div>

                            <div className = 'radio-option'>
                                <input checked = { addUserAttributes.area == "Limpieza" } name = 'level' type="radio" required onChange = { () => setAddUserAttributes(prevState => ({ ...prevState, area: 'Limpieza'})) }/>
                                <label >Limpieza</label>
                            </div> 
                            <div className = 'radio-option'>
                                <input checked = { addUserAttributes.area == "Textil" } name = 'level' type="radio" required onChange = { () => setAddUserAttributes(prevState => ({ ...prevState, area: 'Textil'})) }/>
                                <label >Textil</label>
                            </div> 
                            <div className = 'radio-option'>
                                <input checked = { addUserAttributes.area == "Acondi." } name = 'level' type="radio" required onChange = { () => setAddUserAttributes(prevState => ({ ...prevState, area: 'Acondi.'})) }/>
                                <label >Acondicionamiento</label>
                            </div> 
                            <div className = 'radio-option'>
                                <input checked = { addUserAttributes.area == "Automocion" } name = 'level' type="radio" required onChange = { () => setAddUserAttributes(prevState => ({ ...prevState, area: 'Automocion'})) }/>
                                <label >Automoción</label>
                            </div> 
                            <div className = 'radio-option'>
                                <input checked = { addUserAttributes.area == "Administra." } name = 'level' type="radio" required onChange = { () => setAddUserAttributes(prevState => ({ ...prevState, area: 'Administra.'})) }/>
                                <label >Administrativo</label>
                            </div> 
                            </form>
                        </div>
                        <br />
                        <label className = 'form-label'> Grupo </label>
                        <br/>
                        <input className = 'input-field-add' type="text" value = { addUserAttributes.group ? addUserAttributes.group : ''} placeholder = 'Escriba el grupo' onChange = { e => setAddUserAttributes(prevState => ({ ...prevState, group: e.target.value })) }/> 
                        <br/>
                        <br />
                        <label className = 'form-label'> Puesto </label>
                        <br/>
                        <input className = 'input-field-add' required type="text" value = { addUserAttributes.job ? addUserAttributes.job : ''} placeholder = 'Escriba el puesto' onChange = { e => setAddUserAttributes(prevState => ({ ...prevState, job: e.target.value })) }/> 
                        <br/>
                        <br />
                        <button type = 'submit' className = 'submit-form'> EDITAR </button>
                    
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