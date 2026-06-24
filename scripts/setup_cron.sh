#!/bin/bash
# Get the absolute path to this script and project
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CRON_JOB="0 6 * * * cd $PROJECT_DIR && node scripts/send_report.js >> $PROJECT_DIR/cron_report.log 2>&1"

# Check if cron job already exists in crontab
(crontab -l 2>/dev/null | grep -F "scripts/send_report.js") >/dev/null

if [ $? -eq 0 ]; then
  echo "Cron job already exists in crontab."
else
  # Append cron job to existing crontab
  (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
  echo "Cron job successfully added to crontab to run daily at 6:00 AM."
fi
