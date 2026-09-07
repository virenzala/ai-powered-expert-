import pytest
import requests
from qa.ui.config.config import Config

@pytest.mark.api
def test_api_buyer_discovery_search(auth_token):
    """API-002: POST /api/buyer-discovery/search endpoint verification"""
    url = f"{Config.API_BASE_URL}/buyer-discovery/search"
    headers = {"Authorization": f"Bearer {auth_token}"}
    payload = {
        "product": "Industrial Machinery",
        "country": "Germany",
        "industry": "Industrial Equipment",
        "buyerType": "Importer",
        "contactRole": "Procurement Manager",
        "keywords": "industrial machinery importer"
    }
    
    res = requests.post(url, json=payload, headers=headers)
    assert res.status_code == 200, f"Search failed with status {res.status_code}: {res.text}"
    
    body = res.json()
    assert body.get("success") is True
    assert body.get("mode") in ["mock", "apollo", "google"]
    assert "summary" in body
    assert "totalFound" in body["summary"]
    assert "leads" in body
    assert len(body["leads"]) > 0

@pytest.mark.api
def test_api_buyer_discovery_deduplication(auth_token):
    """API-003: Repeat search flags duplicate leads with existing: true"""
    url = f"{Config.API_BASE_URL}/buyer-discovery/search"
    headers = {"Authorization": f"Bearer {auth_token}"}
    payload = {
        "product": "Industrial Machinery",
        "country": "Germany",
        "industry": "Industrial Equipment",
        "buyerType": "Importer",
        "contactRole": "Procurement Manager"
    }
    
    # First search
    requests.post(url, json=payload, headers=headers)
    
    # Second search
    res = requests.post(url, json=payload, headers=headers)
    assert res.status_code == 200
    
    body = res.json()
    assert body["summary"]["existingLeads"] > 0
    assert body["summary"]["newLeads"] == 0
