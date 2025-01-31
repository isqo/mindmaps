FROM php:7.4-fpm

# Update packages and install composer and PHP dependencies.
RUN apt-get update && \
  DEBIAN_FRONTEND=noninteractive apt-get install -y \
    default-mysql-client \
    libpq-dev \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libmcrypt-dev \
    libbz2-dev \
    libzip-dev \
    libonig-dev \
    cron \
    && pecl install mcrypt-1.0.4 \
    && docker-php-ext-enable mcrypt \
    && pecl channel-update pecl.php.net \
    && pecl install apcu

# PHP Extensions
RUN docker-php-ext-install zip bz2 mbstring pdo pdo_mysql pcntl \
&& docker-php-ext-configure gd --with-freetype --with-jpeg \
&& docker-php-ext-install -j$(nproc) gd

# Memory Limit
RUN echo "memory_limit=2048M" > $PHP_INI_DIR/conf.d/memory-limit.ini
RUN echo "max_execution_time=900" >> $PHP_INI_DIR/conf.d/memory-limit.ini
RUN echo "extension=apcu.so" > $PHP_INI_DIR/conf.d/apcu.ini
RUN echo "post_max_size=20M" >> $PHP_INI_DIR/conf.d/memory-limit.ini
RUN echo "upload_max_filesize=20M" >> $PHP_INI_DIR/conf.d/memory-limit.ini

# Time Zone
RUN echo "date.timezone=${PHP_TIMEZONE:-UTC}" > $PHP_INI_DIR/conf.d/date_timezone.ini

# Display errors in stderr
RUN echo "display_errors=stderr" > $PHP_INI_DIR/conf.d/display-errors.ini

# Disable PathInfo
RUN echo "cgi.fix_pathinfo=0" > $PHP_INI_DIR/conf.d/path-info.ini

# Disable expose PHP
RUN echo "expose_php=0" > $PHP_INI_DIR/conf.d/path-info.ini

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

ADD . /var/www/html
WORKDIR /var/www/html

RUN touch storage/logs/laravel.log

RUN composer install
RUN php artisan cache:clear
RUN php artisan config:cache
RUN php artisan storage:link

RUN chown -R www-data:www-data /var/www
RUN chmod -R 755 /var/www/html/
RUN chmod -R 755 /var/www/html/public/storage
RUN chmod -R 755 /var/www/html/storage

RUN touch /var/log/cron.log
COPY .env.example .env
 
RUN php artisan key:generate
RUN php artisan config:cache

CMD ["/bin/bash", "-c", "php-fpm -D | tail -f storage/logs/laravel.log"]