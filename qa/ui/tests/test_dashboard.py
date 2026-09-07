import pytest
from qa.ui.pages.dashboard_page import DashboardPage
from qa.ui.pages.find_buyers_page import FindBuyersPage
from qa.ui.pages.leads_page import LeadsPage
from qa.ui.utils.screenshot_utils import ScreenshotUtils

@pytest.mark.selenium
def test_tc_dash_001_dashboard_loads(authenticated_driver):
    """TC-DASH-001 / PHASE 2: Dashboard loads title, KPI cards, and sidebar navigation"""
    dash_page = DashboardPage(authenticated_driver)
    assert dash_page.is_dashboard_loaded(), "Dashboard failed to load"
    ScreenshotUtils.capture(authenticated_driver, "dashboard")

@pytest.mark.selenium
def test_tc_dash_002_dashboard_navigation(authenticated_driver):
    """TC-DASH-002: Navigation links to Find Buyers and Leads pages"""
    dash_page = DashboardPage(authenticated_driver)
    dash_page.navigate_to_find_buyers()
    
    find_buyers_page = FindBuyersPage(authenticated_driver)
    assert find_buyers_page.is_loaded(), "Failed to navigate to Find Buyers page"
    
    dash_page.navigate_to_leads()
    leads_page = LeadsPage(authenticated_driver)
    assert leads_page.is_loaded(), "Failed to navigate to Leads page"
