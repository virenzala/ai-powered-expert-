import pytest
import time
from qa.ui.pages.login_page import LoginPage
from qa.ui.pages.dashboard_page import DashboardPage
from qa.ui.pages.find_buyers_page import FindBuyersPage
from qa.ui.pages.leads_page import LeadsPage
from qa.ui.pages.lead_details_page import LeadDetailsPage
from qa.ui.config.config import Config
from qa.ui.utils.screenshot_utils import ScreenshotUtils

@pytest.mark.selenium
def test_tc_e2e_001_full_buyer_discovery_flow(driver):
    """TC-E2E-001: Complete Phase 1 End-to-End User Flow: Login -> Dashboard -> Discovery -> Deduplication -> Leads List -> Lead Detail Drawer"""
    # 1. Login
    login_page = LoginPage(driver)
    login_page.load()
    login_page.login(Config.TEST_USER_EMAIL, Config.TEST_USER_PASS)
    
    # 2. Dashboard
    dash_page = DashboardPage(driver)
    dash_page.wait_for_url_contains("/dashboard")
    assert dash_page.is_dashboard_loaded(), "Dashboard failed to load"
    
    # 3. Find International Buyers
    dash_page.navigate_to_find_buyers()
    find_buyers = FindBuyersPage(driver)
    assert find_buyers.is_loaded(), "Find Buyers page failed to load"
    
    # 4. Enter Search Criteria & Execute
    find_buyers.search_buyers(
        product="Industrial Machinery",
        country="Germany",
        industry="Industrial Equipment",
        buyer_type="Importer",
        contact_role="Procurement Manager",
        keywords="industrial machinery importer"
    )
    
    # 5. Verify Results & Mock Mode Banner
    assert find_buyers.wait_for_results(), "Discovery results failed to display"
    stats1 = find_buyers.get_summary_stats()
    assert stats1["total_found"] > 0, "Total buyers found should be > 0"
    ScreenshotUtils.capture(driver, "TC-E2E-001-step5-discovery-results")
    
    # 6. Re-run Search to Verify Deduplication
    time.sleep(1)
    find_buyers.search_buyers(
        product="Industrial Machinery",
        country="Germany",
        industry="Industrial Equipment",
        buyer_type="Importer",
        contact_role="Procurement Manager"
    )
    assert find_buyers.wait_for_results()
    stats2 = find_buyers.get_summary_stats()
    assert stats2["existing_leads"] > 0, "Deduplication engine failed: existing leads should be > 0"
    ScreenshotUtils.capture(driver, "TC-E2E-001-step6-dedup-verification")
    
    # 7. Open Leads Page
    dash_page.navigate_to_leads()
    leads_page = LeadsPage(driver)
    assert leads_page.is_loaded(), "Leads page failed to load"
    assert leads_page.get_row_count() > 0, "Leads list should display records"
    ScreenshotUtils.capture(driver, "TC-E2E-001-step7-leads-list")
    
    # 8. Open Lead Profile Drawer
    leads_page.click_first_lead()
    lead_details = LeadDetailsPage(driver)
    assert lead_details.is_drawer_open(), "Lead details profile drawer failed to open"
    val_status = lead_details.get_validation_status()
    assert val_status in ["Not Yet Processed", "Validating", "Valid", "Invalid"], "Lead profile status missing"
    ScreenshotUtils.capture(driver, "TC-E2E-001-step8-lead-profile-drawer")
    
    # 9. Logout
    dash_page.logout()
    login_page.wait_for_url_contains("/login")
    assert login_page.is_login_page_loaded(), "Logout failed"
    ScreenshotUtils.capture(driver, "TC-E2E-001-step9-logout-complete")
