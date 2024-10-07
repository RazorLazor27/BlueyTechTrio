import unittest
import requests

class TestLoginEndpoint(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.base_url = "http://localhost:4000/api/usuarios/login"
    
    def test_login_exitoso(self):
        response = requests.post(self.base_url, json={'email': 'admin@gmail.com', 'password': '!Admin123'})
        self.assertEqual(response.status_code, 200)
        json_response = response.json()
        self.assertIsNotNone(json_response.get('token'), "Se esperaba un token en la respuesta")

    def test_login_fallido(self):
        response = requests.post(self.base_url, json={'email': 'admin@gmail.com', 'password': 'wrongpass'})
        self.assertEqual(response.status_code, 400)  # Cambiar a 400 si es lo esperado
        json_response = response.json()
        self.assertIsNotNone(json_response, "Se esperaba un JSON en la respuesta")
        self.assertIn('error', json_response, "Se esperaba un mensaje de error en la respuesta")

if __name__ == '__main__':
    unittest.main()
