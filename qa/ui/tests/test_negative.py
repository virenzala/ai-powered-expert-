import pytest
from qa.ui.pages.find_buyers_page import FindBuyersPage
from qa.ui.utils.screenshot_utils import ScreenshotUtils

@pytest.mark.selenium
def test_tc_neg_001_empty_search_inputs(authenticated_driver):
    """TC-NEG-001: Submitting empty search parameters triggers html5/UI validation"""
    page = FindBuyersPage(authenticated_driver)
    page.load()
    
    page.type_text(page.PRODUCT_INPUT, "")
    page.type_text(page.COUNTRY_INPUT, "")
    page.click(page.FIND_BUYERS_BTN)
    
    # Should not transition to results
    assert not page.is_visible(page.RESULTS_SECTION, timeout=2), "Results section should not load for empty inputs"
    ScreenshotUtils.capture(authenticated_driver, "TC-NEG-001-empty-search-blocked")
