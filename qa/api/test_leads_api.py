import pytest
import requests
from qa.ui.config.config import Config

@pytest.mark.api
def test_api_get_leads(auth_token):
    """API-004: GET /api/leads list with filtering and pagination"""
    url = f"{Config.API_BASE_URL}/leads?country=Germany&page=1&limit=15"
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    res = requests.get(url, headers=headers)
    assert res.status_code == 200
    
    body = res.json()
    assert body.get("success") is True
    assert "data" in body
    assert "pagination" in body
    assert isinstance(body["data"], list)
