"""
Cron Job Configuration Guide
==========================

This file documents how to set up automated scripts to run on a schedule.

LINUX/MAC (using crontab):
=========================

1. Open crontab editor:
   crontab -e

2. Add the following lines:

   # Run billing check daily at 2:00 AM
   0 2 * * * cd /path/to/super-admin-panel && python automation/scripts/billing_check.py

   # Generate daily analytics report at 8:00 AM
   0 8 * * * cd /path/to/super-admin-panel && python automation/scripts/analytics_report.py --period daily

   # Generate weekly report on Mondays at 9:00 AM
   0 9 * * 1 cd /path/to/super-admin-panel && python automation/scripts/analytics_report.py --period weekly

   # Generate monthly report on the 1st at 10:00 AM
   0 10 1 * * cd /path/to/super-admin-panel && python automation/scripts/analytics_report.py --period monthly

3. Make sure the .env file is in the root directory with MONGODB_URI set

WINDOWS (using Task Scheduler):
===============================

1. Open Task Scheduler
2. Create Basic Task
3. Set Trigger (Daily, Weekly, Monthly as needed)
4. Set Action:
   - Program: python.exe or python3.exe
   - Arguments: C:\path\to\automation\scripts\billing_check.py
   - Start in: C:\path\to\super-admin-panel

5. Create separate tasks for each script

DOCKER (using docker cron):
============================

Add to Dockerfile:
  RUN apt-get install -y cron
  COPY crontab /etc/cron.d/super-admin-cron
  RUN chmod 0644 /etc/cron.d/super-admin-cron
  CMD cron && node backend/server.js

PYTHON SCHEDULE LIBRARY:
=========================

Alternative: Use Python schedule library

Create automation/run_scheduler.py:

  import schedule
  import time
  import subprocess
  
  def run_billing_check():
      subprocess.run(['python', 'automation/scripts/billing_check.py'])
  
  def run_analytics():
      subprocess.run(['python', 'automation/scripts/analytics_report.py', '--period', 'daily'])
  
  # Schedule tasks
  schedule.every().day.at("02:00").do(run_billing_check)
  schedule.every().day.at("08:00").do(run_analytics)
  
  while True:
      schedule.run_pending()
      time.sleep(60)

Then run with:
  python automation/run_scheduler.py

"""

print(__doc__)
