import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { UsarAuthContexto } from './hooks/UsarAuthContexto'

import './App.css'

import Home from './pages/Home'
import Navbar from './components/Navbar'
import Dicom from './pages/Dicom'
import DicomFile from './pages/DicomFile'
import Pacientes from './pages/Pacientes'
import Login from './pages/Login'
import Signup from './pages/Signup'
import PacienteForm from './pages/AddPacientes'



function App() {
	const { user } = UsarAuthContexto()
	return (
		<div className="App">
			<BrowserRouter>
				<Navbar/>
				<div className="pages">
					<Routes>
						<Route path="/" element={<Home />}/>
						<Route path="/dicom" element={<Dicom/>}/>
						<Route path="/dicomfile" element={<DicomFile/>}/>
						<Route path="/pacientes" element={user ? <Pacientes/> : <Navigate to="/login" />}/>
						<Route path="/login" element={!user ? <Login/> : <Navigate to="/" />}/>
						<Route path="/signup" element={!user ? <Signup/> : <Navigate to="/" />}/>
						<Route path="/adduser" element={<PacienteForm />}/> 
						
					</Routes>
				</div>
			</BrowserRouter>
		</div>
	)
}


export default App
