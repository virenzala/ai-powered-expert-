import os
import sys
import time

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from qa.ui.drivers.driver_factory import DriverFactory
from qa.ui.config.config import Config
from qa.ui.utils.screenshot_utils import ScreenshotUtils
from qa.ui.utils.logger import get_qa_logger

logger = get_qa_logger("VisibleChromeVerification")

def run_visible_chrome_test():
    logger.info("==================================================")
    logger.info("STARTING VISIBLE GOOGLE CHROME VERIFICATION TEST")
    logger.info("==================================================")
    
    # Force QA_HEADLESS=false
    os.environ["QA_HEADLESS"] = "false"
    
    chrome_launched = False
    chrome_visible = False
    app_loaded = False
    screenshot_created = False
    screenshot_path = ""
    
    try:
        # 1. Launch Visible Chrome (NO HEADLESS)
        driver = DriverFactory.create_driver(headless=False)
        chrome_launched = True
        chrome_visible = True
        logger.info("Visible Google Chrome window successfully opened on desktop!")

        # 2. Navigate to Application URL
        logger.info(f"Navigating Chrome to application URL: {Config.BASE_URL}")
        driver.get(Config.BASE_URL)
        
        # 3. Wait for page load
        time.sleep(3)
        current_url = driver.current_url
        page_title = driver.title
        logger.info(f"Loaded page URL: {current_url}, Title: '{page_title}'")
        
        if Config.BASE_URL in current_url or "login" in current_url or "dashboard" in current_url:
            app_loaded = True

        # 4. Take Screenshot
        screenshot_path = ScreenshotUtils.capture(driver, "VISIBLE_CHROME_VERIFICATION")
        if screenshot_path and os.path.exists(screenshot_path):
            screenshot_created = True

        logger.info("KEEPING CHROME OPEN FOR USER VISUAL INSPECTION ON WINDOWS DESKTOP...")
        logger.info("Note: driver.quit() NOT called as requested.")
        
    except Exception as e:
        logger.error(f"Visible Chrome launch failed: {e}")
        print(f"Visible Chrome could not be launched because: {e}")
        
    print("\n==================================================")
    print("VISIBLE CHROME VERIFICATION RESULTS:")
    print("==================================================")
    print(f"Chrome launched: {'YES' if chrome_launched else 'NO'}")
    print(f"Chrome visible: {'YES' if chrome_visible else 'NO'}")
    print(f"Application loaded: {'YES' if app_loaded else 'NO'}")
    print(f"Screenshot created: {'YES' if screenshot_created else 'NO'}")
    print("==================================================")

if __name__ == "__main__":
    run_visible_chrome_test()
