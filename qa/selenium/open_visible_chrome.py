import os
import sys
import time
import getpass
import subprocess
import ctypes
from ctypes import wintypes
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

sys.stdout.reconfigure(line_buffering=True)

APP_URL = "http://localhost:3000/login"

def bring_to_foreground(hwnd):
    """Forcefully restores, maximizes, and brings window to the foreground."""
    user32 = ctypes.windll.user32
    try:
        user32.ShowWindow(hwnd, 9)  # SW_RESTORE
        user32.ShowWindow(hwnd, 3)  # SW_SHOWMAXIMIZED
        user32.BringWindowToTop(hwnd)
        user32.SetForegroundWindow(hwnd)
    except Exception as e:
        print(f"Error bringing HWND to foreground: {e}")

def get_deep_windows_diagnostics(target_pid=None):
    """Extracts Windows OS Session, Username, Window Rectangle, Monitor, and Foreground details."""
    user32 = ctypes.windll.user32
    kernel32 = ctypes.windll.kernel32
    
    username = getpass.getuser()
    session_id = wintypes.DWORD()
    kernel32.ProcessIdToSessionId(os.getpid(), ctypes.byref(session_id))
    
    fg_hwnd = user32.GetForegroundWindow()
    fg_length = user32.GetWindowTextLengthW(fg_hwnd)
    fg_title = ""
    if fg_length > 0:
        buff = ctypes.create_unicode_buffer(fg_length + 1)
        user32.GetWindowTextW(fg_hwnd, buff, fg_length + 1)
        fg_title = buff.value

    # Find Chrome HWND and Details
    EnumWindows = user32.EnumWindows
    EnumWindowsProc = ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
    GetWindowTextW = user32.GetWindowTextW
    GetWindowTextLengthW = user32.GetWindowTextLengthW
    IsWindowVisible = user32.IsWindowVisible
    GetWindowThreadProcessId = user32.GetWindowThreadProcessId
    GetWindowRect = user32.GetWindowRect
    MonitorFromWindow = user32.MonitorFromWindow

    target_hwnd = None
    target_title = ""
    rect_str = "Unknown"
    monitor_handle = "Unknown"

    def foreach_window(hwnd, lParam):
        nonlocal target_hwnd, target_title, rect_str, monitor_handle
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
                
                # Get Window Rectangle
                rect = wintypes.RECT()
                if GetWindowRect(hwnd, ctypes.byref(rect)):
                    rect_str = f"Left={rect.left}, Top={rect.top}, Right={rect.right}, Bottom={rect.bottom} (Width={rect.right - rect.left}, Height={rect.bottom - rect.top})"
                
                # Get Monitor Handle
                hmon = MonitorFromWindow(hwnd, 2)  # MONITOR_DEFAULTTONEAREST
                monitor_handle = f"hMonitor {hmon}"
                return False  # Stop searching
        return True

    EnumWindows(EnumWindowsProc(foreach_window), 0)

    return {
        "username": username,
        "session_id": session_id.value,
        "fg_hwnd": fg_hwnd,
        "fg_title": fg_title,
        "chrome_hwnd": target_hwnd,
        "chrome_title": target_title,
        "rect_str": rect_str,
        "monitor": monitor_handle
    }

def main():
    print("==================================================")
    print("LAUNCHING VISIBLE CHROME FOR PHYSICAL MONITOR TEST")
    print("==================================================")
    
    python_exe = sys.executable
    python_pid = os.getpid()
    
    options = Options()
    # ABSOLUTELY NO HEADLESS ARGUMENTS
    options.add_argument("--start-maximized")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--remote-allow-origins=*")
    
    driver = webdriver.Chrome(options=options)
    chromedriver_pid = getattr(driver.service.process, "pid", "N/A")
    
    # Explicitly position at (0,0), set size, and maximize
    driver.set_window_position(0, 0)
    driver.set_window_size(1200, 800)
    driver.maximize_window()
    
    print("Navigating Chrome to application URL:", APP_URL)
    driver.get(APP_URL)
    time.sleep(3)  # Allow initial load
    
    # Get Windows API Diagnostics
    diag = get_deep_windows_diagnostics()
    if diag["chrome_hwnd"]:
        bring_to_foreground(diag["chrome_hwnd"])
        time.sleep(1)
        diag = get_deep_windows_diagnostics()

    # Get Chrome PID from tasklist
    chrome_pid = "N/A"
    try:
        output = subprocess.check_output("tasklist /FI \"IMAGENAME eq chrome.exe\" /FO CSV", shell=True, text=True)
        for line in output.splitlines():
            if "chrome.exe" in line:
                parts = [p.strip('"') for p in line.split(',')]
                if len(parts) >= 2 and parts[1].isdigit():
                    chrome_pid = parts[1]
                    break
    except Exception:
        pass

    print("\n==================================================")
    print("PHYSICAL WINDOW & ENVIRONMENT DIAGNOSTICS:")
    print("==================================================")
    print(f"Windows username: {diag['username']}")
    print(f"Windows session ID: Session {diag['session_id']}")
    print(f"Python PID: {python_pid}")
    print(f"Chrome PID: {chrome_pid}")
    print(f"ChromeDriver PID: {chromedriver_pid}")
    print(f"Chrome HWND: {diag['chrome_hwnd']}")
    print(f"Monitor containing HWND: {diag['monitor']}")
    print(f"Window rectangle: {diag['rect_str']}")
    print(f"Foreground HWND: {diag['fg_hwnd']}")
    print(f"Foreground window title: '{diag['fg_title']}'")
    print(f"Application URL: {driver.current_url}")
    print("==================================================")
    print("\nKEEPING CHROME OPEN INDEFINITELY FOR YOUR PHYSICAL VISUAL INSPECTION.")
    print("DO NOT CLOSE. Press Ctrl+C in terminal when finished.\n")

    # Keep alive indefinitely without calling driver.quit() or driver.close()
    try:
        while True:
            time.sleep(10)
    except KeyboardInterrupt:
        print("Manual exit requested.")

if __name__ == "__main__":
    main()
