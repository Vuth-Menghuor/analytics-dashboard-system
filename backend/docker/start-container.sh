#!/usr/bin/env sh
set -eu

: "${PORT:=10000}"

# Render provides PORT at runtime. Apache's default configuration listens on 80.
sed -i "s/^Listen .*/Listen ${PORT}/" /etc/apache2/ports.conf
sed "s/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/" \
  /etc/apache2/sites-available/000-default.conf.bak \
  > /etc/apache2/sites-available/000-default.conf
sed -i 's#DocumentRoot /var/www/html#DocumentRoot /var/www/html/public#' \
  /etc/apache2/sites-available/000-default.conf

php artisan migrate --force
php artisan db:seed --force
php artisan storage:link || true
php artisan config:cache
php artisan route:cache

exec apache2-foreground
