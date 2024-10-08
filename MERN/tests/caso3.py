import unittest
import requests

class TestSignUpEndpoint(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.base_url = "http://localhost:4000/api/usuarios/signup"

    def test_signup_exitoso(self):
        data = {
            "rut_doctor": "20002020-2", 
            "nombre": "Laura", 
            "apellido": "Leiva", 
            "sexo": "Femenino", 
            "email": "cc@gmail.com", 
            "password": "!Admin123", 
            "specialization": "Neurología"
        }
        response = requests.post(self.base_url, json=data)
        self.assertEqual(response.status_code, 201)

    def test_signup_datos_repetidos(self):
        data = {
            "rut_doctor": "20202020-2", 
            "nombre": "Laura", 
            "apellido": "Leiva", 
            "sexo": "Femenino", 
            "email": "aa@gmail.com", 
            "password": "!Admin123", 
            "specialization": "Neurología"
        }
        response = requests.post(self.base_url, json=data)
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.json())

if __name__ == '__main__':
    unittest.main()
