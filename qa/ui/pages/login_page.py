from selenium.webdriver.common.by import By
from qa.ui.pages.base_page import BasePage
from qa.ui.config.config import Config

class LoginPage(BasePage):
    EMAIL_INPUT = (By.CSS_SELECTOR, "input[type='email']")
    PASSWORD_INPUT = (By.CSS_SELECTOR, "input[type='password']")
    SUBMIT_BTN = (By.CSS_SELECTOR, "button[type='submit']")
    ERROR_ALERT = (By.XPATH, "//*[contains(text(), 'Authentication failed') or contains(text(), 'Invalid') or contains(@class, 'bg-rose')]")
    PAGE_TITLE = (By.XPATH, "//h1[contains(text(), 'ExportFlow')]")

    def load(self):
        self.navigate_to(f"{Config.BASE_URL}/login")

    def login(self, email: str, password: str):
        self.type_text(self.EMAIL_INPUT, email)
        self.type_text(self.PASSWORD_INPUT, password)
        self.click(self.SUBMIT_BTN)

    def is_login_page_loaded(self) -> bool:
        return self.is_visible(self.EMAIL_INPUT)

    def get_error_message(self) -> str:
        if self.is_visible(self.ERROR_ALERT, timeout=5):
            return self.get_text(self.ERROR_ALERT)
        return ""
