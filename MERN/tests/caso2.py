import unittest
import requests

class TestCrearPacienteEndpoint(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.base_url = "http://localhost:4000/api/pacientes"
        login_response = requests.post(
            "http://localhost:4000/api/usuarios/login", 
            json={'email': 'admin@gmail.com', 'password': '!Admin123'}
        )
        if login_response.status_code == 200:
            cls.token = login_response.json().get('token') 
        else:
            raise Exception("Error en el inicio de sesión")

    def test_crear_paciente_exitoso(self):
        data = {
            "nombre": "Amelia Fernandez", 
            "rut": "29789234-3", 
            "fecha_nacimiento": "2000-11-02", 
            "sexo": "F", 
            "telefono": "98989888",
            "doctor_rut": "21095788-K",
            "en_tratamiento": False
        }
        headers = {'Authorization': f'Bearer {self.token}'}
        response = requests.post(self.base_url, json=data, headers=headers)
        self.assertEqual(response.status_code, 201)
        # Verifica que el mensaje de respuesta sea el esperado
        self.assertEqual(response.json().get('mensaje'), 'Paciente creado exitosamente')

    def test_crear_paciente_error_datos_incompletos(self):
        data = {
            "nombre": "Amelia Fernandez", 
            "fecha_nacimiento": "2001-11-02", 
            "sexo": "F", 
            "telefono": "98989898",
            "doctor_rut": "21095788-K",
            "en_tratamiento": False
        }
        headers = {'Authorization': f'Bearer {self.token}'}
        response = requests.post(self.base_url, json=data, headers=headers)
        self.assertEqual(response.status_code, 400)  
        self.assertIn('error', response.json())  

        self.assertTrue('rut' in response.json().get('error'))  

if __name__ == '__main__':
    unittest.main()
