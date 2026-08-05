sudo nano /etc/nginx/sites-available/buildnex

server {
    server_name buildnexdev.in www.buildnexdev.in;

    root /var/www/frontend/frontend/dist;
    index index.html;

    # Serve static files correctly
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Fix MIME issue for assets
    location /assets/ {
        try_files $uri =404;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/buildnexdev.in/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/buildnexdev.in/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot


}
server {
    if ($host = www.buildnexdev.in) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    if ($host = buildnexdev.in) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name buildnexdev.in www.buildnexdev.in;
    return 404; # managed by Certbot

}