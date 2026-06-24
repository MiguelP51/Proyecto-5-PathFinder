$envFile = Join-Path (Get-Item -Path ".\..").FullName ".env"
Get-Content $envFile | Where-Object { $_ -notmatch "^#" -and $_ -match "=" } | ForEach-Object {
    $name, $value = $_.Split('=', 2)
    $name = $name.Trim()
    $value = $value.Trim()
    [System.Environment]::SetEnvironmentVariable($name, $value, "Process")
}
[System.Environment]::SetEnvironmentVariable("DB_HOST", "localhost", "Process")
[System.Environment]::SetEnvironmentVariable("BACKEND_URL", "http://localhost:8080", "Process")
[System.Environment]::SetEnvironmentVariable("SPRING_PROFILES_ACTIVE", "test", "Process")

./mvnw spring-boot:run
