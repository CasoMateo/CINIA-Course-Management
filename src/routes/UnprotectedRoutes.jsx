import React, { useContext } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import Login from '../unprotected_components/Login';

function AdminRoutes(props) {
  // const { token, renderModifyUsers } = useContext(TokenContext);


  return (
    
    <Router> 
      <Routes>
        
        <Route path = '/login' element = { <Login /> } />
        <Route path = '*' element = { <Navigate to = '/login' /> }/>

      </Routes>
    </Router>
  );
  
}

export default AdminRoutes;