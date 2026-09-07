import pytest
import requests
from qa.ui.drivers.driver_factory import DriverFactory
from qa.ui.config.config import Config
from qa.ui.pages.login_page import LoginPage
from qa.ui.pages.dashboard_page import DashboardPage
from qa.ui.utils.screenshot_utils import ScreenshotUtils
from qa.ui.utils.logger import get_qa_logger

logger = get_qa_logger("Conftest")

@pytest.fixture(scope="function")
def driver(request):
    logger.info(f"--- Starting WebDriver for test: {request.node.name} ---")
    driver_inst = DriverFactory.create_driver()
    
    yield driver_inst
    
    if hasattr(request.node, "rep_call") and request.node.rep_call.failed:
        test_name = request.node.name.replace("[", "_").replace("]", "_")
        ScreenshotUtils.capture(driver_inst, f"FAIL_{test_name}")
        
    if Config.KEEP_BROWSER_OPEN:
        logger.info(f"QA_KEEP_BROWSER_OPEN is true. Leaving Chrome open for inspection after test: {request.node.name}")
    else:
        logger.info(f"--- Teardown WebDriver for test: {request.node.name} ---")
        try:
            driver_inst.quit()
        except Exception:
            pass

@pytest.fixture(scope="function")
def authenticated_driver(driver):
    login_page = LoginPage(driver)
    login_page.load()
    login_page.login(Config.TEST_USER_EMAIL, Config.TEST_USER_PASS)
    
    dash_page = DashboardPage(driver)
    dash_page.wait_for_url_contains("/dashboard")
    return driver

@pytest.fixture(scope="session")
def auth_token():
    login_url = f"{Config.API_BASE_URL}/auth/login"
    payload = {"email": Config.TEST_USER_EMAIL, "password": Config.TEST_USER_PASS}
    
    try:
        res = requests.post(login_url, json=payload)
        if res.status_code == 200 and res.json().get("token"):
            return res.json()["token"]
        
        reg_url = f"{Config.API_BASE_URL}/auth/register"
        requests.post(reg_url, json={
            "name": "QA Tester",
            "email": Config.TEST_USER_EMAIL,
            "password": Config.TEST_USER_PASS,
            "role": "Admin"
        })
        
        res2 = requests.post(login_url, json=payload)
        return res2.json().get("token", "")
    except Exception as e:
        logger.error(f"Failed to fetch auth token: {e}")
        return ""

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    rep = outcome.get_result()
    setattr(item, f"rep_{rep.when}", rep)
