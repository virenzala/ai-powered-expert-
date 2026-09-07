# ExportFlow — Visible Chrome QA Automation Guide

This guide provides the exact native Windows PowerShell commands to execute the automated QA test suite in a **REAL VISIBLE GOOGLE CHROME BROWSER WINDOW** on your desktop.

---

## 🖥️ Prerequisites

1. Ensure the application servers are running:
   - Backend API: `http://localhost:5000`
   - Frontend Web App: `http://localhost:3000`
2. Ensure Python 3.10+ and dependencies are installed.

---

## 🚀 Execution Commands (Run in Windows PowerShell or Command Prompt)

### 1. Standalone Visible Chrome Inspection Test
Launches Google Chrome, maximizes it, brings it to the foreground on your desktop, and holds it open indefinitely for visual inspection:
```powershell
C:\Users\hp\AppData\Local\Programs\Python\Python312\python.exe qa/selenium/open_visible_chrome.py
```

---

### 2. Run the Visible Chrome Smoke Test
Visually verifies that Chrome opens on your screen and loads ExportFlow before running the complete suite:
```powershell
python -m pytest qa/ui/tests/test_chrome_smoke.py -v -s
```

---

### 3. Run Full 18-Phase Visible Chrome QA Automation Suite
Executes all 30 UI & REST API test cases in live visible Chrome on your desktop and generates the HTML report:
```powershell
python -m pytest qa/ui/tests qa/api -v -s --html=qa/ui/reports/report.html --self-contained-html
```

---

### 4. Run API Tests Only
```powershell
python -m pytest qa/api -v -s
```

---

## 📊 Reports & Evidence
- **HTML Report**: `qa/ui/reports/report.html`
- **Master Technical Report**: `qa/QA_FINAL_REPORT.md`
- **Screenshots**: `qa/ui/screenshots/`
