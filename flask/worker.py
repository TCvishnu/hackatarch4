import schedule
import time
from htmlParser import johnsFunction
def my_job():
    print("Running daily job...")
    johnsFunction("mobile")
    

schedule.every().day.at("22:51").do(my_job)  
while True:
    schedule.run_pending()
    time.sleep(60)