import React, { useState, useContext } from 'react';
import ReactDOM from 'react-dom'; 
import { useNavigate, useParams } from 'react-router-dom';
import '../index.css';
import { AuthContext } from '../contexts/AuthContext';

function ExploreCourse(props) {
    const navigate = useNavigate();
    const params = useParams(); 
    const { getCookie, logout } = useContext(AuthContext); 

    const username = getCookie('username');
    const rank = 'Operador';

    const [retrievedUser, setRetrievedUser] = useState(false); 
    const [retrievedCourse, setRetrievedCourse] = useState(false); 
    const [userCourseInfo, setUserCourseInfo] = useState({});
    const [course, setCourse] = useState({'resources': [], 'questions': []}); 
    const [hiddenMenu, setHiddenMenu] = useState(false);
    const [answers, setAnswers] = useState();
    const [verifyRef, setVerifyRef] = useState(false);
    
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
          alert('No se retiró tu información correctamente');
          navigate('/operadores');
        }  
        
        response.user.courses.forEach(course => {
            if (course.name == params.cur_operator_course) {
                setUserCourseInfo(course);
            } 
        });
    };

    const getCourseResource = async () => {
        
        const url = 'https://jt6z2tunnora6oi6u6x37zl3cq0rgqwq.lambda-url.us-west-2.on.aws/get-course/'.concat(params.cur_operator_course);
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
        
        if ((!response.course) || (promise.status != 200)) {
          alert('No se retiró el curso correctamente');
          navigate('/operadores');
          
        }  
        
        setCourse(response.course);
        setAnswers(new Array(response.course.questions.length));
    };
    
    if (!retrievedUser) {
        getUserResource(); 
        setRetrievedUser(true);
    }

    if (!retrievedCourse) {
        getCourseResource();
        setRetrievedCourse(true);
    }

    const handleCompleteFirstStage = (event) => {

        event.preventDefault();

        const completeFirstStageResource = async () => {
            
            const promise = await fetch('https://jt6z2tunnora6oi6u6x37zl3cq0rgqwq.lambda-url.us-west-2.on.aws/complete-first-stage', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cookies': document.cookie
              }, 
              body: JSON.stringify({ 'username': username, 'coursename': course.name })
            }); 
            
            const response = await promise.json();
            
            
            if ((!response.completedStage) || (promise.status != 200)) {
              alert('No se pudo completar la etapa');
              navigate('/operador');
              
            } else {
                setRetrievedUser(false);
            }  
            
        };

        completeFirstStageResource();


    }

    const handleCompleteSecondStage = (event) => {
        event.preventDefault();
        const completeSecondStageResource = async () => {
            
            const promise = await fetch('https://jt6z2tunnora6oi6u6x37zl3cq0rgqwq.lambda-url.us-west-2.on.aws/complete-second-stage', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cookies': document.cookie
              }, 
              body: JSON.stringify({ 'username': username, 'coursename': course.name, 'answers': answers })
            }); 
            
            const response = await promise.json();
            
            if ((!response.completedStage) || (promise.status != 200)) {
                alert('Uy reprobaste este curso :(, si tienes dudas habla con tu supervisor para que te diga qué puedes hacer');
            } else {
                alert('¡Felicidades! tienes todo lo que se necesita ;)');
            }  

            navigate('/operador');
            
        };

        completeSecondStageResource();


    }

    const handleChangeOption = (question, option) => {
        const instances = [...answers];
        instances[question] = option 

        setAnswers(instances);
    }

    return (
        <div>
            <div className = 'sidebar'>
                
                <img src = '/cinia_logo (1).png' alt = 'Logo' className = 'cinia-logo'/> 

                <div className = 'sidebar-options'> 
                    <p className = 'sidebar-option' onClick = { () => navigate('/operador') }> Cursos </p>
                    <p className = 'sidebar-option' id = 'selected-page'> {  params.cur_operator_course } </p>
              
                </div>

                <div className = 'profile-details'>
                    <div className = 'credentials'> 
                        <p className = 'username' > { username } </p>
                        <p className = 'rank'> { rank } </p>
                        <p className = 'hide-menu' onClick = { () => setHiddenMenu(!hiddenMenu) }> Ocultar/poner menú </p>
                    </div>

                    <button className = 'logout' onClick = { () => setVerifyRef(true)} > Cerrar sesión </button>

                </div> 
            </div>

            <div className = 'main-page' id = 'course-explore-page'>
                
                {
                    !userCourseInfo.stage1 
                    ? 
                    <div className = 'stage1-info'> 
                        <h5 className = 'course-header'> Recursos </h5>
                        
                        <p className = 'course-description'> {  course.descriptionStage1 }</p>
                        <div className = 'course-resources'> 
                            {
                                course.resources.map((resource, cur_resource) => {
                                    return (
                                        <a className = 'course-resource' href = { resource } target = '_blank'> 
                                            Material { cur_resource + 1 }
                                        </a>
                                    )
                                })
                            }
                        </div>
                        
                        <div className = { !hiddenMenu ? 'corner-popup-aid' : 'display-false' }>

                            <div className = 'corner-popup'> 
                                <p className = 'stage-button-info' onClick = { (event) => handleCompleteFirstStage(event) }> Hacer evaluación </p>
                            </div> 

                        </div>
                    </div>
                    :
                    <div className = 'stage2-info'> 
                        <h5 className = 'course-header'> Evaluación </h5>
                        <p className = 'course-description'> { course.descriptionStage2 } </p>
                        <form className = 'course-evaluation' onSubmit = { (event) => handleCompleteSecondStage(event) }>
                            {
                                course.questions.map(question => {
                                    return (
                                        <form>
                                            
                                            <label> <b> { question.name } </b> </label>
                                            <div className = 'radio-option'>
                                                <input name = 'level' type="radio" required onChange = { () => handleChangeOption(course.questions.indexOf(question), 1)}/>
                                                <label > { question.option1 }</label>   
                                            </div> 
                                            <div className = 'radio-option'>
                                                <input name = 'level' type="radio" required onChange = { () => handleChangeOption(course.questions.indexOf(question), 2)}/>
                                                <label > { question.option2 }</label>
                                            </div> 
                                            <div className = 'radio-option'>
                                                <input name = 'level' type="radio" required onChange = { () => handleChangeOption(course.questions.indexOf(question), 3)}/>
                                                <label > { question.option3 } </label>
                                            </div> 
                                            <div className = 'radio-option'>
                                                <input name = 'level' type="radio" required onChange = { () => handleChangeOption(course.questions.indexOf(question), 4)}/>
                                                <label > { question.option4 } </label>
                                            </div> 
                                            <br />

                                            
                                        </form>
                                    )
                                }) 
                            }

                            
                            <button className = 'submit-form' id = 'submit-course' type = 'submit'> Completar curso </button>
                            
                        </form>
                        
                    </div>
                }

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

export default ExploreCourse;