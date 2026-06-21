#!/usr/bin/env bash
set -e

echo "Running migrations..."
php artisan migrate --force

echo "Seeding database..."
php artisan db:seed --force --class=DatabaseSeeder

echo "Caching config..."
php artisan config:cache

echo "Done."
