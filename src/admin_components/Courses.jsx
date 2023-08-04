import React, { useState, useContext } from 'react';
import ReactDOM from 'react-dom'; 
import '../index.css';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext'; 

function Courses(props) {

    const navigate = useNavigate();

    const { getCookie, logout } = useContext(AuthContext); 
    const username = getCookie('username'); 
    const rank = 'Admin.';

    const [courses, setCourses] = useState([]);
    const [retrievedCourses, setRetrievedCourses] = useState(false);
    const [addCourseForm, setAddCourseForm] = useState(false);
    const [name, setName] = useState();
    const [area, setArea] = useState();
    const [resources, setResources] = useState([0]);
    const [questions, setQuestions] = useState([{'correct': []}]);
    const [threshold, setThreshold] = useState();
    const [descriptionStage1, setDescriptionStage1] = useState();
    const [descriptionStage2, setDescriptionStage2] = useState();
    const [job, setJob] = useState('');
    const [group, setGroup] = useState('');
    const [verifyRef, setVerifyRef] = useState(false); 
    const [deletedCourse, setDeletedCourse] = useState(); 
    const [reassignedCourse, setReassignedCourse] = useState();
    const [clickedLogout, setClickedLogout] = useState(false);
    const [search, setSearch] = useState();
    const [editCourseForm, setEditCourseForm] = useState(false);
    const [prevName, setPrevName] = useState('');
    const [courseFilter, setCourseFilter] = useState();

    const getCoursesResource = async () => {
        
        if (retrievedCourses) {  
          return;
        }
    
        const promise = await fetch('https://4n2uwcxavgyd66gnq2ltzvlfne0nusvp.lambda-url.us-west-2.on.aws/get-courses', { 
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
          alert('No se recuperaron los cursos adecuadamente');
          return;
        } 
    
        const response = await promise.json();
      
        setCourses(response.courses);
    };  

    if (!retrievedCourses) {
        getCoursesResource();
        setRetrievedCourses(true);
    }

    const handleChangeResource = (index, value) => {
        var instances = [...resources]; 
        instances[index] = value;
        setResources(instances);
    }

    const handleChangeQuestion = (index, property, value) => {
        var instances = [...questions]; 
        instances[index][property] = value 
        setQuestions(instances);
    }

    const handleAddCorrect = (index, option) => {
        var instances = [...questions]; 
        if (instances[index]['correct'].includes(option)) {
            instances[index]['correct'] = instances[index]['correct'].filter(opt => opt != option);
        } else {
            instances[index]['correct'].push(option);
        }

        setQuestions(instances);

    }

    const handleAddCourse = (event) => {
        event.preventDefault();

        if (threshold <= 0 || threshold > 10) {
            alert('La calificación tiene que estar entre 1 y 10');
        }

        const properties = { 'name': name.trimEnd(), 'area': area, 'descriptionStage1': descriptionStage1, 'descriptionStage2': descriptionStage2, 'resources': resources, 'questions': questions, 'threshold': threshold, 'job': job, 'group': group};
        const addCourseResource = async () => {
            const promise = await fetch('https://4n2uwcxavgyd66gnq2ltzvlfne0nusvp.lambda-url.us-west-2.on.aws/add-course', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cookies': document.cookie              
              },
              body: JSON.stringify(properties)
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

            if ((promise.status !== 200) || (!response.addedCourse)) {
                alert('No se añadió adecuadamente. Es probable que tengas que escoger otro nombre para el curso.');
                return;
            } else {
                setRetrievedCourses(false);
            }
            
        };

        addCourseResource(); 

        setAddCourseForm(false);
    }

    const handleRemoveCourse = () => {
        const deleteCourseResource = async () => {
            const promise = await fetch('https://4n2uwcxavgyd66gnq2ltzvlfne0nusvp.lambda-url.us-west-2.on.aws/delete-course', {
              method: 'DELETE',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cookies': document.cookie
              },
              body: JSON.stringify(deletedCourse)
            });
      
            
            const response = await promise.json(); 
            
            if (promise.status == 429) {
                alert('Demasiadas solicitudes, espera un poco');
                return;
            }

            if ((promise.status != 200) || (!response.deletedCourse)) {
                alert('No se eliminó correctamente');
                return;
            } else {
                setRetrievedCourses(false);
            }
            
      
        };
      
        deleteCourseResource();
    }

    const handleEditCourse = (event) => {
        event.preventDefault(); 
        const properties = { 'name': name.trimEnd(), 'prevName': prevName.trimEnd(), 'area': area, 'descriptionStage1': descriptionStage1, 'descriptionStage2': descriptionStage2, 'resources': resources, 'questions': questions, 'threshold': threshold, 'job': job, 'group': group};
        console.log(properties);

        if (threshold <= 0 || threshold > 10) {
            alert('La calificación tiene que estar entre 1 y 10');
        }

        const changeCourseResource = async () => {
            const promise = await fetch('https://4n2uwcxavgyd66gnq2ltzvlfne0nusvp.lambda-url.us-west-2.on.aws/change-course', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cookies': document.cookie              
              },
              body: JSON.stringify(properties)
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

            if ((promise.status !== 200) || (!response.changedCourse)) {
                alert('No se cambió adecuadamente. Es probable que tengas que escoger otro nombre para el curso.');
                return;
            } else {
                setRetrievedCourses(false);
            }
            
        };

        changeCourseResource(); 

        setEditCourseForm(false);
    }

    const handleReassignCourse = () => {
        const reassignCourseResource = async () => {
            const promise = await fetch('https://4n2uwcxavgyd66gnq2ltzvlfne0nusvp.lambda-url.us-west-2.on.aws/reassign-course', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cookies': document.cookie
              },
              body: JSON.stringify(reassignedCourse)
            });
      
            
            const response = await promise.json(); 
            
            if (promise.status == 429) {
                alert('Demasiadas solicitudes, espera un poco');
                return;
            }

            if ((promise.status != 200) || (!response.reassignedCourse)) {
                alert('No se actualizó correctamente');
                return;
            } else {
                setRetrievedCourses(false);
            }
            
      
        };
      
        reassignCourseResource();
    }

    const handleVerifyConfirm = () => {
        if (deletedCourse) {
            handleRemoveCourse();
            setDeletedCourse();
        } else if (reassignedCourse) {
            handleReassignCourse();
            setReassignedCourse();
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
                    <p className = 'sidebar-option' id = 'selected-page'> Cursos </p>
                    <p className = 'sidebar-option' onClick = { () => navigate('/contactos') }> Contactos y Mensajes </p>
                </div>

                <div className = 'profile-details'>
                    <div className = 'credentials'> 
                        <p className = 'username' > { username } </p>
                        <p className = 'rank'> { rank } </p>
                    </div>

                    <button className = 'logout' onClick = { () => { setVerifyRef(true); setClickedLogout(true) }} > Cerrar sesión </button>

                </div> 
            </div>

            <div className = 'main-page'>
                
                <div className = 'search-box' id = 'search-filter'>
                    <input type = 'text' placeholder = 'Escriba el nombre del curso' onChange = { (e) => setSearch(e.target.value) } />
                    <img src = '/search_button.png' className = 'search-button' /> 
                    
                    <select class="select-css" onChange = {(e) => setCourseFilter(e.target.value)}>
                        <option value = "">Todos</option>
                        <option value = 'Jardineria'>Jardinería</option>
                        <option value = "Limpieza">Limpieza</option>
                        <option value = "Textil">Textil</option>
                        <option value = "Acondi.">Acondicionamiento</option>
                        <option value = "Automocion" >Automoción</option>
                        <option value = "Administra." >Administrativo</option>
                    </select>
                    
                    
                    <p className = 'add-popup-form' onClick = { () => setAddCourseForm(true) }> Añadir <br /> Curso </p>
                </div>

                <div className = 'course-instance'>
                    <p className = 'instance-attribute-header'> Nombre </p>
                    <p className = 'instance-attribute-header'> Area </p>
                    <p className = 'instance-attribute-header'> Calif. min. </p>
                    <p className = 'instance-attribute-header'> Fecha de creación </p>
                    <p className = 'instance-attribute-header'> Reasignar curso </p>
                    
                </div>

                <div className = 'access-retrieval'> 
                    {
                        courses.length === 0 
                        ?
                        <div className = 'message-no-data'> 
                            No hay cursos disponibles
                        </div> 

                        : courses.map(course => {
                            
                            if ((!search || course.name.toLowerCase().includes(search.toLowerCase())) && ((!courseFilter) || (courseFilter == course.area))) {
                                return (
                                    <div key = { course._id.$oid } className = 'course-instance'> 
                                        <p className = 'instance-attribute' id = 'name-attribute' onClick = { () => navigate('/curso/'.concat(course.name)) }> { course.name } </p>
                                        <p className = 'instance-attribute'> { course.area } </p>
                                        <p className = 'instance-attribute' id = 'threshold-attribute'> { course.threshold } </p>
                                        <p className = 'instance-attribute'> { course.date } </p>
                                        <img id = 'trash-button-courses' className = 'trash-button-user' src = '/refresh_button.png' alt = 'Refresh button' onClick = { () => { setVerifyRef(true); setReassignedCourse(prevState => ({ ...prevState, name : course.name, area: course.area, job: course.job })) } } />
                                        <img className = 'edit-button-message-1' src = '/edit_button.png' onClick = { () => { setEditCourseForm(true); setPrevName(course.name); setName(course.name); setArea(course.area); setThreshold(course.threshold); setDescriptionStage1(course.descriptionStage1); setDescriptionStage2(course.descriptionStage2); setResources(course.resources); setQuestions(course.questions); setJob(course.job); setGroup(course.group);} }/>
                                        <img className = 'trash-button-user' src = '/trash_button.png' alt = 'Trash button' onClick = { () => { setVerifyRef(true); setDeletedCourse(prevState => ({ ...prevState, name : course.name, area: course.area, job: course.job })) } } /> 
                                    </div>
                                )
                            }
                        })
                    }
                </div>

            </div>

            <div className = { addCourseForm ? 'pop-up-form' : 'display-false' }> 
               
                <div className = 'title-close-form'>
                    <h5 className = 'form-title'> 
                        Añadir Curso 
                    </h5>
                    <img onClick = { () => setAddCourseForm(false) } className = 'close-pop-up-form' src = '/close_button.png' />
                    
                </div>

                <form class = 'add-whatever-form'>
                    <label className = 'form-label'> Nombre </label>
                    <br/>
                    <input className = 'input-field-add' type="text" placeholder = 'Escriba el nombre del curso' required onChange = { (e) => setName(e.target.value)}/> 
                    <br/>
                    <br />
                    <label className = 'form-label'> Calificación mínima </label>
                    <br/>
                    <input className = 'input-field-add' type="text" placeholder = 'Escriba un número entre 1 y 10' required onChange = { (e) => setThreshold(e.target.value)}/> 
                    <br/>
                    <br />
                    <label className = 'form-label'> Área </label>
                    <br/>
                    <div>
                        <div className = 'radio-option'>
                            <input name = 'level' type="radio" 
                                    required onChange = { () => setArea('Jardineria') }/>
                            <label>Jardinería</label>
                        </div>

                        <div className = 'radio-option'>
                            <input name = 'level' type="radio" required onChange = { () => setArea('Limpieza') }/>
                            <label >Limpieza</label>
                        </div> 
                        <div className = 'radio-option'>
                            <input name = 'level' type="radio" required onChange = { () => setArea('Textil') }/>
                            <label >Textil</label>
                        </div> 
                        <div className = 'radio-option'>
                            <input name = 'level' type="radio" required onChange = { () => setArea('Acondi.') }/>
                            <label >Acondicionamiento</label>
                        </div> 
                        <div className = 'radio-option'>
                            <input name = 'level' type="radio" required onChange = { () => setArea('Automocion') }/>
                            <label >Automoción</label>
                        </div> 
                        <div className = 'radio-option'>
                            <input name = 'level' type="radio" required onChange = { () => setArea('Administra.') }/>
                            <label >Administrativo</label>
                        </div> 
                        <div className = 'radio-option'>
                            <input name = 'level' type="radio" required onChange = { () => setArea('General') }/>
                            <label >General</label>
                        </div> 
                    </div>
                    <br />
                    <label className = 'form-label'> Grupo </label>
                    <br/>
                    <input className = 'input-field-add' type="text" placeholder = 'Escriba la descripción' onChange = { (e) => setGroup(e.target.value) }/> 
                    <br/>
                    <br />
                    <label className = 'form-label'> Puesto </label>
                    <br/>
                    <input className = 'input-field-add' type="text" placeholder = 'Escriba la descripción' onChange = { (e) => setJob(e.target.value) }/> 
                    <br/>
                    <br />
                    <label className = 'form-label'> Instrucciones de Capacitación </label>
                    <br/>
                    <input className = 'input-field-add' type="text" placeholder = 'Escriba la descripción' required onChange = { (e) => setDescriptionStage1(e.target.value) }/> 
                    <br/>
                    {
                        resources.map(resource => { 
                            return (
                            <div>
                                <br />
                                <label className = 'form-label'> Recurso { resources.indexOf(resource) + 1 } </label>
                                <br/>
                                <input className = 'input-field-add' type="text" placeholder = 'Escriba el link del recurso' required onChange = { (e) => handleChangeResource(resources.indexOf(resource), e.target.value) }/> 
                                <br/>
                            </div> 
                        )})
                    }
                    <div className = 'course-adjustment'>
                        <button className = 'course-change' onClick = { () => setResources(resources => [...resources, resources.length]) }> MÁS </button>
                        <button className = 'course-change' onClick = { () => setResources(resources.slice(0, -1)) }> QUITAR </button>
                    </div>
                    <br />
                    <label className = 'form-label'> Instrucciones de Evaluación </label>
                    <br/>
                    <input className = 'input-field-add' type="text" placeholder = 'Escriba la descripción' required onChange = { (e) => setDescriptionStage2(e.target.value) }/> 
                    <br/>
                    {
                        questions.map(question => {
                            return (
                            <div>
                                <br />
                               <label className = 'form-label'> Pregunta { questions.indexOf(question) + 1 }</label>
                                <br/>
                                <input className = 'input-field-add' type="text" placeholder = 'Escriba la pregunta' required  onChange = { (e) => handleChangeQuestion(questions.indexOf(question), 'name', e.target.value) } /> 
                                <br/>
                                <br /> 
                                <label className = 'form-label'> Opciones </label>
                                <br/>
                                <input className = 'input-field-add' type="text" placeholder = 'Opción 1' required onChange = { (e) => handleChangeQuestion(questions.indexOf(question), 'option1', e.target.value) }/> 
                                <br/> 
                                <input className = 'input-field-add' type="text" placeholder = 'Opción 2' required onChange = { (e) => handleChangeQuestion(questions.indexOf(question), 'option2', e.target.value) }/> 
                                <br/> 
                                <input className = 'input-field-add' type="text" placeholder = 'Opción 3' required onChange = { (e) => handleChangeQuestion(questions.indexOf(question), 'option3', e.target.value) }/>
                                <br/> 
                                <input className = 'input-field-add' type="text" placeholder = 'Opción 4' required onChange = { (e) => handleChangeQuestion(questions.indexOf(question), 'option4', e.target.value) }/>
                                <br />
                                <br />
                                <label className = 'form-label'> Opción correcta </label>
                                <form>
                                    <div className = 'radio-option'>
                                        <input name = 'level' type="checkbox" 
                                                required onChange = { () => handleAddCorrect(questions.indexOf(question), 1) }/>
                                        <label>1</label>
                                    </div>

                                    <div className = 'radio-option'>
                                        <input name = 'level' type="checkbox" required onChange = { () => handleAddCorrect(questions.indexOf(question), 2) }/>
                                        <label >2</label>
                                    </div> 
                                    <div className = 'radio-option'>
                                        <input name = 'level' type="checkbox" required onChange = { () => handleAddCorrect(questions.indexOf(question), 3) }/>
                                        <label >3</label>
                                    </div> 
                                    <div className = 'radio-option'>
                                        <input name = 'level' type="checkbox" required onChange = { () => handleAddCorrect(questions.indexOf(question), 4) }/>
                                        <label >4</label>
                                    </div> 
                                </form>

                            </div>
                            )
                        })
                    }

                    <div className = 'course-adjustment'>
                        <button className = 'course-change' onClick = { () => setQuestions(questions => [...questions, {'correct': []}]) }> MÁS </button>
                        <button className = 'course-change' onClick = { () => setQuestions(questions.slice(0, -1)) }> QUITAR </button>
                    </div>

                    <button type = 'submit' className = 'submit-form' onClick = { (event) => handleAddCourse(event) }> AÑADIR </button>
                
                </form>

            </div>

            <div className = { editCourseForm ? 'pop-up-form' : 'display-false' }> 
               
                <div className = 'title-close-form'>
                    <h5 className = 'form-title'> 
                        Editar Curso 
                    </h5>
                    <img onClick = { () => setEditCourseForm(false) } className = 'close-pop-up-form' src = '/close_button.png' />
                    
                </div>

                <form class = 'add-whatever-form'>
                    <label className = 'form-label'> Nombre </label>
                    <br/>
                    <input className = 'input-field-add' type="text" value = { name } placeholder = 'Escriba el nombre del curso' required onChange = { (e) => setName(e.target.value)}/> 
                    <br/>
                    <br />
                    <label className = 'form-label'> Calificación mínima </label>
                    <br/>
                    <input className = 'input-field-add' type="text" value = { threshold} placeholder = 'Escriba un número entre 1 y 10' required onChange = { (e) => setThreshold(e.target.value)}/> 
                    <br/>
                    <br />
                    <label className = 'form-label'> Área </label>
                    <br/>
                    <div>
                        <div className = 'radio-option'>
                            <input checked = { area == "Jardineria" } name = 'level' type="radio" 
                                    required onChange = { () => setArea('Jardineria') }/>
                            <label>Jardinería</label>
                        </div>

                        <div className = 'radio-option'>
                            <input checked = { area == "Limpieza" } name = 'level' type="radio" required onChange = { () => setArea('Limpieza') }/>
                            <label >Limpieza</label>
                        </div> 
                        <div className = 'radio-option'>
                            <input checked = { area == "Textil" } name = 'level' type="radio" required onChange = { () => setArea('Textil') }/>
                            <label >Textil</label>
                        </div> 
                        <div className = 'radio-option'>
                            <input checked = { area == "Acondi." } name = 'level' type="radio" required onChange = { () => setArea('Acondi.') }/>
                            <label >Acondicionamiento</label>
                        </div> 
                        <div className = 'radio-option'>
                            <input checked = { area == "Automocion" } name = 'level' type="radio" required onChange = { () => setArea('Automocion') }/>
                            <label >Automoción</label>
                        </div> 
                        <div className = 'radio-option'>
                            <input checked = { area == "Administra." } name = 'level' type="radio" required onChange = { () => setArea('Administra.') }/>
                            <label >Administrativo</label>
                        </div> 
                        <div className = 'radio-option'>
                            <input checked = { area == "General" } name = 'level' type="radio" required onChange = { () => setArea('General') }/>
                            <label >General</label>
                        </div> 
                    </div>
                    
                    <br />
                    <label className = 'form-label'> Grupo </label>
                    <br/>
                    <input className = 'input-field-add' type="text" value = { group } placeholder = 'Escriba la descripción' onChange = { (e) => setGroup(e.target.value) }/> 
                    <br/>
                    <br />
                    <label className = 'form-label'> Puesto </label>
                    <br/>
                    <input className = 'input-field-add' type="text" value = { job } placeholder = 'Escriba la descripción' onChange = { (e) => setJob(e.target.value) }/> 
                    <br/>
                    <br />
                    <label className = 'form-label'> Instrucciones de Capacitación </label>
                    <br/>
                    <input className = 'input-field-add' type="text" value = {  descriptionStage1 } placeholder = 'Escriba la descripción' required onChange = { (e) => setDescriptionStage1(e.target.value) }/> 
                    <br/>
                    {
                        resources.map(resource => { 
                            return (
                            <div>
                                <br />
                                <label className = 'form-label'> Recurso { resources.indexOf(resource) + 1 } </label>
                                <br/>
                                <input className = 'input-field-add' type="text" value = { resource } placeholder = 'Escriba el link del recurso' required onChange = { (e) => handleChangeResource(resources.indexOf(resource), e.target.value) }/> 
                                <br/>
                            </div> 
                        )})
                    }
                    <div className = 'course-adjustment'>
                        <button className = 'course-change' onClick = { () => setResources(resources => [...resources, resources.length]) }> MÁS </button>
                        <button className = 'course-change' onClick = { () => setResources(resources.slice(0, -1)) }> QUITAR </button>
                    </div>
                    <br />
                    <label className = 'form-label'> Instrucciones de Evaluación </label>
                    <br/>
                    <input className = 'input-field-add' type="text" value = { descriptionStage2 } placeholder = 'Escriba la descripción' required onChange = { (e) => setDescriptionStage2(e.target.value) }/> 
                    <br/>
                    {
                        questions.map(question => {
                            return (
                            <div>
                                <br />
                               <label className = 'form-label'> Pregunta { questions.indexOf(question) + 1 }</label>
                                <br/>
                                <input className = 'input-field-add' type="text" value = { question.name } placeholder = 'Escriba la pregunta' required  onChange = { (e) => handleChangeQuestion(questions.indexOf(question), 'name', e.target.value) } /> 
                                <br/>
                                <br /> 
                                <label className = 'form-label'> Opciones </label>
                                <br/>
                                <input className = 'input-field-add' type="text" value = { question.option1 } placeholder = 'Opción 1' required onChange = { (e) => handleChangeQuestion(questions.indexOf(question), 'option1', e.target.value) }/> 
                                <br/> 
                                <input className = 'input-field-add' type="text" value = { question.option2 } placeholder = 'Opción 2' required onChange = { (e) => handleChangeQuestion(questions.indexOf(question), 'option2', e.target.value) }/> 
                                <br/> 
                                <input className = 'input-field-add' type="text" value = { question.option3 }placeholder = 'Opción 3' required onChange = { (e) => handleChangeQuestion(questions.indexOf(question), 'option3', e.target.value) }/>
                                <br/> 
                                <input className = 'input-field-add' type="text" value = { question.option4 }placeholder = 'Opción 4' required onChange = { (e) => handleChangeQuestion(questions.indexOf(question), 'option4', e.target.value) }/>
                                <br />
                                <br />
                                <label className = 'form-label'> Opción correcta </label>
                                <form>
                                    <div className = 'radio-option'>
                                        <input name = 'level' type="checkbox" 
                                                required onChange = { () => handleAddCorrect(questions.indexOf(question), 1) }/>
                                        <label>1</label>
                                    </div>

                                    <div className = 'radio-option'>
                                        <input name = 'level' type="checkbox" required onChange = { () => handleAddCorrect(questions.indexOf(question), 2) }/>
                                        <label >2</label>
                                    </div> 
                                    <div className = 'radio-option'>
                                        <input name = 'level' type="checkbox" required onChange = { () => handleAddCorrect(questions.indexOf(question), 3) }/>
                                        <label >3</label>
                                    </div> 
                                    <div className = 'radio-option'>
                                        <input name = 'level' type="checkbox" required onChange = { () => handleAddCorrect(questions.indexOf(question), 4) }/>
                                        <label >4</label>
                                    </div> 
                                </form>

                            </div>
                            )
                        })
                    }

                    <div className = 'course-adjustment'>
                        <button className = 'course-change' onClick = { () => setQuestions(questions => [...questions, {'correct': []}]) }> MÁS </button>
                        <button className = 'course-change' onClick = { () => setQuestions(questions.slice(0, -1)) }> QUITAR </button>
                    </div>

                    <button type = 'submit' className = 'submit-form' onClick = { (event) => handleEditCourse(event) }> EDITAR </button>
                
                </form>

            </div>

            <div className = { verifyRef ? 'verify-button' : 'display-false' } >
                <h5> No puedes deshacer esta acción </h5> 

                <div className = 'verifying-buttons'>
                    <button id = 'verify-yes' onClick = { () => handleVerifyConfirm() }>
                        SÍ
                    </button>

                    <button id = 'verify-no' onClick = { () => { setVerifyRef(false); setDeletedCourse(); setReassignedCourse(); setClickedLogout(false) } }>
                        CANCELAR 
                    </button>
            
                </div>
            </div>
        </div>
    );
}

export default Courses;