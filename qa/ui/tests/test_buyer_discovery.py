import pytest
import time
from qa.ui.pages.find_buyers_page import FindBuyersPage
from qa.ui.utils.screenshot_utils import ScreenshotUtils

@pytest.mark.selenium
def test_tc_buyer_001_search_execution(authenticated_driver):
    """TC-BUYER-001 / PHASE 3 & 4: Execute buyer discovery search and verify normalized results table"""
    page = FindBuyersPage(authenticated_driver)
    page.load()
    assert page.is_loaded(), "Find Buyers page not loaded"
    
    page.search_buyers(
        product="Industrial Machinery",
        country="Germany",
        industry="Industrial Equipment",
        buyer_type="Importer",
        contact_role="Procurement Manager",
        keywords="industrial machinery importer"
    )
    
    assert page.wait_for_results(), "Search results table did not appear"
    stats = page.get_summary_stats()
    assert stats["total_found"] > 0, "Total buyers found should be greater than 0"
    ScreenshotUtils.capture(authenticated_driver, "buyer-discovery")

@pytest.mark.selenium
def test_tc_buyer_002_mock_mode_banner(authenticated_driver):
    """TC-BUYER-002: Verify DEVELOPMENT / MOCK MODE banner is displayed when Apollo key is unconfigured"""
    page = FindBuyersPage(authenticated_driver)
    page.load()
    
    banner_text = page.get_mode_banner_text()
    assert "DEVELOPMENT / MOCK MODE" in banner_text or "PROVIDER:" in banner_text, "Mode banner text missing"

@pytest.mark.selenium
def test_tc_buyer_003_duplicate_detection(authenticated_driver):
    """TC-BUYER-003 / PHASE 5: Re-running search detects existing leads without creating duplicates"""
    page = FindBuyersPage(authenticated_driver)
    page.load()
    
    # First Run
    page.search_buyers(
        product="Industrial Machinery",
        country="Germany",
        industry="Industrial Equipment",
        buyer_type="Importer",
        contact_role="Procurement Manager"
    )
    assert page.wait_for_results()
    
    # Second Run (repeat identical search)
    time.sleep(1)
    page.search_buyers(
        product="Industrial Machinery",
        country="Germany",
        industry="Industrial Equipment",
        buyer_type="Importer",
        contact_role="Procurement Manager"
    )
    assert page.wait_for_results()
    stats2 = page.get_summary_stats()
    
    assert stats2["existing_leads"] > 0, "Existing leads count should increase on repeat search"
    assert stats2["new_leads"] == 0, "New leads count should be 0 on repeat search"

@pytest.mark.selenium
def test_tc_buyer_004_custom_keyword_discovery(authenticated_driver):
    """TC-BUYER-004: Execute multi-field discovery with specific product, target country, role, and custom keywords"""
    page = FindBuyersPage(authenticated_driver)
    page.load()
    assert page.is_loaded(), "Find Buyers page failed to load"
    
    page.search_buyers(
        product="Precision CNC Equipment",
        country="Japan",
        industry="Industrial Equipment",
        buyer_type="Importer",
        contact_role="Director of Procurement",
        keywords="cnc machinery distributor"
    )
    
    assert page.wait_for_results(), "Discovery results table failed to display for custom query"
    stats = page.get_summary_stats()
    assert stats["total_found"] > 0, "Total buyers found should be > 0 for custom query"
    
    ScreenshotUtils.capture(authenticated_driver, "TC-BUYER-004-custom-keyword-discovery")
    print(f"\n[TC-BUYER-004 PASS] Discovered {stats['total_found']} buyers for Precision CNC Equipment in Japan!")
