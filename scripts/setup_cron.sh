#!/bin/bash
# Get the absolute path to this script and project
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CRON_JOB="0 * * * * cd $PROJECT_DIR && node scripts/send_report.cjs >> $PROJECT_DIR/cron_report.log 2>&1"

# Check if cron job already exists in crontab (either hourly or old 6am)
(crontab -l 2>/dev/null | grep -F "scripts/send_report.cjs") >/dev/null

if [ $? -eq 0 ]; then
  # Remove old report jobs first to avoid duplicates
  crontab -l 2>/dev/null | grep -v -F "scripts/send_report.cjs" | crontab -
fi

# Append new hourly cron job to crontab
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
echo "Cron job successfully updated to run hourly in crontab (to dynamically evaluate user preferred report hours)."
