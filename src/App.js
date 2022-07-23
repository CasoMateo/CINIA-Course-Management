import AdminRoutes from './routes/AdminRoutes'; 
import OperatorRoutes from './routes/OperatorRoutes'; 

function App() {

  const admin = true; 
  const status = true; 

  return (
  

    admin ? 
    <AdminRoutes /> : 
    <OperatorRoutes />
      

    
  );
}

export default App;
 