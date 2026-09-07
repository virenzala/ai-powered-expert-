# ExportFlow — QA Automation Framework (Visible Chrome)

## Directory Structure

```
qa/
├── conftest.py                  # Global pytest fixtures (driver, auth_token, failure screenshots)
├── pytest.ini                   # Pytest options & markers
├── requirements.txt             # Python dependencies
├── QA_FINAL_REPORT.md           # Master QA Executive & Technical Report
├── api/                         # Direct REST API Test Suite
│   ├── test_auth_api.py
│   ├── test_buyer_discovery_api.py
│   └── test_leads_api.py
└── ui/                          # Selenium WebDriver UI Automation
    ├── config/config.py         # Configs (QA_HEADLESS=false by default)
    ├── drivers/driver_factory.py# Chrome WebDriver Factory (Win32 foreground focus)
    ├── pages/                   # Page Object Model Class Hierarchy
    ├── utils/                   # Screenshot & Logger utilities
    ├── screenshots/             # Step-by-step PNG evidence
    ├── reports/                 # Self-contained HTML report (report.html)
    └── tests/                   # Selenium UI test cases & smoke test
        ├── test_chrome_smoke.py
        ├── test_auth.py
        ├── test_buyer_discovery.py
        ├── test_dashboard.py
        ├── test_e2e.py
        ├── test_leads.py
        ├── test_modules.py
        ├── test_negative.py
        └── test_responsive.py
```

---

## PowerShell Run Commands

### 1. Visible Chrome Smoke Test
```powershell
python -m pytest qa/ui/tests/test_chrome_smoke.py -v -s
```

### 2. Full QA Suite
```powershell
python -m pytest qa/ui/tests qa/api -v -s --html=qa/ui/reports/report.html --self-contained-html
```
