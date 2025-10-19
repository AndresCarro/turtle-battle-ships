#!/usr/bin/env bash

# Archivo de credenciales
CRED_FILE="$(pwd)/aws-credentials"

echo "==============================="
echo "🔐 ACTUALIZAR CREDENCIALES AWS"
echo "==============================="
echo ""

# Pedir credenciales al usuario
read -p "👉 AWS_ACCESS_KEY_ID: " AWS_ACCESS_KEY_ID
read -p "👉 AWS_SECRET_ACCESS_KEY: " AWS_SECRET_ACCESS_KEY
read -p "👉 AWS_SESSION_TOKEN: " AWS_SESSION_TOKEN

# Crear / sobrescribir archivo de credenciales
cat > "$CRED_FILE" <<EOF
[default]
aws_access_key_id = $AWS_ACCESS_KEY_ID
aws_secret_access_key = $AWS_SECRET_ACCESS_KEY
aws_session_token = $AWS_SESSION_TOKEN
EOF

# Exportar variables de entorno
export AWS_SHARED_CREDENTIALS_FILE="$CRED_FILE"
export AWS_DEFAULT_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY"
export AWS_SESSION_TOKEN="$AWS_SESSION_TOKEN"

echo ""
echo "✅ Credenciales actualizadas en:"
echo "   $CRED_FILE"
echo "✅ Variables de entorno exportadas"
echo ""
aws sts get-caller-identity