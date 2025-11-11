#!/bin/bash

# ============================================
# Script de Instalación: Nginx + Certbot
# Para Ubuntu Server
# ============================================

set -e  # Salir si hay algún error

echo "🚀 Iniciando configuración de Nginx + Certbot..."
echo "=================================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variables
DOMAIN="tigertech.com.mx"
WWW_DOMAIN="www.tigertech.com.mx"
EMAIL="equipotigretech@gmail.com"
PROJECT_DIR="$HOME/var/www/PLANIFICADOR-HABITOS-WEB"

# Función para imprimir mensajes
print_step() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# ============================================
# 1. Verificar que estamos en Ubuntu
# ============================================
echo "1️⃣  Verificando sistema operativo..."
if [ -f /etc/os-release ]; then
    . /etc/os-release
    if [[ "$ID" != "ubuntu" ]]; then
        print_error "Este script está diseñado para Ubuntu"
        exit 1
    fi
    print_step "Sistema: $PRETTY_NAME"
else
    print_error "No se puede determinar el sistema operativo"
    exit 1
fi
echo ""

# ============================================
# 2. Actualizar sistema
# ============================================
echo "2️⃣  Actualizando sistema..."
sudo apt update
print_step "Sistema actualizado"
echo ""

# ============================================
# 3. Instalar Nginx
# ============================================
echo "3️⃣  Instalando Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install nginx -y
    print_step "Nginx instalado"
else
    print_warning "Nginx ya está instalado"
fi

sudo systemctl enable nginx
sudo systemctl start nginx
print_step "Nginx habilitado y corriendo"
echo ""

# ============================================
# 4. Instalar Certbot
# ============================================
echo "4️⃣  Instalando Certbot..."
if ! command -v certbot &> /dev/null; then
    sudo apt install certbot python3-certbot-nginx -y
    print_step "Certbot instalado"
else
    print_warning "Certbot ya está instalado"
fi
echo ""

# ============================================
# 5. Configurar Firewall
# ============================================
echo "5️⃣  Configurando firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw --force enable
    print_step "Firewall configurado"
else
    print_warning "UFW no está instalado, saltando configuración de firewall"
fi
echo ""

# ============================================
# 6. Crear configuración temporal de Nginx
# ============================================
echo "6️⃣  Creando configuración temporal de Nginx..."
sudo tee /etc/nginx/sites-available/planificador > /dev/null <<EOF
# Configuración temporal para validación de Certbot
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN $WWW_DOMAIN;

    # Permitir que Certbot valide el dominio
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Proxy temporal al contenedor
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Activar el sitio
sudo ln -sf /etc/nginx/sites-available/planificador /etc/nginx/sites-enabled/

# Eliminar configuración por defecto si existe
if [ -f /etc/nginx/sites-enabled/default ]; then
    sudo rm /etc/nginx/sites-enabled/default
fi

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
print_step "Configuración temporal de Nginx creada"
echo ""

# ============================================
# 7. Verificar que el dominio apunte al servidor
# ============================================
echo "7️⃣  Verificando DNS..."
SERVER_IP=$(curl -s ifconfig.me)
DOMAIN_IP=$(dig +short $DOMAIN | tail -n1)

echo "   IP del servidor: $SERVER_IP"
echo "   IP del dominio: $DOMAIN_IP"

if [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
    print_warning "El dominio no apunta a este servidor"
    echo "   Por favor, configura los registros DNS antes de continuar"
    echo "   Presiona Enter cuando el DNS esté configurado..."
    read
fi
print_step "DNS verificado"
echo ""

# ============================================
# 8. Verificar que los contenedores estén corriendo
# ============================================
echo "8️⃣  Verificando contenedores de Docker..."
cd $PROJECT_DIR

if ! docker compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    print_warning "Los contenedores no están corriendo. Iniciando..."
    docker compose -f docker-compose.prod.yml up -d
    sleep 10
fi

if curl -s http://localhost:8080 > /dev/null; then
    print_step "Contenedores corriendo correctamente"
else
    print_error "El frontend no responde en el puerto 8080"
    echo "   Verifica que los contenedores estén corriendo:"
    echo "   docker compose -f docker-compose.prod.yml ps"
    exit 1
fi
echo ""

# ============================================
# 9. Obtener certificado SSL con Certbot
# ============================================
echo "9️⃣  Obteniendo certificado SSL..."
echo "   Dominio: $DOMAIN"
echo "   Email: $EMAIL"
echo ""

if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    sudo certbot --nginx \
        -d $DOMAIN \
        -d $WWW_DOMAIN \
        --non-interactive \
        --agree-tos \
        --email $EMAIL \
        --redirect
    
    print_step "Certificado SSL obtenido"
else
    print_warning "El certificado ya existe"
fi
echo ""

# ============================================
# 10. Copiar configuración final de Nginx
# ============================================
echo "🔟 Aplicando configuración final de Nginx..."
if [ -f "$PROJECT_DIR/nginx-server.conf" ]; then
    sudo cp $PROJECT_DIR/nginx-server.conf /etc/nginx/sites-available/planificador
    sudo nginx -t
    sudo systemctl reload nginx
    print_step "Configuración final aplicada"
else
    print_warning "No se encontró nginx-server.conf, usando configuración de Certbot"
fi
echo ""

# ============================================
# 11. Verificar renovación automática
# ============================================
echo "1️⃣1️⃣  Configurando renovación automática..."
sudo certbot renew --dry-run
print_step "Renovación automática configurada"
echo ""

# ============================================
# Resumen
# ============================================
echo "=================================================="
echo -e "${GREEN}✅ Configuración completada exitosamente${NC}"
echo "=================================================="
echo ""
echo "📊 Resumen:"
echo "   • Nginx: Instalado y corriendo"
echo "   • Certbot: Instalado"
echo "   • Certificado SSL: Obtenido para $DOMAIN"
echo "   • Firewall: Configurado (puertos 22, 80, 443)"
echo "   • Renovación automática: Configurada"
echo ""
echo "🌐 Tu sitio está disponible en:"
echo "   https://$DOMAIN"
echo "   https://$WWW_DOMAIN"
echo ""
echo "🔍 Verificaciones:"
echo "   • Estado de Nginx: sudo systemctl status nginx"
echo "   • Certificados: sudo certbot certificates"
echo "   • Logs: sudo tail -f /var/log/nginx/planificador_error.log"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Actualiza el archivo .env con REACT_APP_API_URL=https://$DOMAIN"
echo "   2. Reconstruye el frontend: docker compose -f docker-compose.prod.yml up -d --build frontend"
echo "   3. Abre https://$DOMAIN en tu navegador"
echo ""
