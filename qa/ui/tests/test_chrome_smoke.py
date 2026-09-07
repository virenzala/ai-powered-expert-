import pytest
import time
from qa.ui.pages.login_page import LoginPage
from qa.ui.config.config import Config
from qa.ui.utils.screenshot_utils import ScreenshotUtils

@pytest.mark.selenium
def test_chrome_visible_smoke_test(driver):
    """Smoke test to visually verify visible Chrome opens and loads ExportFlow in local desktop environment"""
    login_page = LoginPage(driver)
    login_page.load()
    
    assert login_page.is_login_page_loaded(), "ExportFlow login page failed to load"
    
    curr_url = driver.current_url
    assert "login" in curr_url or Config.BASE_URL in curr_url
    
    ScreenshotUtils.capture(driver, "SMOKE_TEST_SUCCESS")
    print("\n[SMOKE TEST PASS] Visible Chrome successfully opened ExportFlow on desktop!")
