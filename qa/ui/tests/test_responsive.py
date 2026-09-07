import pytest
from qa.ui.drivers.driver_factory import DriverFactory
from qa.ui.pages.login_page import LoginPage
from qa.ui.pages.dashboard_page import DashboardPage
from qa.ui.pages.find_buyers_page import FindBuyersPage
from qa.ui.config.config import Config
from qa.ui.utils.screenshot_utils import ScreenshotUtils

VIEWPORTS = [
    ("desktop", 1920, 1080),
    ("laptop", 1366, 768),
    ("tablet", 768, 1024),
    ("mobile", 390, 844),
]

@pytest.mark.selenium
@pytest.mark.parametrize("device,width,height", VIEWPORTS)
def test_tc_resp_001_responsive_viewports(device, width, height):
    """TC-RESP-001: Responsive UI test across Desktop, Laptop, Tablet, Mobile"""
    driver = DriverFactory.create_driver(window_size=(width, height))
    try:
        login_page = LoginPage(driver)
        login_page.load()
        login_page.login(Config.TEST_USER_EMAIL, Config.TEST_USER_PASS)
        
        dash_page = DashboardPage(driver)
        dash_page.wait_for_url_contains("/dashboard")
        assert dash_page.is_dashboard_loaded(), f"Dashboard not loaded on {device}"
        
        find_buyers = FindBuyersPage(driver)
        find_buyers.load()
        assert find_buyers.is_loaded(), f"Find Buyers not loaded on {device}"
        
        ScreenshotUtils.capture(driver, f"TC-RESP-001-{device}-{width}x{height}")
    finally:
        driver.quit()
