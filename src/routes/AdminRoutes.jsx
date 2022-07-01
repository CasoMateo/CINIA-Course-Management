import React, { useContext } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import Users from '../admin_components/Users';
import Courses from '../admin_components/Courses';

function AdminRoutes(props) {
  // const { token, renderModifyUsers } = useContext(TokenContext);


  return (
    
    <Router> 
      <Routes>
        
        <Route path = '/usuarios' element = { <Users /> } /> 
        <Route path = '/cursos' element = { <Courses /> }  /> 
        <Route path = '*' element = { <Navigate to = '/usuarios' /> }/>

      </Routes>
    </Router>
  );
  
}

export default AdminRoutes;