# Instrucciones para Deploy de Cognito en AWS Academy

## Limitaciones de AWS Academy

⚠️ **IMPORTANTE**: AWS Academy Labs tienen las siguientes limitaciones:

1. **No se pueden crear roles IAM personalizados** - Solo se puede usar `LabRole`
2. **Identity Pool deshabilitado** - Requiere crear roles IAM
3. **S3 no puede manejar redirecciones dinámicas** - Necesitamos Lambda como intermediario

## Solución Implementada

### Flujo de Autenticación
1. Usuario accede al frontend en S3
2. Frontend redirige a Cognito Hosted UI
3. Cognito redirige a `/auth/callback` (endpoint de API Gateway que invoca Lambda)
4. Lambda:
   - Intercambia el `code` por tokens
   - Redirige al frontend con tokens en la URL
5. Frontend lee los tokens desde la URL y los almacena

## Proceso de Deploy (2 etapas)

### Etapa 1: Deploy inicial con URLs placeholder

1. **Verificar terraform.tfvars**: Las URLs están configuradas como placeholder
```hcl
cognito_config = {
  enabled = true
  callback_urls = [
    "https://placeholder-api-gateway-url.execute-api.us-east-1.amazonaws.com/dev/auth/callback"
  ]
  logout_urls = [
    "https://placeholder-frontend-bucket.s3-website-us-east-1.amazonaws.com/"
  ]
}
```

2. **Ejecutar primer deploy**:
```bash
terraform init
terraform plan
terraform apply
```

3. **Obtener URLs reales**:
```bash
terraform output cognito_callback_urls_needed
```

### Etapa 2: Actualizar URLs y redeploy

1. **Actualizar terraform.tfvars** con las URLs reales obtenidas del output

2. **Ejecutar segundo deploy**:
```bash
terraform plan
terraform apply
```

## Configuración Actual

### User Pool Client configurado para:
- **Flujo OAuth**: `authorization_code` (principal)
- **Scopes**: `email`, `openid`, `profile`
- **Sin client secret** (apropiado para SPAs)
- **Tokens válidos**: Access/ID tokens 60 min, Refresh token 30 días

### Recursos creados:
- ✅ **User Pool**: Gestión de usuarios
- ✅ **User Pool Client**: Cliente de aplicación SPA
- ✅ **User Pool Domain**: Dominio para Hosted UI
- ❌ **Identity Pool**: Deshabilitado (limitación AWS Academy)
- ❌ **IAM Roles**: Deshabilitados (limitación AWS Academy)

## Siguientes Pasos (fuera del scope de Terraform)

1. **Crear Lambda de callback** en `/lambdas/auth-callback-lambda/`
2. **Agregar endpoint `/auth/callback`** en API Gateway
3. **Implementar lógica de callback** en la Lambda:
   - Intercambiar code por tokens usando Cognito API
   - Redirigir al frontend con tokens
4. **Actualizar frontend** para usar Cognito Hosted UI

## Verificación

Una vez desplegado, verificar:
- ✅ User Pool creado en AWS Console
- ✅ Domain funcionando: `https://{domain}.auth.{region}.amazoncognito.com`
- ✅ Callback URL configurada correctamente
- ✅ Outputs de Terraform muestran configuración correcta

## URLs de Testing

El Hosted UI estará disponible en:
```
https://{domain}.auth.{region}.amazoncognito.com/login?client_id={client_id}&response_type=code&scope=email+openid+profile&redirect_uri={callback_url}
```

Los valores específicos se pueden obtener del output `cognito_config`.