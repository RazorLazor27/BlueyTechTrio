import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { PacientesContextoProveedor } from './context/PacienteContexto.jsx'
import { AuthContextoProveedor } from './context/AuthContexto.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthContextoProveedor> 
      <PacientesContextoProveedor>
        <App />
      </PacientesContextoProveedor>
    </AuthContextoProveedor>
  </React.StrictMode>,
)
