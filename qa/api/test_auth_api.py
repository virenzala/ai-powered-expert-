import pytest
import requests
from qa.ui.config.config import Config

@pytest.mark.api
def test_api_auth_register_and_login():
    """API-001: Register & Login endpoints"""
    login_url = f"{Config.API_BASE_URL}/auth/login"
    payload = {"email": Config.TEST_USER_EMAIL, "password": Config.TEST_USER_PASS}
    
    res = requests.post(login_url, json=payload)
    if res.status_code != 200:
        reg_url = f"{Config.API_BASE_URL}/auth/register"
        reg_res = requests.post(reg_url, json={
            "name": "QA Tester",
            "email": Config.TEST_USER_EMAIL,
            "password": Config.TEST_USER_PASS,
            "role": "Admin"
        })
        assert reg_res.status_code in [201, 400, 409]
        res = requests.post(login_url, json=payload)
        
    assert res.status_code == 200
    body = res.json()
    assert body.get("success") is True
    assert "token" in body
