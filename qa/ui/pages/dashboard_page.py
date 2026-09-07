from selenium.webdriver.common.by import By
from qa.ui.pages.base_page import BasePage
from qa.ui.config.config import Config

class DashboardPage(BasePage):
    DASHBOARD_TITLE = (By.XPATH, "//h1[contains(text(), 'Export') or contains(text(), 'Dashboard') or contains(text(), 'Overview')]")
    KPI_CARDS = (By.CSS_SELECTOR, ".grid .rounded-xl, .grid .shadow-sm")
    NAV_FIND_BUYERS = (By.XPATH, "//a[contains(@href, '/find-buyers') or contains(text(), 'Find Buyers') or contains(text(), 'Buyer Discovery')]")
    NAV_LEADS = (By.XPATH, "//a[contains(@href, '/leads') or contains(text(), 'Leads')]")
    USER_AVATAR_BTN = (By.XPATH, "//header//button[div]")
    LOGOUT_BTN = (By.XPATH, "//button[span[contains(text(), 'Sign Out')] or contains(text(), 'Sign Out') or contains(text(), 'Logout')]")

    def load(self):
        self.navigate_to(f"{Config.BASE_URL}/dashboard")

    def is_dashboard_loaded(self) -> bool:
        return self.is_visible(self.DASHBOARD_TITLE) or self.is_visible(self.NAV_LEADS)

    def navigate_to_find_buyers(self):
        self.click(self.NAV_FIND_BUYERS)

    def navigate_to_leads(self):
        self.click(self.NAV_LEADS)

    def logout(self):
        try:
            close_btns = self.driver.find_elements(By.XPATH, "//button[contains(@aria-label, 'Close')]")
            if close_btns:
                close_btns[0].click()
        except Exception:
            pass

        avatar = self.find_visible(self.USER_AVATAR_BTN)
        self.driver.execute_script("arguments[0].click();", avatar)
        logout_el = self.find_visible(self.LOGOUT_BTN)
        self.driver.execute_script("arguments[0].click();", logout_el)
