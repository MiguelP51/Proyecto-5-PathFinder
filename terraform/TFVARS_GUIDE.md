# Guía de Configuración de Variables (`terraform.tfvars`)

Este documento explica detalladamente el propósito de cada variable en el archivo `terraform.tfvars` y qué valores debes cambiar para adecuarlo a tu cuenta de AWS y entorno de producción.

El archivo de variables debe estar ubicado en:
`terraform/private/terraform.tfvars`

---

## Variables que DEBES Personalizar Obligatoriamente

### 1. `ec2_key_name`
* **Descripción:** El nombre exacto de la llave SSH (Key Pair) que creaste o tienes registrada en tu consola de AWS (EC2 -> Key Pairs).
* **Ejemplo:** `"PathFinder_prod"`
* **IMPORTANTE:** Escribe solo el nombre que figura en la consola de AWS. **NO** incluyas la extensión `.pem` (es decir, no pongas `"PathFinder_prod.pem"`).

### 2. `db_password`
* **Descripción:** La contraseña maestra de administración para tu base de datos PostgreSQL de producción (RDS).
* **Ejemplo:** `"UnaContrasenaMuySeguraYCompleja2026!"`
* **IMPORTANTE:** Evita usar caracteres especiales raros que puedan romper los scripts de shell (usa letras, números, guiones y signos de exclamación standard). Anótala bien, ya que la necesitarás para el archivo `.env`.

### 3. `s3_bucket_name`
* **Descripción:** El nombre del bucket de S3 donde se guardarán los archivos/CVs en producción.
* **Ejemplo:** `"pathfinder-storage-prod"`
* **IMPORTANTE:** Los nombres de los buckets de S3 en AWS son **globalmente únicos**. Si otra persona en el mundo ya usa ese nombre, AWS rechazará la creación. Si te da error de nombre duplicado al hacer `terraform apply`, cámbialo a algo único (ej: `"pathfinder-storage-prod-miguel"`).

### 4. `domain_name`
* **Descripción:** El dominio público que utilizarás para la aplicación.
* **Ejemplo:** `"pathfinder.work.gd"` (o `"pathfinder.com"`).

---

## Variables de Configuración Opcionales (Valores por Defecto Recomendados)

### 5. `aws_region`
* **Descripción:** La región física de AWS donde se levantará toda la infraestructura.
* **Por defecto:** `"us-east-1"` (Norte de Virginia, suele ser la más económica y con todos los servicios disponibles).

### 6. `environment`
* **Descripción:** Nombre del entorno de despliegue.
* **Por defecto:** `"prod"`

### 7. `ec2_instance_type`
* **Descripción:** El tamaño de la máquina virtual EC2.
* **Por defecto:** `"t3.small"` (Tiene 2 vCPUs y 2GB de RAM, suficiente para correr Docker con Frontend, Backend y Nginx juntos gracias al Swap de 2GB).

### 8. `ec2_volume_size`
* **Descripción:** El tamaño en Gigabytes del disco duro raíz (SSD) de tu VM.
* **Por defecto:** `30` (AWS ofrece hasta 30GB dentro de la capa gratuita standard).

### 9. `db_instance_class`
* **Descripción:** El tamaño del servidor de base de datos RDS.
* **Por defecto:** `"db.t3.micro"` (Suficiente para producción inicial y compatible con capa gratuita).

### 10. `db_name` y `db_username`
* **Descripción:** El nombre de la base de datos inicial y el usuario administrador de la misma en PostgreSQL.
* **Por defecto:** `"pathfinder_prod"`

### 11. `create_route53_records`
* **Descripción:** Si tienes el dominio comprado y administrado directamente en **Route 53** en tu cuenta de AWS, cámbialo a `true` para que Terraform configure las DNS automáticamente.
* **Por defecto:** `false` (Recomendado si usas un proveedor de dominio externo como GoDaddy, Namecheap, etc. En este caso, configuras las DNS apuntando a la IP pública de la VM de forma manual).
