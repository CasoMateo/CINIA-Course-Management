import React, { useState, useContext } from 'react';
import ReactDOM from 'react-dom'; 
import { useNavigate, useParams } from 'react-router-dom';
import '../index.css';
import { AuthContext } from '../contexts/AuthContext';

function FrequentQuestions(props) {
    const navigate = useNavigate();
    const { getCookie, logout } = useContext(AuthContext); 

    const username = getCookie('username'); 
    const rank = 'Operador';

    const [verifyRef, setVerifyRef] = useState(false); 

    return (
        <div>

            
            <div className = 'sidebar'>
                
                <img src = '/cinia_logo (1).png' alt = 'Logo' className = 'cinia-logo'/> 
                <div className = 'sidebar-options'> 
                
                    <p className = 'sidebar-option' onClick = { () => navigate('/operador') }> Cursos </p>
                    <p className = 'sidebar-option' onClick = { () => navigate('/contactos') }> Contactos </p>
                    <p className = 'sidebar-option' id = 'selected-page'> Preguntas frecuentes </p>
                    
                </div>

                <div className = 'profile-details'>
                    <div className = 'credentials'> 
                        <p className = 'username' > { username } </p>
                        <p className = 'rank'> { rank } </p>
                    </div>

                    <button className = 'logout' onClick = { () => setVerifyRef(true)} > Cerrar sesión </button>

                </div> 
            </div>
            <div className='main-page'> 
                <div className = 'frequent-questions'>           
                    <b> ¿Cuánto tiempo dura un curso? </b> <br/> La duración es variable, depende del tema del curso.
                    <br /> <br /> <b> ¿Cuál es la calificación mínima para aprobar un curso? </b> <br /> La calificación mínima para aprobar un curso es de 8, es decir si son 5 preguntas, debes tener 4 respuestas correctas.
                    <br /> <br /> <b> ¿Qué pasa si no apruebo un curso? </b> <br /> Tienes otra oportunidad de repetir el curso, en automático la plataforma te reasigna el curso. Debes volver a ver los materiales (diapositivas, videos, PDF, etc.) para poder aprobar un curso. 
                    <br /> <br /> <b> Si tengo dudas de un curso, ¿a quién puedo contactar? </b> <br />Puedes contactar al área de capacitación vía WhatsApp: 2226634669.
                    <br /> <br /> <b> ¿Los cursos se deben tomar en un horario fijo o puede ser en cualquier horario?</b> <br /> Los cursos pueden ser tomados en cualquier horario del día y no hay un límite de tiempo. 
                    <br /> <br /> <b> ¿Cómo sé que estoy inscrito a un curso?</b> <br /> Solo los cursos que aparecen en el inicio de la plataforma son a los que estoy inscrito.
                    <br /> <br /> <b> ¿Cómo sé si ya terminé el curso? </b> <br /> El curso aparecerá como “completado”.
                    <br /> <br /> <b> ¿Cómo sé si aprobé mi evaluación? </b> <br /> Al finalizar las preguntas y enviar las respuestas, aparece un mensaje de “aprobado”.
                    <br /> <br /> <b> ¿Puedo ingresar desde mi teléfono o debe ser solo en computadora? </b> <br /> Puedo ingresar desde cualquier dispositivo, por ejemplo: celular, computadora y Tablet.
                    <br /> <br /> <b> ¿Qué pasa si pierdo mi contraseña y/o usuario? </b> <br /> Comunicarse a soporte y/o capacitación.

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
    )

}

export default FrequentQuestions;


