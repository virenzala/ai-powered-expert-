import pytest
from qa.ui.pages.login_page import LoginPage
from qa.ui.pages.dashboard_page import DashboardPage
from qa.ui.config.config import Config
from qa.ui.utils.screenshot_utils import ScreenshotUtils

@pytest.mark.selenium
def test_tc_auth_001_valid_login(driver):
    """TC-AUTH-001: Valid login redirects to dashboard"""
    login_page = LoginPage(driver)
    login_page.load()
    login_page.login(Config.TEST_USER_EMAIL, Config.TEST_USER_PASS)
    
    dash_page = DashboardPage(driver)
    dash_page.wait_for_url_contains("/dashboard")
    assert dash_page.is_dashboard_loaded(), "Dashboard failed to load after valid login"
    ScreenshotUtils.capture(driver, "TC-AUTH-001-success")

@pytest.mark.selenium
def test_tc_auth_002_invalid_password(driver):
    """TC-AUTH-002: Invalid password displays error message"""
    login_page = LoginPage(driver)
    login_page.load()
    login_page.login(Config.TEST_USER_EMAIL, "wrongpassword_123")
    
    assert login_page.is_login_page_loaded(), "Should remain on login page"
    err_msg = login_page.get_error_message()
    assert err_msg != "", "Error alert message should be displayed"
    ScreenshotUtils.capture(driver, "TC-AUTH-002-invalid-pass")

@pytest.mark.selenium
def test_tc_auth_003_empty_credentials(driver):
    """TC-AUTH-003: Empty credentials check"""
    login_page = LoginPage(driver)
    login_page.load()
    login_page.login("", "")
    
    assert login_page.is_login_page_loaded(), "Should remain on login page"
    ScreenshotUtils.capture(driver, "TC-AUTH-003-empty-creds")

@pytest.mark.selenium
def test_tc_auth_004_logout(authenticated_driver):
    """TC-AUTH-004: Logout returns user to login page"""
    dash_page = DashboardPage(authenticated_driver)
    dash_page.logout()
    
    login_page = LoginPage(authenticated_driver)
    login_page.wait_for_url_contains("/login")
    assert login_page.is_login_page_loaded(), "User should be redirected to login after logout"
    ScreenshotUtils.capture(driver=authenticated_driver, name="TC-AUTH-004-logout-success")

@pytest.mark.selenium
def test_tc_auth_005_protected_route(driver):
    """TC-AUTH-005: Unauthenticated access to /dashboard redirects to /login"""
    login_page = LoginPage(driver)
    login_page.navigate_to(f"{Config.BASE_URL}/dashboard")
    
    login_page.wait_for_url_contains("/login")
    assert login_page.is_login_page_loaded(), "Unauthenticated user should be redirected to /login"
    ScreenshotUtils.capture(driver, "TC-AUTH-005-protected-redirect")
