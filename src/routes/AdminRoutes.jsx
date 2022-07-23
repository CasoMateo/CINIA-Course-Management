import React, { useContext } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import Users from '../admin_components/Users';
import User from '../admin_components/User';
import Courses from '../admin_components/Courses';
import Course from '../admin_components/Course';
import Contacts from '../admin_components/Contacts';

function AdminRoutes(props) {
  // const { token, renderModifyUsers } = useContext(TokenContext);


  return (
    
    <Router> 
      <Routes>
        
        <Route path = '/usuarios' element = { <Users /> } /> 
        <Route path = '/cursos' element = { <Courses /> }  /> 
        <Route path = '/usuario/:cur_user' element = { <User /> }  /> 
        <Route path = '/curso/:cur_course' element = { <Course /> }  /> 
        <Route path = '/contactos' element = { <Contacts /> } />
        <Route path = '*' element = { <Navigate to = '/usuarios' /> }/>

      </Routes>
    </Router>
  );
  
}

export default AdminRoutes;