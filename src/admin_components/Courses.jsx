import React, { useState } from 'react';
import ReactDOM from 'react-dom'; 
import '../index.css';
import { useNavigate, useParams } from 'react-router-dom';

function Courses(props) {

    const navigate = useNavigate();
    const username = 'Mateo Caso';
    const rank = 'Admin.';
    const [courses, setCourses] = useState([]);
    const [retrievedCourses, setRetrievedCourses] = useState(false);
    const [hiddenChanges, setHiddenChanges] = useState(false);
    const [addCourseForm, setAddCourseForm] = useState(false);
    const [name, setName] = useState();
    const [area, setArea] = useState();
    const [resources, setResources] = useState([0]);
    const [questions, setQuestions] = useState([{'correct': []}]);
    const [verifyRef, setVerifyRef] = useState(false); 
    const [deletedCourse, setDeletedCourse] = useState({}); 

    const getCoursesResource = async () => {
        
        if (retrievedCourses) {  
          return;
        }
    
        const promise = await fetch('http://127.0.0.1:8000/get-courses', { 
          method: 'GET',
          credentials: 'include'
        }); 
        
        if (promise.status !== 200) {
          alert('Failed to retrieve courses');
        } 
    
        const response = await promise.json();
      
        setCourses(response.courses);
        console.log(response.courses);
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
        const properties = { 'name': name, 'area': area, 'resources': resources, 'questions': questions };
        const addCourseResource = async () => {
            const promise = await fetch('http://127.0.0.1:8000/add-course', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(properties)
            });
      
            
            const response = await promise.json(); 

            if ((promise.status !== 200) || (!response.addedCourse)) {
                alert('Not properly added');
            } else {
                console.log('Successfully added course');
            }
            
      
        };

        addCourseResource(); 
    }

    const handleRemoveCourse = (name, area) => {
        const deleteCourseResource = async () => {
            const promise = await fetch('http://127.0.0.1:8000/delete-course', {
              method: 'DELETE',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(deletedCourse)
            });
      
            
            const response = await promise.json(); 

            if ((promise.status != 200) || (!response.deletedCourse)) {
                alert('Not properly removed');
            } else {
                setRetrievedCourses(false);
            }
            
      
        };
      
        deleteCourseResource();
    }

    const handleVerifyConfirm = () => {
        if (deletedCourse) {
            handleRemoveCourse(deletedCourse);
            setDeletedCourse({});
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
                
                <div className = 'course-instance'>
                    <p className = 'instance-attribute-header'> Nombre </p>
                    <p className = 'instance-attribute-header'> Area </p>
                    <p className = 'instance-attribute-header'> Fecha de creación </p>
                    
                </div>

                <div className = 'access-retrieval'> 
                    {
                        courses.length === 0 
                        ?
                        <div className = 'message-no-data'> 
                            No hay cursos disponibles
                        </div> 

                        : courses.map(course => {
                            
                            return (
                                <div key = { course._id.$oid } className = 'course-instance'> 
                                    <p className = 'instance-attribute' onClick = { () => navigate('/curso/'.concat(course._id.$oid)) }> { course.name } </p>
                                    <p className = 'instance-attribute'> { course.area } </p>
                                    <p className = 'instance-attribute'> { course.date } </p>
    
                                    <img className = 'trash-button-user' src = '/trash_button.png' alt = 'Trash button' onClick = { () => { setVerifyRef(true); setDeletedCourse(prevState => ({ ...prevState, name : course.name, area: course.area })) } } /> 
                                </div>
                            )
                        })
                    }
                </div>

            </div>

            <div className = { !hiddenChanges ? 'change-instances' : 'display-false' }>

                <div className = 'add-instance'> 
                    <p onClick = { () => setAddCourseForm(true) }> AÑADIR <br /> CURSO </p>
                </div> 

            </div>

            <div className = { addCourseForm ? 'pop-up-form' : 'display-false' }> 
               
                <div className = 'title-close-form'>
                    <h5 className = 'form-title'> 
                        Añadir Curso 
                    </h5>
                    <img onClick = { () => setAddCourseForm(false) } className = 'close-pop-up-form' src = '/close_button.png' />
                    
                </div>

                <form>
                    <label className = 'form-label'> Nombre </label>
                    <br/>
                    <input className = 'input-field-add' type="text" placeholder = 'Escriba el nombre del curso' required onChange = { (e) => setName(e.target.value)}/> 
                    <br/>
                    <br />
                    
                    <label className = 'form-label'> Área </label>
                    <br/>
                    <form>
                        <div className = 'radio-option'>
                            <input name = 'level' type="radio" 
                                    required onChange = { () => setArea('Jardinería') }/>
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
                            <input name = 'level' type="radio" required onChange = { () => setArea('Automoción') }/>
                            <label >Automoción</label>
                        </div> 
                    </form>
                    <br />
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

            <div className = { verifyRef ? 'verify-button' : 'display-false' } >
                <h5> No puedes deshacer esta acción </h5> 

                <div className = 'verifying-buttons'>
                    <button id = 'verify-yes' onClick = { () => handleVerifyConfirm() }>
                        SÍ
                    </button>

                    <button id = 'verify-no' onClick = { () => { setVerifyRef(false); setDeletedCourse({}) } }>
                        CANCELAR 
                    </button>
            
                </div>
            </div>
        </div>
    );
}

export default Courses;