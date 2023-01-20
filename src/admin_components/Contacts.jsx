import React, { useState, useContext } from 'react';
import ReactDOM from 'react-dom'; 
import '../index.css';
import { useNavigate, useParams } from 'react-router-dom'; 
import { AuthContext } from '../contexts/AuthContext';

function Contacts(props) {

    const navigate = useNavigate();
    const { getCookie, logout } = useContext(AuthContext); 
    const username = getCookie('username'); 
    const rank = 'Admin.';

    const [hiddenMenu, setHiddenMenu] = useState(false);
    const [search, setSearch] = useState(); 
    const [verifyRef, setVerifyRef] = useState(false);
    const [retrievedContacts, setRetrievedContacts] = useState(false); 
    const [deletedContact, setDeletedContact] = useState();
    const [showStage, setShowStage] = useState(false);
    const [deletedMessage, setDeletedMessage] = useState();
    const [contacts, setContacts] = useState([]); 
    const [messages, setMessages] = useState([]);
    const [addMessageAttributes, setAddMessageAttributes] = useState();
    const [addContactAttributes, setAddContactAttributes] = useState();
    const [addContactForm, setAddContactForm] = useState(false);
    const [addMessageForm, setAddMessageForm] = useState(false);
    const [clickedLogout, setClickedLogout] = useState(false);

    const getContactsResource = async () => {
        
        if (retrievedContacts) {  
          return;
        }
    
        const promise = await fetch('https://jt6z2tunnora6oi6u6x37zl3cq0rgqwq.lambda-url.us-west-2.on.aws/get-contacts', { 
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
      
        setContacts(response.contacts);
    };  

    const getMessagesResource = async () => {
        
        if (retrievedContacts) {  
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

    if (!retrievedContacts) {
        getContactsResource();
        getMessagesResource();
        setRetrievedContacts(true);
    }

    const handleAddContact = (event) => {
        event.preventDefault();
        event.target.reset();

        const addContactResource = async () => {
            const promise = await fetch('https://jt6z2tunnora6oi6u6x37zl3cq0rgqwq.lambda-url.us-west-2.on.aws/add-contact', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cookies': document.cookie
              },
              body: JSON.stringify(addContactAttributes)
            });
      
            
            const response = await promise.json(); 

            if (promise.status == 429) {
                alert('Demasiadas solicitudes, espera un poco');
                return;
            }

            if ((promise.status != 200) || (!response.addedContact)) {
                alert('No se añadió correctamente');
                return;
            } else {
                setRetrievedContacts(false);
            }
            
      
        };
      
        addContactResource();
        setAddContactForm(false);
    }

    const handleAddMessage = (event) => {
        
        event.preventDefault();
        event.target.reset();

        const addMessageResource = async () => {
            const promise = await fetch('https://jt6z2tunnora6oi6u6x37zl3cq0rgqwq.lambda-url.us-west-2.on.aws/add-message', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cookies': document.cookie
              },
              body: JSON.stringify(addMessageAttributes)
            });
      
            
            const response = await promise.json(); 

            if (promise.status == 429) {
                alert('Demasiadas solicitudes, espera un poco');
                return;
            }

            if ((promise.status != 200) || (!response.addedMessage)) {
                alert('No se añadió correctamente');
                return;
            } else {
                setRetrievedContacts(false);
            }
            
      
        };
      
        addMessageResource();
        setAddMessageForm(false);
    }

    const handleDeleteContact = () => {
        const deleteContactResource = async () => {
            const promise = await fetch('https://jt6z2tunnora6oi6u6x37zl3cq0rgqwq.lambda-url.us-west-2.on.aws/delete-contact', {
              method: 'DELETE',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cookies': document.cookie
              },
              body: JSON.stringify(deletedContact)
            });
      
            
            const response = await promise.json(); 

            if (promise.status == 429) {
                alert('Demasiadas solicitudes, espera un poco');
                return;
            }

            if ((promise.status != 200) || (!response.deletedContact)) {
                alert('No se eliminó correctamente');
                return;
            } else {
                setRetrievedContacts(false);
            }
            
      
        };
      
        deleteContactResource();
    }

    const handleDeleteMessage = () => {
        console.log(deletedMessage);
        const deleteMessageResource = async () => {
            const promise = await fetch('https://jt6z2tunnora6oi6u6x37zl3cq0rgqwq.lambda-url.us-west-2.on.aws/delete-message', {
              method: 'DELETE',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cookies': document.cookie
              },
              body: JSON.stringify(deletedMessage)
            });
      
            
            const response = await promise.json(); 

            if (promise.status == 429) {
                alert('Demasiadas solicitudes, espera un poco');
                return;
            }

            if ((promise.status != 200) || (!response.deletedMessage)) {
                alert('No se eliminó correctamente');
                return;
            } else {
                setRetrievedContacts(false);
            }
            
      
        };
      
        deleteMessageResource();
    }

    const handleVerifyConfirm = () => {
        if (deletedContact) {
            handleDeleteContact();
            setDeletedContact();
        } else if (deletedMessage) {
            handleDeleteMessage(); 
            setDeletedMessage();
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
                    <p className = 'sidebar-option' onClick = { () => navigate('/usuarios') }> Usuarios </p>
                    <p className = 'sidebar-option' onClick = { () => navigate('/cursos') }> Cursos </p>
                    <p className = 'sidebar-option' id = 'selected-page'> Contactos y Mensajes</p>
              
                </div>

                <div className = 'profile-details'>
                    <div className = 'credentials'> 
                        <p className = 'username' > { username } </p>
                        <p className = 'rank'> { rank } </p>
                        <p className = 'switch-stage' onClick = { () => setShowStage(!showStage) }> { !showStage ? 'Ver mensajes' : 'Ver contactos'} </p>
                        <p className = 'switch-stage' onClick = { () => setHiddenMenu(!hiddenMenu) }> Ocultar/poner menú </p>
                    </div>

                    <button className = 'logout' onClick = { () => { setVerifyRef(true); setClickedLogout(true) }} > Cerrar sesión </button>

                </div> 
            </div>

            <div className = 'main-page'>
                
                <div>
                <div className = 'search-box'>
                    <input type = 'text' placeholder = 'Escriba el contacto o mensaje' onChange = { (e) => setSearch(e.target.value) } />
                    <img src = '/search_button.png' className = 'search-button' /> 

                </div>

                <div id = 'access-retrieval-contacts' className = { showStage && 'display-false'}>
                <div className = 'contact-instance'>
                    <p className = 'instance-attribute-header'> Nombre </p>
                    <p className = 'instance-attribute-header'> Teléfono </p>
                    
                </div>

                <div className = 'access-retrieval'> 
                    {
                        contacts.length === 0 
                        ?
                        <div className = 'message-no-data'> 
                            No hay contactos disponibles
                        </div> 

                        : contacts.map(contact => {
                            
                            if (!search || contact.name.toLowerCase().includes(search.toLowerCase())) {
                                return (
                                    <div key = { contact._id.$oid } className = 'contact-instance'> 
                                        <p className = 'instance-attribute' id = 'name-attribute'> { contact.name } </p>
                                        <p className = 'instance-attribute'> { contact.phone_number } </p>
                                        <img className = 'trash-button-user' src = '/trash_button.png' alt = 'Trash button' onClick = { () => { setVerifyRef(true); setDeletedContact(prevState => ({ ...prevState, name : contact.name } ) ) } } /> 
                                    </div>
                                )
                            }
                        })
                    }
                </div>
                </div>
                </div>
                <div className = { showStage ? 'add-message-body' : 'display-false' }>
                    

                    {
                        messages.length == 0 ?
                        <div className = 'message-no-data'> No hay mensajes disponibles </div> :
                        messages.map(message =>{
                            if (!search || message.message.toLowerCase().includes(search.toLowerCase())) {
                            return (
                                <div id = 'welcome-message'>
                                    <p className = 'welcome'> { message.message } </p>

                                    <img className = 'trash-button-message' src = '/trash_button.png' onClick = { () => { setVerifyRef(true); setDeletedMessage(prevState => ({ ...prevState, message : message.message } ) ) } } />

                                </div>
                            )
}})
                    }

                </div>

            </div>

            <div className = { verifyRef ? 'verify-button' : 'display-false' } >
                <h5> No puedes deshacer esta acción </h5> 

                <div className = 'verifying-buttons'>
                    <button id = 'verify-yes' onClick = { () => handleVerifyConfirm() }>
                        SÍ
                    </button>

                    <button id = 'verify-no' onClick = { () => { setVerifyRef(false); setDeletedContact(); setClickedLogout(false) } }>
                        CANCELAR 
                    </button>
            
                </div>
            </div>
            
            <div className = { addMessageForm ? 'pop-up-form' : 'display-false' }> 
               
                <div className = 'title-close-form'>
                    <h5 className = 'form-title'> 
                        Añadir Mensaje 
                    </h5>
                    <img onClick = { () => setAddMessageForm(false) } className = 'close-pop-up-form' src = '/close_button.png' />
                    
                </div>

                <form class = 'add-whatever-form' onSubmit = { (event) => handleAddMessage(event) }>
                    <label className = 'form-label'> Mensaje </label>
                    <br/>
                    <input className = 'input-field-add' type="text" placeholder = 'Escriba el mensaje' required onChange = { e => setAddMessageAttributes(prevState => ({ ...prevState, message : e.target.value })) } /> 
                    <br/>
                    <button type = 'submit' className = 'submit-form'> AÑADIR </button>
                
                </form>

            </div>

            <div className = { addContactForm ? 'pop-up-form' : 'display-false' }> 
               
                <div className = 'title-close-form'>
                    <h5 className = 'form-title'> 
                        Añadir Contacto
                    </h5>
                    <img onClick = { () => setAddContactForm(false) } className = 'close-pop-up-form' src = '/close_button.png' />
                    
                </div>

                <form class = 'add-whatever-form' onSubmit = { (event) => handleAddContact(event) }>
                    <label className = 'form-label'> Nombre </label>
                    <br/>
                    <input className = 'input-field-add' type="text" placeholder = 'Escriba el nombre del contacto' required onChange = { e => setAddContactAttributes(prevState => ({ ...prevState, name : e.target.value })) }/> 
                    <br/>
                    <br />
                    <label className = 'form-label'> Número de teléfono </label>
                    <br />
                    <input className = 'input-field-add' type="text" placeholder = 'Escriba el teléfono del contacto' required onChange = { e => setAddContactAttributes(prevState => ({ ...prevState, phone_number : e.target.value })) }/>
                    <br />
                    <br />
                    <button type = 'submit' className = 'submit-form'> AÑADIR </button>
                
                </form>

            </div>

            <div className = { (!hiddenMenu && !showStage) ? 'corner-popup-aid' : 'display-false' }>

                <div className = 'corner-popup'> 
                    <p onClick = { () => setAddContactForm(true) }> Añadir <br /> Contacto </p>
                </div> 

            </div>

            <div className = { (!hiddenMenu && showStage) ? 'corner-popup-aid' : 'display-false' }>

                <div className = 'corner-popup'> 
                    <p onClick = { () => setAddMessageForm(true) }> Añadir <br /> Mensaje </p>
                </div> 

            </div>
        </div>
    );
}

export default Contacts;