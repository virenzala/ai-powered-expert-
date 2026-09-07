from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from qa.ui.config.config import Config
from qa.ui.utils.logger import get_qa_logger

logger = get_qa_logger("BasePage")

class BasePage:
    def __init__(self, driver: WebDriver):
        self.driver = driver
        self.wait = WebDriverWait(driver, Config.EXPLICIT_WAIT)

    def navigate_to(self, url: str):
        logger.info(f"Navigating to: {url}")
        self.driver.get(url)

    def find(self, locator: tuple):
        return self.wait.until(EC.presence_of_element_located(locator))

    def find_visible(self, locator: tuple):
        return self.wait.until(EC.visibility_of_element_located(locator))

    def find_all(self, locator: tuple):
        return self.driver.find_elements(*locator)

    def click(self, locator: tuple):
        logger.info(f"Clicking element: {locator}")
        el = self.wait.until(EC.element_to_be_clickable(locator))
        el.click()

    def type_text(self, locator: tuple, text: str, clear_first: bool = True):
        logger.info(f"Typing into {locator}: '{text}'")
        el = self.find_visible(locator)
        if clear_first:
            el.clear()
        el.send_keys(text)

    def select_option(self, locator: tuple, value: str):
        from selenium.webdriver.support.ui import Select
        logger.info(f"Selecting dropdown option '{value}' for {locator}")
        el = self.find_visible(locator)
        select = Select(el)
        select.select_by_value(value)

    def get_text(self, locator: tuple) -> str:
        el = self.find_visible(locator)
        return el.text.strip()

    def is_visible(self, locator: tuple, timeout: int = 5) -> bool:
        try:
            WebDriverWait(self.driver, timeout).until(EC.visibility_of_element_located(locator))
            return True
        except Exception:
            return False

    def wait_for_url_contains(self, partial_url: str):
        logger.info(f"Waiting for URL to contain: '{partial_url}'")
        self.wait.until(EC.url_contains(partial_url))

    def get_current_url(self) -> str:
        return self.driver.current_url
