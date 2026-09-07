import os

class Config:
    BASE_URL = os.getenv("QA_BASE_URL", "http://localhost:3000")
    API_BASE_URL = os.getenv("QA_API_BASE_URL", "http://localhost:5000/api")
    
    # DEFAULT MUST BE HEADED / VISIBLE MODE (QA_HEADLESS=false)
    HEADLESS = os.getenv("QA_HEADLESS", "false").lower() == "true"
    
    # QA_KEEP_BROWSER_OPEN=true prevents driver.quit() from closing Chrome automatically
    KEEP_BROWSER_OPEN = os.getenv("QA_KEEP_BROWSER_OPEN", "false").lower() == "true"
    
    IMPLICIT_WAIT = int(os.getenv("QA_IMPLICIT_WAIT", "10"))
    EXPLICIT_WAIT = int(os.getenv("QA_EXPLICIT_WAIT", "15"))
    
    TEST_USER_EMAIL = os.getenv("QA_USER_EMAIL", "admin@exportflow.com")
    TEST_USER_PASS = os.getenv("QA_USER_PASS", "password123")
    
    SCREENSHOT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "screenshots")
    REPORT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "reports")
