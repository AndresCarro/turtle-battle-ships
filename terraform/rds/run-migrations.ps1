param (
    [Parameter(Mandatory=$true)]
    [string]$SecurityGroupId,
    
    [Parameter(Mandatory=$true)]
    [string]$Region,
    
    [Parameter(Mandatory=$true)]
    [string]$DbHost,
    
    [Parameter(Mandatory=$true)]
    [string]$DbName,
    
    [Parameter(Mandatory=$true)]
    [string]$DbUser,
    
    [Parameter(Mandatory=$true)]
    [string]$DbPassword
)

$ErrorActionPreference = "Stop"

# Obtener IP pública
$MyPublicIP = (Invoke-WebRequest -Uri "http://checkip.amazonaws.com" -UseBasicParsing).Content.Trim()
Write-Host "Your public IP is: $MyPublicIP"

try {
    Write-Host "Adding temporary access from $MyPublicIP to security group $SecurityGroupId..."
    aws ec2 authorize-security-group-ingress `
        --region $Region `
        --group-id $SecurityGroupId `
        --protocol tcp `
        --port 5432 `
        --cidr "$MyPublicIP/32"

    # Configurar Flyway
    $env:FLYWAY_URL      = "jdbc:postgresql://$($DbHost):5432/$DbName"
    $env:FLYWAY_USER     = $DbUser
    $env:FLYWAY_PASSWORD = $DbPassword
    
    Write-Host "Running Flyway migrations..."
    flyway migrate

    Write-Host "Migrations completed successfully."
}
catch {
    Write-Host "Error occurred: $_"
    throw
}
finally {
    Write-Host "Removing temporary access rule..."
    aws ec2 revoke-security-group-ingress `
        --region $Region `
        --group-id $SecurityGroupId `
        --protocol tcp `
        --port 5432 `
        --cidr "$MyPublicIP/32"
    
    Write-Host "Temporary access removed."
}
