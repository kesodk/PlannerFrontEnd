# 🚀 Deployment Guide - Student Administration System

## ⚠️ Vigtigt

Dette system består af **to dele** der begge skal deployes:

1. **Backend API** (Laravel + MySQL)
2. **Frontend** (React + Vite)

## Backend Deployment

### Option 1: Shared Hosting (anbefalet til start)

**Krav:**
- PHP 8.3+
- MySQL database
- Composer support

**Populære udbydere:**
- Simply.com (DK)
- One.com (DK)
- DigitalOcean App Platform
- Heroku

**Steps:**
1. Upload Laravel projekt til server
2. Kør `composer install --optimize-autoloader --no-dev`
3. Sæt `.env` til production:
   ```
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://yourdomain.com
   ```
4. Generer app key: `php artisan key:generate`
5. Kør migrations: `php artisan migrate --force`
6. Seed database: `php artisan db:seed --force`
7. Sæt web root til `/public` mappen

### Option 2: VPS (Advanced)

**Udbydere:**
- DigitalOcean Droplet
- Linode
- AWS EC2

**Server Stack:**
- Ubuntu 22.04 LTS
- Nginx
- PHP 8.3-FPM
- MySQL 8.0
- Certbot (SSL)

**Guide:** [Laravel Deployment Documentation](https://laravel.com/docs/11.x/deployment)

---

## Frontend Deployment

### Option 1: Vercel (Anbefalet)

**Fordele:**
- Gratis hosting
- Automatisk CI/CD fra GitHub
- CDN worldwide
- SSL inkluderet

**Steps:**
1. Push projekt til GitHub
2. Gå til [vercel.com](https://vercel.com)
3. Log ind med GitHub
4. Klik "New Project"
5. Vælg dit GitHub repository
6. Konfigurer:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
7. Tilføj environment variable:
   ```
   VITE_API_URL=https://your-backend-api.com/api
   ```
8. Deploy!

### Option 2: Netlify

**Steps:**
1. Byg projektet lokalt: `npm run build`
2. Gå til [netlify.com](https://netlify.com)
3. Drag & drop `dist` mappen

**Eller med GitHub:**
1. Forbind Netlify til GitHub repo
2. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### Option 3: Traditional Web Server

**Krav:**
- Apache eller Nginx
- Static file hosting

**Steps:**
1. Build production:
   ```bash
   npm run build
   ```
2. Upload `dist/` folder til server
3. Configuration `.htaccess` (Apache):
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

---

## Environment Configuration

### Frontend `.env.production`

```env
VITE_API_URL=https://your-backend-domain.com/api
```

### Backend `.env` (Production)

```env
APP_NAME="Student Administration API"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-backend-domain.com

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=student_admin
DB_USERNAME=production_user
DB_PASSWORD=secure_password_here

# CORS
FRONTEND_URL=https://your-frontend-domain.com

# Sessions
SESSION_DRIVER=database
SESSION_LIFETIME=120

# Cache
CACHE_DRIVER=database
QUEUE_CONNECTION=database
```

---

## Post-Deployment Checklist

### Backend
- [ ] Run migrations: `php artisan migrate --force`
- [ ] Seed database: `php artisan db:seed --force`
- [ ] Clear cache: `php artisan config:cache`
- [ ] Optimize: `php artisan optimize`
- [ ] Test API endpoints
- [ ] Check logs: `storage/logs/laravel.log`
- [ ] Setup SSL certificate
- [ ] Configure CORS for frontend domain

### Frontend
- [ ] Verify API_URL points to production backend
- [ ] Test login functionality
- [ ] Test all CRUD operations
- [ ] Check browser console for errors
- [ ] Test on mobile devices
- [ ] Setup custom domain (optional)

---

## Database Backup

**Anbefalet:**
- Daily automated backups
- Keep at least 7 days of backups

**Manual backup:**
```bash
mysqldump -u root -p student_admin > backup_$(date +%Y%m%d).sql
```

**Restore:**
```bash
mysql -u root -p student_admin < backup_20260224.sql
```

---

## Monitoring

**Backend:**
- Laravel Horizon (queue monitoring)
- Laravel Telescope (debugging)
- Server monitoring (CPU, RAM, disk)

**Frontend:**
- Vercel Analytics (hvis brugt)
- Google Analytics (optional)
- Error tracking: Sentry

---

## 🔐 Security Checklist

- [ ] SSL/HTTPS aktiveret
- [ ] `APP_DEBUG=false` i production
- [ ] Strong database passwords
- [ ] Firewall konfigureret
- [ ] Regular updates (Laravel, packages)
- [ ] API rate limiting
- [ ] Backup strategy implementeret
- [ ] Error logs monitoreret

---

## 🆘 Troubleshooting Deployment

### Backend issues
- Check PHP version: `php -v`
- Check Laravel logs
- Verify database connection
- Test with `php artisan tinker`

### Frontend issues
- Check build errors locally first
- Verify environment variables
- Test API connection
- Check browser console

---

## 📚 Useful Resources

- [Laravel Deployment](https://laravel.com/docs/11.x/deployment)
- [Vite Production Build](https://vitejs.dev/guide/build.html)
- [Vercel Documentation](https://vercel.com/docs)
- [Nginx Laravel Config](https://laravel.com/docs/11.x/deployment#nginx)

