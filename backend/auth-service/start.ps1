# Start Auth Service with environment variables from .env
$envFile = "..\.env"
$content = Get-Content $envFile

foreach ($line in $content) {
    if ($line -match '^\s*#' -or $line -match '^\s*$') {
        continue
    }
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $matches[1]
        $value = $matches[2]
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

Write-Host "Starting Auth Service on port $env:AUTH_SERVICE_PORT"
Write-Host "DB: $env:AUTH_DB_URL`n"

./mvnw spring-boot:run
