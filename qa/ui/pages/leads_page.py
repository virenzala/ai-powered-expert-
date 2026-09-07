from selenium.webdriver.common.by import By
from qa.ui.pages.base_page import BasePage
from qa.ui.config.config import Config

class LeadsPage(BasePage):
    PAGE_TITLE = (By.XPATH, "//h1[contains(text(), 'International Buyer Leads')]")
    SEARCH_INPUT = (By.XPATH, "//input[contains(@placeholder, 'Search by company')]")
    COUNTRY_FILTER = (By.XPATH, "//select[option[contains(text(), 'All Target Countries')]]")
    INDUSTRY_FILTER = (By.XPATH, "//select[option[contains(text(), 'All Industries')]]")
    BUYER_TYPE_FILTER = (By.XPATH, "//select[option[contains(text(), 'All Buyer Types')]]")
    SOURCE_FILTER = (By.XPATH, "//select[option[contains(text(), 'All Data Sources')]]")
    SORT_BY_SELECT = (By.XPATH, "//select[option[contains(text(), 'Sort: Newest First')]]")
    RESET_BTN = (By.XPATH, "//button[contains(text(), 'Reset')]")
    TABLE_ROWS = (By.XPATH, "//tbody/tr")
    FIRST_LEAD_COMPANY = (By.XPATH, "//tbody/tr[1]//span[contains(@class, 'font-bold')]")

    def load(self):
        self.navigate_to(f"{Config.BASE_URL}/leads")

    def is_loaded(self) -> bool:
        return self.is_visible(self.PAGE_TITLE)

    def search(self, query: str):
        self.type_text(self.SEARCH_INPUT, query)

    def filter_by_country(self, country: str):
        self.select_option(self.COUNTRY_FILTER, country)

    def filter_by_source(self, source: str):
        self.select_option(self.SOURCE_FILTER, source)

    def sort_by(self, option: str):
        self.select_option(self.SORT_BY_SELECT, option)

    def get_row_count(self) -> int:
        rows = self.find_all(self.TABLE_ROWS)
        return len(rows)

    def click_first_lead(self):
        self.click(self.FIRST_LEAD_COMPANY)
