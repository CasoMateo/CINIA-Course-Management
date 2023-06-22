import React, { useState, useContext } from 'react';
import ReactDOM from 'react-dom'; 
import '../index.css';
import { useNavigate, useParams } from 'react-router-dom';  
import { AuthContext } from '../contexts/AuthContext';

function ContactFeed(props) {

    const navigate = useNavigate();
    const { getCookie, logout } = useContext(AuthContext); 

    const username = getCookie('username'); 
    const rank = 'Operador';

    const [contacts, setContacts] = useState([]); 
    const [retrievedContacts, setRetrievedContacts] = useState(false);
    const [verifyRef, setVerifyRef] = useState(false); 

    const getContactsResource = async () => {
        
        if (retrievedContacts) {  
          return;
        }
    
        const promise = await fetch('https://4n2uwcxavgyd66gnq2ltzvlfne0nusvp.lambda-url.us-west-2.on.aws/get-contacts', { 
          method: 'GET',
          headers: {
            'Cookies': document.cookie
          },
          credentials: 'include'
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

    if (!retrievedContacts) {
        getContactsResource();
        setRetrievedContacts(true); 
    }


    return (
        <div>
            <div className = 'sidebar'>
                
                <img src = '/cinia_logo (1).png' alt = 'Logo' className = 'cinia-logo'/> 
                <div className = 'sidebar-options'> 
                
                    <p className = 'sidebar-option' onClick = { () => navigate('/operador') }> Cursos </p>
                    <p className = 'sidebar-option' id = 'selected-page'> Contactos </p>
                    <p className = 'sidebar-option' onClick = { () => navigate('/preguntasfrecuentes') }> Preguntas frecuentes </p>
                    
                </div>

                <div className = 'profile-details'>
                    <div className = 'credentials'> 
                        <p className = 'username' > { username } </p>
                        <p className = 'rank'> { rank } </p>
                    </div>

                    <button className = 'logout' onClick = { () => setVerifyRef(true)} > Cerrar sesión </button>

                </div> 
            </div>

            <div className = 'main-page'>

                <p className = 'welcome-contacts'>
                    ¡<b> Haz click </b> en el área que quieras contactar!
                </p>

                <div className = 'contact-list'>
                     
                    {   
                    
                    contacts.length > 0 
                    &&
                    contacts.map(contact => {
                        return(
                            <div className = 'separate-contact' onClick = { () => window.open("https://wa.me/".concat(contact.phone_number).concat("?text=Tu mensaje")) } > { contact.name } </div>
                        );
                    })
                
                }

                    <div className = 'separate-contact' onClick = { () => window.open("mailto:soportec@cinia.net?subject=Asunto&body=Escribe%20tu%20mensaje") }>  soportec@cinia.net </div>
                    <div className = 'separate-contact' onClick = { () => window.open("mailto:marketing@cinia.net?subject=Asunto&body=Escribe%20tu%20mensaje") }> marketing@cinia.net </div>
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

export default ContactFeed;