# Cognito Module

Este módulo configura AWS Cognito para autenticación de usuarios en el proyecto Turtle Battleships.

## ⚠️ Limitaciones de AWS Lab

**IMPORTANTE**: Este módulo está adaptado para funcionar con las limitaciones de AWS Academy Labs:

- **Identity Pool DESHABILITADO**: Los labs no permiten crear roles IAM (`iam:CreateRole`)
- **Solo User Pool**: Funciona únicamente con User Pool y User Pool Client
- **Sin federación de identidades**: No se puede usar AWS SDK con credenciales temporales

Para entornos de producción, descomenta los recursos de Identity Pool en `main.tf`.

## Componentes Creados (AWS Lab)

### User Pool ✅
- **User Pool**: Pool principal para gestión de usuarios
- **User Pool Client**: Cliente de aplicación (SPA sin client secret)
- **User Pool Domain**: Dominio personalizado para Hosted UI

### Identity Pool ❌ (Deshabilitado)
- **Identity Pool**: Comentado debido a limitaciones de IAM
- **IAM Roles**: No se pueden crear en AWS Labs

## Configuración

### Variables de Entrada

- `project_name`: Nombre del proyecto para prefijos de recursos
- `callback_urls`: URLs de callback permitidas (donde Cognito redirige después del login)
- `logout_urls`: URLs de logout permitidas
- `tags`: Tags a aplicar a todos los recursos

### Salidas

- `user_pool_id`: ID del User Pool
- `user_pool_client_id`: ID del Cliente de aplicación
- `user_pool_domain`: Dominio del User Pool
- `user_pool_hosted_ui_url`: URL completa del Hosted UI
- `identity_pool_id`: ID del Identity Pool

## Configuración Actual

### Flujos OAuth Habilitados
- **Authorization Code**: Para el flujo principal del callback
- **Implicit**: Para compatibilidad (aunque no recomendado para producción)

### Scopes OAuth
- `openid`: Identifica el usuario
- `email`: Acceso al email del usuario
- `profile`: Acceso al perfil básico

### Validez de Tokens
- **Access Token**: 60 minutos
- **ID Token**: 60 minutos  
- **Refresh Token**: 30 días

## URLs para Testing

Una vez desplegado, el Hosted UI estará disponible en:
```
https://{domain}.auth.{region}.amazoncognito.com/login?client_id={client_id}&response_type=code&scope=email+openid+profile&redirect_uri={callback_url}
```

## Flujo de Autenticación Propuesto

1. Usuario accede al frontend en S3
2. Frontend redirige a Cognito Hosted UI
3. Cognito redirige a `/callback` (Lambda a través de API Gateway)
4. Lambda:
   - Intercambia el `code` por tokens
   - Redirige al frontend con tokens
5. Frontend procesa los tokens y los almacena

## Siguientes Pasos

1. ✅ Crear la infraestructura de Cognito
2. 🔄 Crear Lambda para manejar el callback
3. 🔄 Integrar con API Gateway
4. 🔄 Actualizar frontend para usar Cognito
5. 🔄 Configurar URLs reales de producción

## Notas de Seguridad

- El cliente de aplicación no tiene secret (apropiado para SPAs)
- Se previenen errores de existencia de usuarios
- SSL/TLS requerido para URLs de callback en producción
- Tokens con validez limitada para mayor seguridad