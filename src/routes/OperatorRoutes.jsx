import React, { useContext } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import CourseFeed from '../operator_components/CourseFeed';
import ExploreCourse from '../operator_components/ExploreCourse';
import ContactFeed from '../operator_components/ContactFeed.jsx';
import FrequentQuestions from '../operator_components/FrequentQuestions.jsx';

function AdminRoutes(props) {
  // const { token, renderModifyUsers } = useContext(TokenContext);


  return (
    
    <Router> 
      <Routes>
        
        <Route path = '/operador' element = { <CourseFeed /> } />
        <Route path = '/operador/:cur_operator_course' element = { <ExploreCourse /> } />
        <Route path = '/contactos' element = { <ContactFeed /> } />
        <Route path = '/preguntasfrecuentes' element = { <FrequentQuestions /> } />
        <Route path = '*' element = { <Navigate to = '/operador' /> }/>

      </Routes>
    </Router>
  );
  
}

export default AdminRoutes;