from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

import pyautogui
import glob
import os
import time
import timeit
import re
import csv
import json

FOLDER_NAME = "RebuildIMGs" # change to a folder with similar substructure for longer reruns
LONG_PAUSE = 0 # change to 10 for long reruns
FDR_OVERWRITE = "FinalProject"

FOLDERS = glob.glob("%s//*//" % FOLDER_NAME)
MOBIUS_LINK = "https://mobius.design-automation.net/gallery"
MOB_JSON = "mob_files.json"
MOB_DICT = {}
if os.path.isfile(MOB_JSON): # retain previous data in reruns
    with open(MOB_JSON, "rt", encoding="utf-8") as json_f:
        MOB_DICT = json.load(json_f)

SHORT_TIMEOUT = 1 # give enough time for element to appear
LONG_TIMEOUT = 300  # give enough time for loading to finish (Maximum wait time)
LOADING_ELEMENT_ID = "spinner-div"
SCREEN_SZ = pyautogui.size()
TOP = 45 # compensate for top banner
SS_REGION = (int(SCREEN_SZ[0]*0.4 + 7), TOP, int(SCREEN_SZ[0]*0.6 - 7), int(((SCREEN_SZ[1]-TOP)*0.66) - 6)) # left top width height, viewer location

try:
    for folder in FOLDERS:
        FDR_NAME = re.search(r"\\(.+?)\\", folder).group(1)
        mob_files = glob.glob("%s*.mob" % folder)

        driver = webdriver.Chrome()
        driver.fullscreen_window()
        driver.get(MOBIUS_LINK)
        driver.find_element_by_xpath("//*[@id='settings_button']").click()
        time.sleep(SHORT_TIMEOUT)
        driver.find_element_by_xpath("//*[@id='settingsTab']/tab[1]/div/div/dl/dd[5]/div[2]/label/span[2]").click()
        driver.find_element_by_xpath("//*[@id='modal-window']/div/button[1]").click()
        for mob_file in mob_files:
            error = False
            file_path = os.path.abspath(mob_file)
            file_name = re.search(r"(.+?)\.mob", re.sub(re.sub(r"\\", r"\\\\", folder),"", mob_file)).group(1)

            driver.find_element_by_xpath("//*[@id='dropdownMenuButton']").click()
            driver.find_element_by_xpath("//*[@id='dropdownMenu']/button[3]").click()
            
            time.sleep(SHORT_TIMEOUT)
            pyautogui.typewrite(file_path)
            pyautogui.hotkey("enter")
            start = timeit.default_timer()
            try:
                WebDriverWait(driver, SHORT_TIMEOUT).until(EC.visibility_of_element_located((By.ID, LOADING_ELEMENT_ID)))
                WebDriverWait(driver, LONG_TIMEOUT).until(EC.invisibility_of_element_located((By.ID, LOADING_ELEMENT_ID)))
            except TimeoutException:
                pass
            time.sleep(LONG_PAUSE) # for huge models
            print("File Successfully Loaded")
            try:
                driver.find_element_by_xpath("//*[@id='zoomingfit']").click()
            except NoSuchElementException:
                print("Error in file: %s" % file_path)
                error = True
                driver.find_element_by_xpath("//*[@id='3D Viewer']").click() # return to 3D viewer
                driver.find_element_by_xpath("//*[@id='zoomingfit']").click()
            time.sleep(SHORT_TIMEOUT*2)
            run_time = timeit.default_timer() - start
            if error:
                run_time = -1
            print("Time Elapsed: %s" % str(run_time))
            pyautogui.screenshot("%s.png" % (folder + file_name), region=SS_REGION)

            published_mob_path = re.sub(FOLDER_NAME, FDR_OVERWRITE,mob_file)
            MOB_DICT[file_name] = dict(
                group=FDR_NAME,
                mob_path=published_mob_path,
                img_path=re.sub("\.mob",".png",published_mob_path),
                run_time=run_time
            ) 
        driver.close()
    with open("mob_files.json", "wt", encoding="utf-8") as json_f:
        json.dump(MOB_DICT, json_f, ensure_ascii=False, indent=4)
except Exception as e:
    driver.close()
    raise e
