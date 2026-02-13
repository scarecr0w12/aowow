# AoWoW Deployment Guide

**Version**: 1.0  
**Last Updated**: February 5, 2026

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Production Setup](#production-setup)
3. [Security Hardening](#security-hardening)
4. [Performance Optimization](#performance-optimization)
5. [Monitoring](#monitoring)
6. [Backup Strategy](#backup-strategy)
7. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Code Preparation

- [ ] All tests passing (100% pass rate)
- [ ] Code reviewed and approved
- [ ] No debug code or commented sections
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Static assets optimized
- [ ] Documentation updated

### Infrastructure

- [ ] Web server configured (Apache/Nginx)
- [ ] PHP 8.0+ installed and configured
- [ ] MySQL 8.0+ / MariaDB 10.5+ installed
- [ ] SSL certificate installed
- [ ] Firewall rules configured
- [ ] Backup system in place
- [ ] Monitoring tools configured

### Security

- [ ] `.env` file created (not in git)
- [ ] Database credentials secured
- [ ] File permissions set correctly
- [ ] Debug mode disabled
- [ ] Error reporting configured for production
- [ ] HTTPS enforced
- [ ] Security headers configured

---

## Production Setup

### 1. Server Requirements

**Minimum**:
- CPU: 2 cores
- RAM: 4 GB
- Disk: 50 GB SSD
- Bandwidth: 100 Mbps

**Recommended**:
- CPU: 4+ cores
- RAM: 8+ GB
- Disk: 100+ GB SSD
- Bandwidth: 1 Gbps

### 2. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PHP 8.0+
sudo apt install php8.0 php8.0-fpm php8.0-mysql php8.0-mbstring \
    php8.0-xml php8.0-curl php8.0-gd php8.0-zip -y

# Install MySQL
sudo apt install mysql-server -y

# Install web server (Nginx example)
sudo apt install nginx -y
```

### 3. Configure Web Server

**Nginx Configuration** (`/etc/nginx/sites-available/aowow`):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com;

    root /var/www/aowow;
    index index.php index.html;

    # SSL Configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # PHP Processing
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Static Files
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }

    location ~ /(config|setup|tests)/ {
        deny all;
    }
}
```

### 4. Deploy Application

```bash
# Clone repository
cd /var/www
git clone https://github.com/azerothcore/aowow.git
cd aowow

# Set up environment
cp setup/.env.example setup/.env
nano setup/.env  # Edit with production credentials

# Generate configuration
cd setup
./generate-db-secure.sh

# Set permissions
chmod 755 /var/www/aowow
chmod 777 /var/www/aowow/cache
chmod 777 /var/www/aowow/cache/template
chmod 600 /var/www/aowow/config/config.php
chown -R www-data:www-data /var/www/aowow
```

### 5. Database Setup

```bash
# Import database
mysql -u root -p < setup/aowow_update.sql

# Configure profiler (if using)
mysql -u root -p aowow
UPDATE aowow_config SET value = '1' WHERE `key` = 'profiler_enable';
```

---

## Security Hardening

### 1. File Permissions

```bash
# Application files (read-only for web server)
find /var/www/aowow -type f -exec chmod 644 {} \;
find /var/www/aowow -type d -exec chmod 755 {} \;

# Writable directories
chmod 777 /var/www/aowow/cache
chmod 777 /var/www/aowow/cache/template

# Sensitive files
chmod 600 /var/www/aowow/config/config.php
chmod 600 /var/www/aowow/setup/.env
```

### 2. PHP Configuration

Edit `/etc/php/8.0/fpm/php.ini`:

```ini
# Security
expose_php = Off
display_errors = Off
display_startup_errors = Off
log_errors = On
error_log = /var/log/php/error.log

# Performance
memory_limit = 512M
max_execution_time = 60
upload_max_filesize = 10M
post_max_size = 10M

# Session Security
session.cookie_httponly = 1
session.cookie_secure = 1
session.use_strict_mode = 1
```

### 3. Database Security

```sql
-- Create dedicated database user
CREATE USER 'aowow_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON aowow.* TO 'aowow_user'@'localhost';
GRANT SELECT ON world.* TO 'aowow_user'@'localhost';
GRANT SELECT ON characters.* TO 'aowow_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

---

## Performance Optimization

### 1. Enable Caching

```sql
UPDATE aowow_config SET value = '1' WHERE `key` = 'cache_mode';
UPDATE aowow_config SET value = '604800' WHERE `key` = 'cache_decay';
```

### 2. PHP OpCache

Edit `/etc/php/8.0/fpm/php.ini`:

```ini
opcache.enable=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=10000
opcache.revalidate_freq=60
```

### 3. MySQL Optimization

Edit `/etc/mysql/my.cnf`:

```ini
[mysqld]
innodb_buffer_pool_size = 2G
innodb_log_file_size = 512M
max_connections = 200
query_cache_size = 64M
query_cache_type = 1
```

### 4. CDN Configuration

Use a CDN for static assets:
- Images: `/static/images/`
- CSS: `/static/css/`
- JavaScript: `/static/js/`
- Models: `/static/models/`

---

## Monitoring

### 1. Application Monitoring

```bash
# Check PHP-FPM status
sudo systemctl status php8.0-fpm

# Check error logs
tail -f /var/log/php/error.log
tail -f /var/log/nginx/error.log
```

### 2. Database Monitoring

```sql
-- Check slow queries
SHOW FULL PROCESSLIST;

-- Check table sizes
SELECT table_name, 
       ROUND(((data_length + index_length) / 1024 / 1024), 2) AS "Size (MB)"
FROM information_schema.TABLES
WHERE table_schema = 'aowow'
ORDER BY (data_length + index_length) DESC;
```

### 3. Server Monitoring

```bash
# CPU and Memory
htop

# Disk usage
df -h

# Network
iftop
```

---

## Backup Strategy

### 1. Database Backup

```bash
#!/bin/bash
# /usr/local/bin/backup-aowow-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/aowow"

mkdir -p $BACKUP_DIR

mysqldump -u root -p aowow | gzip > $BACKUP_DIR/aowow_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "aowow_*.sql.gz" -mtime +7 -delete
```

### 2. File Backup

```bash
#!/bin/bash
# /usr/local/bin/backup-aowow-files.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/aowow"

tar -czf $BACKUP_DIR/aowow_files_$DATE.tar.gz \
    /var/www/aowow \
    --exclude='/var/www/aowow/cache/*'

# Keep only last 7 days
find $BACKUP_DIR -name "aowow_files_*.tar.gz" -mtime +7 -delete
```

### 3. Automated Backups

```bash
# Add to crontab
crontab -e

# Daily database backup at 2 AM
0 2 * * * /usr/local/bin/backup-aowow-db.sh

# Weekly file backup on Sunday at 3 AM
0 3 * * 0 /usr/local/bin/backup-aowow-files.sh
```

---

## Troubleshooting

### Common Issues

**1. White Screen / 500 Error**
- Check PHP error log: `/var/log/php/error.log`
- Check Nginx error log: `/var/log/nginx/error.log`
- Verify file permissions
- Check database connection

**2. Slow Performance**
- Enable caching
- Optimize database queries
- Check server resources
- Enable OpCache

**3. Profiler Not Working**
- Check profiler queue: `php prQueue`
- Verify database connections
- Check character sync status
- Run: `./sync_profiles.sh --status`

**4. Database Connection Failed**
- Verify credentials in `config/config.php`
- Check MySQL service: `sudo systemctl status mysql`
- Test connection: `mysql -u user -p`

---

**For more information**, see:
- `docs/ARCHITECTURE.md` - System architecture
- `docs/DEVELOPMENT_GUIDE.md` - Development practices
- `docs/COMPLETED_TASKS_SUMMARY.md` - Recent changes

