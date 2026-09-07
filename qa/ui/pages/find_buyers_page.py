from selenium.webdriver.common.by import By
from qa.ui.pages.base_page import BasePage
from qa.ui.config.config import Config

class FindBuyersPage(BasePage):
    PAGE_TITLE = (By.XPATH, "//h1[contains(text(), 'Find International Buyers')]")
    PRODUCT_INPUT = (By.XPATH, "//label[contains(text(), 'Product')]/following-sibling::input | //input[contains(@placeholder, 'Industrial')]")
    COUNTRY_INPUT = (By.XPATH, "//label[contains(text(), 'Country')]/following-sibling::input | //input[contains(@placeholder, 'Germany')]")
    INDUSTRY_SELECT = (By.XPATH, "//label[contains(text(), 'Industry')]/following-sibling::select | //select[option[contains(text(), 'Industrial Equipment')]]")
    BUYER_TYPE_SELECT = (By.XPATH, "//label[contains(text(), 'Buyer Type')]/following-sibling::select | //select[option[contains(text(), 'Importer')]]")
    CONTACT_ROLE_SELECT = (By.XPATH, "//label[contains(text(), 'Contact Role')]/following-sibling::select | //select[option[contains(text(), 'Procurement Manager')]]")
    KEYWORDS_INPUT = (By.XPATH, "//label[contains(text(), 'Keywords')]/following-sibling::input | //input[contains(@placeholder, 'importer')]")
    FIND_BUYERS_BTN = (By.XPATH, "//button[contains(text(), 'FIND') and contains(text(), 'BUYERS')]")
    
    MODE_BANNER = (By.XPATH, "//*[contains(text(), 'DEVELOPMENT / MOCK MODE') or contains(text(), 'PROVIDER:')]")
    PROGRESS_BAR = (By.XPATH, "//*[contains(text(), 'Searching buyer database') or contains(text(), 'Finding companies') or contains(text(), 'Checking duplicates')]")
    RESULTS_SECTION = (By.XPATH, "//h2[contains(text(), 'BUYERS FOUND')]")
    TOTAL_FOUND_CARD = (By.XPATH, "//span[contains(text(), 'Total Found')]/preceding-sibling::span")
    NEW_LEADS_CARD = (By.XPATH, "//span[contains(text(), 'New Leads')]/preceding-sibling::span")
    EXISTING_LEADS_CARD = (By.XPATH, "//span[contains(text(), 'Existing Leads')]/preceding-sibling::span")
    TABLE_ROWS = (By.XPATH, "//tbody/tr")

    def load(self):
        self.navigate_to(f"{Config.BASE_URL}/find-buyers")

    def is_loaded(self) -> bool:
        return self.is_visible(self.PAGE_TITLE)

    def search_buyers(self, product: str, country: str, industry: str = None, buyer_type: str = None, contact_role: str = None, keywords: str = None):
        if product:
            self.type_text(self.PRODUCT_INPUT, product)
        if country:
            self.type_text(self.COUNTRY_INPUT, country)
        if industry and self.is_visible(self.INDUSTRY_SELECT, timeout=2):
            self.select_option(self.INDUSTRY_SELECT, industry)
        if buyer_type and self.is_visible(self.BUYER_TYPE_SELECT, timeout=2):
            self.select_option(self.BUYER_TYPE_SELECT, buyer_type)
        if contact_role and self.is_visible(self.CONTACT_ROLE_SELECT, timeout=2):
            self.select_option(self.CONTACT_ROLE_SELECT, contact_role)
        if keywords:
            self.type_text(self.KEYWORDS_INPUT, keywords)
        
        self.click(self.FIND_BUYERS_BTN)

    def wait_for_results(self, timeout: int = 15) -> bool:
        return self.is_visible(self.RESULTS_SECTION, timeout=timeout)

    def get_summary_stats(self) -> dict:
        total = self.get_text(self.TOTAL_FOUND_CARD) if self.is_visible(self.TOTAL_FOUND_CARD, timeout=2) else "0"
        new_leads = self.get_text(self.NEW_LEADS_CARD) if self.is_visible(self.NEW_LEADS_CARD, timeout=2) else "0"
        existing = self.get_text(self.EXISTING_LEADS_CARD) if self.is_visible(self.EXISTING_LEADS_CARD, timeout=2) else "0"
        return {
            "total_found": int(total) if total.isdigit() else 0,
            "new_leads": int(new_leads) if new_leads.isdigit() else 0,
            "existing_leads": int(existing) if existing.isdigit() else 0
        }

    def get_mode_banner_text(self) -> str:
        if self.is_visible(self.MODE_BANNER, timeout=3):
            return self.get_text(self.MODE_BANNER)
        return ""
