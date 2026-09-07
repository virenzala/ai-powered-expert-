import os
import sys
import ctypes
from ctypes import wintypes
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from qa.ui.config.config import Config
from qa.ui.utils.logger import get_qa_logger

logger = get_qa_logger("DriverFactory")

def bring_to_foreground(hwnd):
    """Brings top-level Chrome HWND to the foreground and focuses it on the desktop."""
    if not hwnd:
        return
    user32 = ctypes.windll.user32
    try:
        user32.ShowWindow(hwnd, 9)  # SW_RESTORE
        user32.ShowWindow(hwnd, 3)  # SW_SHOWMAXIMIZED
        user32.BringWindowToTop(hwnd)
        user32.SetForegroundWindow(hwnd)
    except Exception as e:
        logger.warning(f"Could not focus HWND {hwnd}: {e}")

def find_chrome_hwnd():
    """Locates top-level Chrome HWND using User32 API."""
    user32 = ctypes.windll.user32
    EnumWindows = user32.EnumWindows
    EnumWindowsProc = ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
    GetWindowTextW = user32.GetWindowTextW
    GetWindowTextLengthW = user32.GetWindowTextLengthW
    IsWindowVisible = user32.IsWindowVisible

    target_hwnd = None

    def foreach_window(hwnd, lParam):
        nonlocal target_hwnd
        length = GetWindowTextLengthW(hwnd)
        if length > 0:
            buff = ctypes.create_unicode_buffer(length + 1)
            GetWindowTextW(hwnd, buff, length + 1)
            title = buff.value
            if ("ExportFlow" in title or "Chrome" in title) and IsWindowVisible(hwnd):
                target_hwnd = hwnd
                return False
        return True

    EnumWindows(EnumWindowsProc(foreach_window), 0)
    return target_hwnd

class DriverFactory:
    @staticmethod
    def create_driver(headless: bool = Config.HEADLESS, window_size: tuple = (1920, 1080)) -> webdriver.Chrome:
        options = webdriver.ChromeOptions()
        
        # STRICT REQUIREMENT: Only add headless if explicitly requested
        if headless:
            logger.info("Launching Chrome in HEADLESS mode")
            options.add_argument("--headless=new")
        else:
            logger.info("Launching Chrome in VISIBLE HEADED mode")

        options.add_argument(f"--window-size={window_size[0]},{window_size[1]}")
        options.add_argument("--start-maximized")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--remote-allow-origins=*")
        options.add_argument("--ignore-certificate-errors")

        try:
            service = ChromeService(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=options)
        except Exception as e:
            logger.warning(f"ChromeDriverManager failed, trying default PATH lookup: {e}")
            try:
                driver = webdriver.Chrome(options=options)
            except Exception as e2:
                # DO NOT SILENTLY FALL BACK TO HEADLESS MODE
                raise RuntimeError(
                    f"Visible Chrome could not be launched because: {e2}. "
                    f"Ensure local Google Chrome is installed."
                ) from e2

        try:
            driver.set_window_position(0, 0)
            if window_size == (1920, 1080):
                driver.maximize_window()
            else:
                driver.set_window_size(window_size[0], window_size[1])
            hwnd = find_chrome_hwnd()
            if hwnd:
                bring_to_foreground(hwnd)
        except Exception:
            pass

        driver.implicitly_wait(Config.IMPLICIT_WAIT)
        return driver
