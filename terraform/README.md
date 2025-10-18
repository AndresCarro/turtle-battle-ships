# 🐢 Turtle Battle Ships — Cloud Computing - WIPPPP

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

## 🔑 Configuración de credenciales

1. Inicia tu **AWS Learner Lab** y espera que esté activo.  
2. Haz clic en **“AWS CLI Credentials”** y copia:
   - `AWS Access Key ID`
   - `AWS Secret Access Key`
   - `AWS Session Token`

3. Crea el archivo `aws-credentials` y pega las credenciales:

   ```ini
   [default]
   aws_access_key_id = TU_ACCESS_KEY
   aws_secret_access_key = TU_SECRET_KEY
   aws_session_token = TU_SESSION_TOKEN
   ```

4. Crea el archivo `.env` ya está preparado para apuntar a ese archivo:

   ```bash
   export AWS_SHARED_CREDENTIALS_FILE=$(pwd)/aws-credentials
   export AWS_DEFAULT_REGION=us-east-1
   ```

5. Cargá las variables de entorno en la terminal:

   ```bash
   source .env
   ```

6. Verificá que las credenciales funcionan:

   ```bash
   aws sts get-caller-identity
   ```

   Si todo está bien, obtendrás un JSON con tu identidad de sesión.

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
   responde con `yes`.

---

## 🧼 Destruir recursos

Para borrar la infraestructura creada y no dejar recursos activos:

```bash
terraform destroy
```

👉 **Importante:** Esto es muy útil cuando usás Learner Lab, ya que los recursos que quedan activos después de cerrar la sesión se pierden igualmente.

---

## ⚠️ Notas importantes sobre Learner Lab

- Las credenciales expiran cuando se termina el laboratorio (normalmente 2 h).  
- Cuando recibas nuevas credenciales, **solo tenés que reemplazarlas** en `aws-credentials`.  
- No subas este archivo a ningún repositorio público. Agregalo a tu `.gitignore`:
  ```
  aws-credentials
  .env
  ```

---

## 📚 Comandos útiles

| Comando                      | Descripción                                   |
|------------------------------|-----------------------------------------------|
| `terraform fmt`              | Formatea los archivos `.tf`                   |
| `terraform validate`         | Valida la sintaxis y consistencia             |
| `terraform init`             | Inicializa el proyecto y descarga providers   |
| `terraform plan`             | Muestra lo que se va a crear/modificar        |
| `terraform apply`           | Aplica cambios en la infraestructura          |
| `terraform destroy`          | Elimina todos los recursos creados           |

---

## 📝 Ejemplo de recurso en `main.tf`

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

# Ejemplo: instancia EC2
resource "aws_instance" "ejemplo" {
  ami           = "ami-0c55b159cbfafe1f0" # Cambiar según la región
  instance_type = "t2.micro"
}
```

---

## 🧠 Recomendaciones

- Actualizá tus credenciales cada vez que inicies un nuevo Learner Lab.
- Usá `terraform plan` antes de aplicar para evitar errores.
- Destruí los recursos al terminar para no dejar nada colgado.
- Versioná solo los `.tf` y el `README.md` — no subas credenciales.

---

## 👨‍💻 Autor

Proyecto base creado por **[Tu Nombre]** — para prácticas de infraestructura como código con Terraform y AWS.

```
MIT License
```


---

## 🪟 Tutorial para Windows

Si estás usando **Windows**, hay dos formas recomendadas de trabajar con Terraform y AWS Learner Lab:

### ✅ Opción 1 — Usar WSL (recomendada)

1. **Instalá WSL2** (Subsistema de Windows para Linux) siguiendo esta guía oficial:  
   👉 [https://learn.microsoft.com/windows/wsl/install](https://learn.microsoft.com/windows/wsl/install)

2. Instala **Ubuntu** desde Microsoft Store.  
3. Abre Ubuntu y seguí exactamente los mismos pasos que en este README para macOS/Linux:  
   - Instalar Terraform (`brew` no es necesario — podés usar `wget` o `apt`)  
   - Crear `.env` y `aws-credentials`  
   - Usar `source .env`  
   - Ejecutar `terraform init`, `plan`, `apply`, etc.

📌 *Ventaja:* Es el entorno más parecido a Linux real, compatible con todos los comandos nativos.

---

### 🧰 Opción 2 — Usar PowerShell nativo

Si preferís no instalar WSL:

1. **Instalá Terraform** para Windows desde el sitio oficial:  
   👉 [https://developer.hashicorp.com/terraform/downloads](https://developer.hashicorp.com/terraform/downloads)  
   - Descargá el ZIP
   - Extraé `terraform.exe` y agregalo a tu `PATH`

2. **Instalá AWS CLI para Windows**:  
   👉 [https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

3. Crea un archivo llamado `aws-credentials` en tu carpeta del proyecto con este formato:

   ```ini
   [default]
   aws_access_key_id = TU_ACCESS_KEY
   aws_secret_access_key = TU_SECRET_KEY
   aws_session_token = TU_SESSION_TOKEN
   ```

4. Configura las variables de entorno en PowerShell (reemplazando `<RUTA>`):

   ```powershell
   $env:AWS_SHARED_CREDENTIALS_FILE = "C:\ruta\a\tu\proyecto\aws-credentials"
   $env:AWS_DEFAULT_REGION = "us-east-1"
   ```

5. Verificá que todo funciona:
   ```powershell
   aws sts get-caller-identity
   ```

6. Luego podés usar Terraform directamente en PowerShell:
   ```powershell
   terraform init
   terraform plan
   terraform apply
   terraform destroy
   ```

💡 *Consejo:* Podés guardar los comandos de exportación en un archivo `.ps1` (script de PowerShell) para no tener que escribirlos cada vez.

---

### 📎 Tip extra

Si usás Visual Studio Code en Windows, podés abrir tu proyecto en **WSL** directamente (con la extensión “Remote - WSL”) y trabajar como si estuvieras en Linux. Esto evita muchos problemas de compatibilidad.

