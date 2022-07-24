import React, { useState, useContext } from 'react';
import ReactDOM from 'react-dom'; 
import { Chart, Tooltip, Title, ArcElement, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useNavigate, useParams } from 'react-router-dom';
import '../index.css';
import { AuthContext } from '../contexts/AuthContext'; 

Chart.register(
  Tooltip, Title, ArcElement, Legend
);

function Course(props) {
    const navigate = useNavigate();
    const params = useParams(); 

    const { getCookie, logout } = useContext(AuthContext); 
    const username = getCookie('username'); 
    const rank = 'Admin.';

    const colors = ['#bef5b0', '#d1837b'];
    const categories_stage1 = ['Competó capacitación', 'No lo ha hecho'];
    const categories_stage2 = ['Aprobados', 'No aprobados']; 

    const [quantitiesStage1, setQuantitiesStage1] = useState([0, 0]); 
    const [quantitiesStage2, setQuantitiesStage2] = useState([0, 0]);
    const [showStage, setShowStage] = useState(false);
    const [retrievedSummaries, setRetrievedSummaries] = useState(false);
    const [verifyRef, setVerifyRef] = useState(false); 

    const getFirstStageSummary = async () => {
        
        const url = 'http://127.0.0.1:8000/summary-first-stage/'.concat(params.cur_course);
        const promise = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }); 
        
        const response = await promise.json();
        
        if (promise.status != 200) {
          alert('No se pudieron cargar las estadísticas');    
          navigate('/cursos');
        }  
        
        const quantities_stage = [response.completed, response.total - response.completed]; 
        console.log(response);
        setQuantitiesStage1(quantities_stage);
    };

    const getSecondStageSummary = async () => {
        
        const url = 'http://127.0.0.1:8000/summary-second-stage/'.concat(params.cur_course);
        const promise = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }); 
        
        const response = await promise.json();
        
        if (promise.status != 200) {
          alert('No se pudieron cargar las estadísticas');  
          navigate('/cursos');  
        }  
        console.log(response);
        const quantities_stage = [response.completed, response.total - response.completed]; 
        setQuantitiesStage2(quantities_stage);
 
    };

    if (!retrievedSummaries) {
        getFirstStageSummary(); 
        getSecondStageSummary();
        setRetrievedSummaries(true);
    }

    return (
        <div> 
            <div className = 'sidebar'>
                
                <img src = '/cinia_logo (1).png' alt = 'Logo' className = 'cinia-logo'/> 

                <div className = 'sidebar-options'> 
                    <p className = 'sidebar-option' onClick = { () => navigate('/cursos') }> Cursos </p>
                    <p className = 'sidebar-option' id = 'selected-page'> {  params.cur_course } </p>
              
                </div>

                <div className = 'profile-details'>
                    <div className = 'credentials'> 
                        <p className = 'username' > { username } </p>
                        <p className = 'rank'> { rank } </p>
                        <p className = 'switch-stage' onClick = { () => setShowStage(!showStage) }> Cambiar a etapa de { !showStage ? 'Evaluación' : 'Capacitación' }</p>
                    </div>

                    <button className = 'logout' onClick = { () => setVerifyRef(true) } > Cerrar sesión </button>

                </div> 
            </div>

            <div className = 'main-page'>

                {
                  (quantitiesStage1[0] + quantitiesStage1[1] == 0)
                  &&
                  <div className = 'message-no-data'> No hay estadísticas para este curso</div>

                }

                { 
                    (quantitiesStage1[0]  + quantitiesStage1[1] != 0) 
                    && 
                    (!showStage 
                    ?
                    <div className = 'pie-chart' >
                        <Pie data = { { datasets: [{ data: quantitiesStage1, backgroundColor: colors }], labels: categories_stage1, }} />
                    </div>
                    :
                    <div className = 'pie-chart' >
                        <Pie data = { { datasets: [{ data: quantitiesStage2, backgroundColor: colors }], labels: categories_stage2, }} />
                    </div>
                    )
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

export default Course;