# Guía de Despliegue de Infraestructura con Terraform en AWS

Esta guía detalla los pasos para instalar las herramientas necesarias (AWS CLI y Terraform), configurar tus accesos e implementar la infraestructura réplica para el entorno de producción (rama `main`) del proyecto **PathFinder**.

---

## 1. Requisitos Previos e Instalación de Herramientas

### Paso A: Instalar AWS CLI
El AWS CLI es necesario para que Terraform se autentique con tu cuenta de AWS.

- **Windows (PowerShell)**:
  Descarga e instala el instalador MSI oficial ejecutando:
  ```powershell
  msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi /qn
  ```
  *Reinicia la consola después de la instalación para cargar la variable de entorno.*
  
- **macOS**:
  ```bash
  curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
  sudo installer -pkg AWSCLIV2.pkg -target /
  ```

- **Linux (Ubuntu/Debian)**:
  ```bash
  sudo apt update && sudo apt install unzip -y
  curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
  unzip awscliv2.zip
  sudo ./aws/install
  ```

Verifica la instalación con:
```bash
aws --version
```

---

### Paso B: Configurar Credenciales de AWS
1. Ve a la consola de AWS → **IAM** → **Users** → Selecciona tu usuario (o crea uno nuevo con permisos de administrador como `PowerUserAccess` o `AdministratorAccess`).
2. Haz clic en la pestaña **Security credentials** (Credenciales de seguridad) y presiona **Create access key** (Crear clave de acceso).
3. Selecciona *Command Line Interface (CLI)*, acepta y copia la **Access Key ID** y la **Secret Access Key**.
4. En tu terminal local, ejecuta:
   ```bash
   aws configure
   ```
5. Rellena los datos solicitados:
   - `AWS Access Key ID [None]:` (Pega tu Access Key ID)
   - `AWS Secret Access Key [None]:` (Pega tu Secret Access Key)
   - `Default region name [None]:` `us-east-1` (o la región que prefieras)
   - `Default output format [None]:` `json`

Comprueba la conexión con:
```bash
aws sts get-caller-identity
```

---

### Paso C: Instalar Terraform
Terraform es un archivo ejecutable binario único.

