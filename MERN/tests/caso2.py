import unittest
import requests

class TestCrearPacienteEndpoint(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.base_url = "http://localhost:4000/api/pacientes"
        login_response = requests.post("http://localhost:4000/api/usuarios/login", json={'email': 'admin@gmail.com', 'password': '!Admin123'})
        if login_response.status_code == 200:
            cls.token = login_response.json().get('token') 
        else:
            raise Exception("Error en el inicio de sesión")

    def test_crear_paciente_exitoso(self):
        data = {
            "nombre": "Ameliaa Fernandez", 
            "rut": "20789235-3", 
            "fecha_nacimiento": "2000-11-02", 
            "sexo": "F", 
            "telefono": "98989888",
            "doctor_rut": "21095788-K",
            "en_tratamiento": False
        }
        headers = {'Authorization': f'Bearer {self.token}'}
        response = requests.post(self.base_url, json=data, headers=headers)
        
        print("Respuesta crear paciente:", response.json())  # Para depuración
        self.assertEqual(response.status_code, 201)  # Verifica que el estado sea 201
        self.assertEqual(response.json().get('mensaje'), 'paciente creado exitosamente')

    def test_crear_paciente_error_datos_incompletos(self):
        data = {
            "nombre": "Amelia Fernandez", 
            # "rut" está faltando para simular el error
            "fecha_nacimiento": "2001-11-02", 
            "sexo": "F", 
            "telefono": "98989898",
            "doctor_rut": "21095788-K",
            "en_tratamiento": False
        }
        headers = {'Authorization': f'Bearer {self.token}'}
        response = requests.post(self.base_url, json=data, headers=headers)
        self.assertEqual(response.status_code, 400)  # Verifica que el estado sea 400
        self.assertIn('error', response.json())  # Asegúrate de que 'error' esté en la respuesta
        self.assertTrue('rut' in response.json().get('error'))  # Verifica que el error mencione el RUT
if __name__ == '__main__':
    unittest.main()
