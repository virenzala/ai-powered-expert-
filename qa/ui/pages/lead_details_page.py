from selenium.webdriver.common.by import By
from qa.ui.pages.base_page import BasePage

class LeadDetailsPage(BasePage):
    DRAWER_CONTAINER = (By.XPATH, "//div[contains(@class, 'fixed') and .//p[contains(text(), 'Validation')]]")
    DRAWER_TITLE = (By.XPATH, "//h3 | //h2[contains(@class, 'font-bold')]")
    VALIDATION_BADGE = (By.XPATH, "//*[contains(text(), 'Not Yet Processed') or contains(text(), 'Validating') or contains(text(), 'Valid') or contains(text(), 'Invalid')]")
    OUTREACH_STATUS = (By.XPATH, "//*[contains(text(), 'Not Contacted') or contains(text(), 'Campaign Queued')]")
    CLOSE_BTN = (By.XPATH, "//button[contains(@aria-label, 'Close') or .//*[name()='svg']]")

    def is_drawer_open(self) -> bool:
        return self.is_visible(self.VALIDATION_BADGE, timeout=5)

    def get_validation_status(self) -> str:
        if self.is_visible(self.VALIDATION_BADGE, timeout=3):
            return self.get_text(self.VALIDATION_BADGE)
        return ""

    def get_outreach_status(self) -> str:
        if self.is_visible(self.OUTREACH_STATUS, timeout=3):
            return self.get_text(self.OUTREACH_STATUS)
        return ""
