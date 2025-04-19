FROM php:8.2-apache

RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli

COPY ./public /var/www/html/
COPY ./config /var/www/html/config/

EXPOSE 80
