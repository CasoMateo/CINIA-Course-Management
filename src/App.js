import React, { useState, useContext } from 'react'; 
import AdminRoutes from './routes/AdminRoutes'; 
import OperatorRoutes from './routes/OperatorRoutes'; 
import UnprotectedRoutes from './routes/UnprotectedRoutes';
import { AuthContext } from './contexts/AuthContext'; 

function App() {

  const { status, admin } = useContext(AuthContext);

  return (
    
    !status ?
    <UnprotectedRoutes /> :
    (admin ? 
    <AdminRoutes /> : 
    <OperatorRoutes />)
      
    
  );
}

export default App;
 