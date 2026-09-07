import pytest
import time
from qa.ui.pages.leads_page import LeadsPage
from qa.ui.pages.lead_details_page import LeadDetailsPage
from qa.ui.utils.screenshot_utils import ScreenshotUtils

@pytest.mark.selenium
def test_tc_lead_001_leads_list_rendering(authenticated_driver):
    """TC-LEAD-001 / PHASE 6: Leads page renders table of discovered leads and persists after refresh"""
    page = LeadsPage(authenticated_driver)
    page.load()
    assert page.is_loaded(), "Leads page failed to load"
    assert page.get_row_count() > 0, "Leads table should contain rows"
    
    # Refresh browser & verify persistence
    authenticated_driver.refresh()
    time.sleep(1)
    assert page.get_row_count() > 0, "Leads data must persist after browser refresh"
    ScreenshotUtils.capture(authenticated_driver, "leads")

@pytest.mark.selenium
def test_tc_lead_002_country_filter_and_search(authenticated_driver):
    """TC-LEAD-002: Search and Country Filter operation"""
    page = LeadsPage(authenticated_driver)
    page.load()
    
    page.filter_by_country("Germany")
    time.sleep(1)
    assert page.get_row_count() > 0, "Should display Germany leads"
    
    page.search("Rheinland")
    time.sleep(1)
    assert page.get_row_count() > 0, "Should display Rheinland lead"

@pytest.mark.selenium
def test_tc_lead_003_lead_detail_drawer(authenticated_driver):
    """TC-LEAD-003 / PHASE 7: Click lead to open profile detail drawer and check Phase 1 status"""
    leads_page = LeadsPage(authenticated_driver)
    leads_page.load()
    
    leads_page.click_first_lead()
    
    details_page = LeadDetailsPage(authenticated_driver)
    assert details_page.is_drawer_open(), "Lead detail drawer failed to open"
    
    val_status = details_page.get_validation_status()
    outreach_status = details_page.get_outreach_status()
    
    assert val_status in ["Not Yet Processed", "Validating", "Valid", "Invalid"], f"Unexpected validation status: {val_status}"
    assert outreach_status in ["Not Contacted", "Campaign Queued", "Email Sent"], f"Unexpected outreach status: {outreach_status}"