- **Windows (vía Chocolatey)**:
  ```powershell
  choco install terraform
  ```
  *O descárgalo directamente desde [Terraform Downloads](https://developer.hashicorp.com/terraform/install) y añade la ruta del ejecutable a tus Variables de Entorno (PATH).*

- **macOS (vía Homebrew)**:
  ```bash
  brew tap hashicorp/tap
  brew install hashicorp/tap/terraform
  ```

- **Linux (Ubuntu/Debian)**:
  ```bash
  wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
  echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com/gpg $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
  sudo apt update && sudo apt install terraform
  ```

Verifica la instalación con:
```bash
terraform -v
```

---

## 2. Configuración y Despliegue de la Infraestructura

### Paso A: Preparar las Variables de Terraform
1. Ubícate en la carpeta `terraform/` del proyecto:
   ```bash
   cd terraform
   ```
2. Copia el archivo de ejemplo dentro de la carpeta privada `private/` (que está ignorada en Git) para evitar subir contraseñas sensibles a GitHub:
   ```bash
   cp terraform.tfvars.example private/terraform.tfvars
   ```
3. Edita `private/terraform.tfvars` con tus credenciales y preferencias:
   - Ingresa el nombre de tu par de claves SSH (`ec2_key_name`) que ya tengas en AWS (necesaria para conectarte por SSH a la VM).
   - Elige una contraseña segura para la base de datos RDS (`db_password`).
   - Define el nombre único de tu bucket de S3 (`s3_bucket_name`).
   - Modifica el dominio (`domain_name`) y cambia `create_route53_records = true` solo si tienes una Hosted Zone preconfigurada en Route 53 en tu cuenta de AWS.

---

### Paso B: Ejecutar Terraform
Como el archivo `terraform.tfvars` ahora se encuentra resguardado dentro de la carpeta privada `private/`, debes indicarle a Terraform que lo lea utilizando el parámetro `-var-file`:

1. **Inicializar el proyecto** (descarga los proveedores necesarios):
   ```bash
   terraform init
   ```

2. **Validar la configuración** (verifica errores de sintaxis):
   ```bash
   terraform validate
   ```

3. **Ver el plan de ejecución** (muestra los recursos a crear leyendo las variables de la carpeta privada):
   ```bash
   terraform plan -var-file="private/terraform.tfvars"
   ```

4. **Aplicar los cambios** (crea la infraestructura en AWS, te solicitará escribir `yes` para confirmar):
   ```bash
   terraform apply -var-file="private/terraform.tfvars"
   ```

*Nota: La creación de la base de datos RDS PostgreSQL puede tardar entre 5 y 10 minutos. Una vez completado, verás las salidas (Outputs) en la consola con la IP de tu EC2 y el Endpoint de tu RDS.*

---

## 3. Conexión y Buenas Prácticas del Entorno

### Acceso SSH a la VM
El output de Terraform te dará el comando de conexión exacto:
```bash
ssh -i "~/.ssh/tu-clave-ssh-aws.pem" ubuntu@IP_PUBLICA_EC2
```

### Inicialización Automatizada del Servidor (Recomendado)
Para agilizar la instalación de Docker, Docker-Compose, Certbot, la configuración de memoria Swap y la clonación del repositorio de la rama `develop`, se ha creado un script automatizado en la carpeta privada `terraform/private/setup_vm.ps1`.

> [!IMPORTANT]
> **Nota de Seguridad:** La carpeta `terraform/private/` está añadida al `.gitignore` del proyecto para evitar subir archivos sensibles (como tu llave privada `.pem` y scripts con lógica de conexión) a GitHub.

#### Pasos para ejecutar la inicialización:
1. Coloca tu llave privada de producción `PathFinder_prod.pem` dentro de la carpeta `terraform/private/`.
2. Para evitar que Windows bloquee la conexión SSH debido a permisos muy abiertos de la llave `.pem`, ejecuta estos dos comandos en tu terminal de PowerShell dentro de `terraform/private/`:
   ```powershell
   icacls .\PathFinder_prod.pem /inheritance:r
   icacls .\PathFinder_prod.pem /grant:r "$($env:USERNAME):R"
   ```
3. Abre una terminal de **PowerShell** en tu máquina y navega a la carpeta:
   ```powershell
   cd terraform/private
   ```
4. Ejecuta el script con:
   ```powershell
   PowerShell -ExecutionPolicy Bypass -File .\setup_vm.ps1
   ```
5. El script se conectará al servidor por SSH, instalará Docker, Docker Compose, Certbot, habilitará un Swap de 2GB y luego generará una **llave SSH pública** dentro de la VM.
6. Copia la llave pública que saldrá en la terminal en color verde y regístrala en tus configuraciones de GitHub (`https://github.com/settings/ssh/new`) para dar acceso al repositorio.
7. Presiona **Enter** en la terminal y el script completará el proceso clonando automáticamente el repositorio de la rama `develop` en la VM.

### Configuración del `.env` en la VM
En la nueva máquina virtual creada, los contenedores correrán mediante `docker-compose`. Debes crear un archivo `/home/ubuntu/Proyecto-5-PathFinder/.env` con la siguiente estructura adaptada a producción:

```env
# Conexión Directa a la RDS Creada por Terraform
DB_HOST=TU_HOST_RDS_DE_LOS_OUTPUTS # ej. pathfinder-db-prod.xxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=pathfinder_prod
DB_USERNAME=pathfinder_prod
DB_PASSWORD=LA_CONTRASENA_QUE_PUSISTE_EN_TFVARS

JWT_SECRET=UNA_LLAVE_SECRETA_LARGA_DE_PRODUCCION

GOOGLE_CLIENT_ID=TU_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=TU_GOOGLE_CLIENT_SECRET

FRONTEND_URL=https://www.pathfinder.com  # Cambia por tu dominio
NEXTAUTH_URL=https://www.pathfinder.com
BACKEND_URL=http://backend:8080
NEXT_PUBLIC_BACKEND_URL=https://www.pathfinder.com/api

NEXTAUTH_SECRET=OTRA_LLAVE_COMPLEJA_PRODUCCION

# AWS S3 de Producción
AWS_REGION=us-east-1
AWS_BUCKET_NAME=pathfinder-storage-prod  # Tu bucket de producción

# =========================================================================
# NOTA IMPORTANTE DE SEGURIDAD (IAM ROLE):
# Como la instancia EC2 tiene asociado un "IAM Instance Profile" con permisos
# sobre el S3 bucket de producción, el Backend (Spring Boot) resolverá 
# automáticamente las credenciales temporales del rol.
#
# ¡NO necesitas ingresar AWS_ACCESS_KEY_ID ni AWS_SECRET_ACCESS_KEY aquí!
# =========================================================================
```

---

## 4. Gestión del Dominio y SSL con Certbot

1. Configura tus DNS (ej. apuntando `www.pathfinder.work.gd` y `pathfinder.work.gd` a la IP elástica pública provista por el output de Terraform).
2. Conéctate a la VM y una vez que los dominios propaguen, genera tu certificado SSL de Let's Encrypt ejecutando:
   ```bash
   sudo certbot certonly --webroot \
-w /home/ubuntu/Proyecto-5-PathFinder/certbot/www \
-d pathfinder.work.gd \
-d www.pathfinder.work.gd
   ```
3. Nginx estará listo para servir a través de HTTPS automáticamente usando el archivo `nginx.conf` que proveerá el GitHub Action de despliegue.
