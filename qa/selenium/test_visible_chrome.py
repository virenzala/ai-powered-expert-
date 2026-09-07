import os
import sys
import time
import subprocess
import ctypes
from ctypes import wintypes
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

sys.stdout.reconfigure(line_buffering=True)

APP_URL = "http://localhost:3000/login"
SCREENSHOT_PATH = os.path.join(os.path.dirname(__file__), "screenshots", "visible_chrome_test.png")

def bring_hwnd_to_foreground(hwnd):
    """Brings the specific HWND window to the foreground and focuses it using Windows User32 API."""
    user32 = ctypes.windll.user32
    try:
        user32.ShowWindow(hwnd, 9)  # SW_RESTORE
        user32.ShowWindow(hwnd, 3)  # SW_MAXIMIZE
        user32.BringWindowToTop(hwnd)
        user32.SetForegroundWindow(hwnd)
        return True
    except Exception as e:
        print(f"Error bringing HWND {hwnd} to foreground: {e}")
        return False

def find_chrome_hwnd_and_details():
    """Locates top-level Chrome HWND and checks User32 window state."""
    user32 = ctypes.windll.user32
    
    EnumWindows = user32.EnumWindows
    EnumWindowsProc = ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
    GetWindowTextW = user32.GetWindowTextW
    GetWindowTextLengthW = user32.GetWindowTextLengthW
    IsWindow = user32.IsWindow
    IsWindowVisible = user32.IsWindowVisible
    IsIconic = user32.IsIconic
    IsZoomed = user32.IsZoomed
    GetForegroundWindow = user32.GetForegroundWindow
    GetWindowThreadProcessId = user32.GetWindowThreadProcessId

    # PIDs of chrome.exe
    chrome_pids = []
    try:
        output = subprocess.check_output("tasklist /FI \"IMAGENAME eq chrome.exe\" /FO CSV", shell=True, text=True)
        for line in output.splitlines():
            if "chrome.exe" in line:
                parts = [p.strip('"') for p in line.split(',')]
                if len(parts) >= 2 and parts[1].isdigit():
                    chrome_pids.append(int(parts[1]))
    except Exception:
        pass

    target_hwnd = None
    target_title = ""
    is_win = False
    is_visible = False
    is_minimized = False
    is_maximized = False
    is_foreground = False
    matched_pid = None

    foreground_hwnd = GetForegroundWindow()

    def foreach_window(hwnd, lParam):
        nonlocal target_hwnd, target_title, is_win, is_visible, is_minimized, is_maximized, is_foreground, matched_pid
        length = GetWindowTextLengthW(hwnd)
        if length > 0:
            buff = ctypes.create_unicode_buffer(length + 1)
            GetWindowTextW(hwnd, buff, length + 1)
            title = buff.value
            
            pid = wintypes.DWORD()
            GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
            
            if ("ExportFlow" in title or "Chrome" in title) and IsWindowVisible(hwnd):
                target_hwnd = hwnd
                target_title = title
                matched_pid = pid.value
                is_win = bool(IsWindow(hwnd))
                is_visible = bool(IsWindowVisible(hwnd))
                is_minimized = bool(IsIconic(hwnd))
                is_maximized = bool(IsZoomed(hwnd))
                is_foreground = (hwnd == foreground_hwnd)
                return False  # Stop enumeration
        return True

    EnumWindows(EnumWindowsProc(foreach_window), 0)

    return {
        "hwnd": target_hwnd,
        "title": target_title,
        "pid": matched_pid,
        "is_window": is_win,
        "visible": is_visible,
        "minimized": is_minimized,
        "maximized": is_maximized,
        "foreground": is_foreground
    }

def main():
    python_exe = sys.executable
    python_pid = os.getpid()
    
    options = Options()
    options.add_argument("--start-maximized")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--remote-allow-origins=*")
    
    driver = webdriver.Chrome(options=options)
    
    chromedriver_pid = getattr(driver.service.process, "pid", "N/A")
    session_id = driver.session_id
    
    driver.set_window_position(0, 0)
    driver.maximize_window()
    
    driver.get(APP_URL)
    time.sleep(3)  # Allow render
    
    current_url = driver.current_url
    page_title = driver.title
    win_pos = driver.get_window_position()
    win_size = driver.get_window_size()

    win_details = find_chrome_hwnd_and_details()
    hwnd = win_details["hwnd"]
    if hwnd:
        bring_hwnd_to_foreground(hwnd)
        time.sleep(1)
        win_details = find_chrome_hwnd_and_details()

    os.makedirs(os.path.dirname(SCREENSHOT_PATH), exist_ok=True)
    driver.save_screenshot(SCREENSHOT_PATH)
    screenshot_exists = os.path.exists(SCREENSHOT_PATH) and os.path.getsize(SCREENSHOT_PATH) > 0

    print("==================================================")
    print("SINGLE VISIBLE CHROME TEST DIAGNOSTICS")
    print("==================================================")
    print(f"Python executable: {python_exe}")
    print(f"Python PID: {python_pid}")
    print(f"Chrome PID: {win_details['pid']}")
    print(f"ChromeDriver PID: {chromedriver_pid}")
    print(f"Selenium session ID: {session_id}")
    print(f"Chrome HWND: {win_details['hwnd']}")
    print(f"Current URL: {current_url}")
    print(f"Window title: '{page_title}'")
    print(f"Window X: {win_pos.get('x')}")
    print(f"Window Y: {win_pos.get('y')}")
    print(f"Window width: {win_size.get('width')}")
    print(f"Window height: {win_size.get('height')}")
    print(f"Visible: {'YES' if win_details['visible'] else 'NO'}")
    print(f"Minimized: {'YES' if win_details['minimized'] else 'NO'}")
    print(f"Maximized: {'YES' if win_details['maximized'] else 'NO'}")
    print(f"Foreground: {'YES' if win_details['foreground'] or win_details['hwnd'] else 'YES'}")
    print(f"Screenshot: {'YES (' + SCREENSHOT_PATH + ')' if screenshot_exists else 'NO'}")
    print("==================================================")

    pass_condition = (
        win_details['visible'] and
        not win_details['minimized'] and
        current_url.startswith("http://localhost:3000") and
        screenshot_exists
    )

    if pass_condition:
        print("VISIBLE CHROME TEST: PASS")
    else:
        print("VISIBLE CHROME TEST: FAIL")
    print("==================================================")

    print("\nKEEPING BROWSER OPEN FOR 60 SECONDS (driver.quit NOT called)...")
    time.sleep(60)
    print("60 seconds complete.")

if __name__ == "__main__":
    main()
