# 🐢 Turtle Battle Ships — Cloud Computing

Este proyecto es una configuración mínima de **Terraform** para desplegar infraestructura en **AWS** usando credenciales temporales del **AWS Learner Lab**.

## 📁 Estructura del proyecto

```
.
├── .env
├── aws-credentials
├── main.tf
└── README.md
```

- `main.tf` → archivo principal de Terraform (definición de recursos)  
- `aws-credentials` → credenciales temporales de AWS  
- `.env` → variables de entorno que apuntan a `aws-credentials`  
- `README.md` → documentación del proyecto

---

## 🧰 Requisitos previos

- [Terraform](https://developer.hashicorp.com/terraform/downloads) instalado  
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) instalado  
- Una cuenta de **AWS Learner Lab** activa (vía AWS Academy u otro programa educativo)  
- macOS o Linux (también funciona en WSL2 en Windows)

---

## 🔑 Configuración de credenciales (Primera vez)

1. Iniciá tu **AWS Learner Lab** y esperá que esté activo.  
2. Hacé clic en **“AWS CLI Credentials”** y copiá:
   - `AWS Access Key ID`
   - `AWS Secret Access Key`
   - `AWS Session Token`
3. Creá el archivo `aws-credentials` en la raíz del proyecto con este contenido:

   ```ini
   [default]
   aws_access_key_id = TU_ACCESS_KEY
   aws_secret_access_key = TU_SECRET_KEY
   aws_session_token = TU_SESSION_TOKEN
   ```

4. Crea el archivo `.env` con este contenido:

   ```bash
   export AWS_SHARED_CREDENTIALS_FILE=$(pwd)/aws-credentials
   export AWS_DEFAULT_REGION=us-east-1
   ```

5. Cargá las variables en la terminal:

   ```bash
   source .env
   ```

6. Verificá que las credenciales funcionan:

   ```bash
   aws sts get-caller-identity
   ```

---

## ⚡ Renovar credenciales cuando el lab expira

Las credenciales del Learner Lab expiran cada pocas horas. Cuando esto pasa, vas a ver errores como:

```
InvalidClientTokenId: The security token included in the request is invalid.
```

Para solucionarlo:

1. Volvé al Learner Lab y obtené nuevas credenciales temporales.
2. Editá el archivo `aws-credentials` y reemplazá las credenciales viejas.
3. Limpiá variables viejas del entorno:

   ```bash
   unset AWS_ACCESS_KEY_ID
   unset AWS_SECRET_ACCESS_KEY
   unset AWS_SESSION_TOKEN
   unset AWS_SHARED_CREDENTIALS_FILE
   ```

4. Volvé a cargar `.env`:

   ```bash
   source .env
   ```

5. Verificá nuevamente:

   ```bash
   aws sts get-caller-identity
   ```

6. Reinicializá Terraform para forzar que use las nuevas credenciales:

   ```bash
   terraform init -reconfigure
   terraform plan
   ```

✅ Si `aws sts get-caller-identity` funciona, Terraform también.

---

## 🏗️ Inicializar Terraform

1. Inicializa el proyecto:
   ```bash
   terraform init
   ```

2. Previsualiza el plan de infraestructura:
   ```bash
   terraform plan
   ```

3. Aplica la configuración para crear recursos:
   ```bash
   terraform apply
   ```

   Cuando te pregunte:
   ```
   Do you want to perform these actions?
   ```
   respondé con `yes`.

---

## 🧼 Destruir recursos

Para borrar la infraestructura creada y no dejar recursos activos:

```bash
terraform destroy
```

👉 Importante: Esto es útil en Learner Lab, ya que los recursos activos se pierden al finalizar la sesión.

---

## 📝 Ejemplo de `main.tf`

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.5.0"
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "ejemplo" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
}
```

---

## 🪟 Tutorial para Windows

### ✅ Opción 1 — WSL (recomendada)

1. Instalar WSL2.  
2. Instalar Ubuntu desde Microsoft Store.  
3. Seguir exactamente los mismos pasos que en macOS/Linux.

### 🧰 Opción 2 — PowerShell

1. Crear el archivo `aws-credentials` con tus credenciales.
2. Configurar variables de entorno en PowerShell:

   ```powershell
   $env:AWS_SHARED_CREDENTIALS_FILE = "C:\ruta\a\tu\proyecto\aws-credentials"
   $env:AWS_DEFAULT_REGION = "us-east-1"
   ```

3. Verificar credenciales:

   ```powershell
   aws sts get-caller-identity
   ```

4. Ejecutar Terraform normalmente:

   ```powershell
   terraform init
   terraform plan
   terraform apply
   terraform destroy
   ```

---

## 📎 Consejos finales

- **No subas** `aws-credentials` ni `.env` a ningún repo público.  
- Siempre validá tus credenciales con `aws sts get-caller-identity` antes de correr Terraform.  
- Si obtenés `InvalidClientTokenId`, **actualizá el token**, no toques Terraform primero.  
- Destruí recursos al finalizar para evitar errores en la próxima sesión.

---

## 👨‍💻 Autor

Proyecto base creado para prácticas de infraestructura como código con Terraform y AWS Learner Lab.
