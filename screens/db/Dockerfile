# Utilise une image PHP avec Apache
FROM php:8.1-apache

# Active les extensions PHP nécessaires
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Copie les fichiers de l'application
COPY . /var/www/html/

# Configure Apache
RUN a2enmod rewrite
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf
RUN echo "DirectoryIndex index.php index.html" >> /etc/apache2/apache2.conf
RUN chown -R www-data:www-data /var/www/html

# Expose le port 80
EXPOSE 80