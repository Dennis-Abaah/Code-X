#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate

# Create superuser if it doesn't exist
if [[ $CREATE_SUPERUSER ]]; then
  python manage.py createsuperuser --no-input || true
fi