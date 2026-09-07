import os
import time
from selenium.webdriver.remote.webdriver import WebDriver
from qa.ui.config.config import Config
from qa.ui.utils.logger import get_qa_logger

logger = get_qa_logger("ScreenshotUtils")

class ScreenshotUtils:
    @staticmethod
    def capture(driver: WebDriver, name: str) -> str:
        os.makedirs(Config.SCREENSHOT_DIR, exist_ok=True)
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        filename = f"{name}_{timestamp}.png"
        filepath = os.path.join(Config.SCREENSHOT_DIR, filename)
        
        try:
            driver.save_screenshot(filepath)
            logger.info(f"Screenshot saved: {filepath}")
            return filepath
        except Exception as e:
            logger.error(f"Failed to capture screenshot '{name}': {e}")
            return ""
