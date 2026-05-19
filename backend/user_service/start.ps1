# Start User Service with environment variables from .env
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

Write-Host "Starting User Service on port $env:USER_SERVICE_PORT"
Write-Host "DB: $env:USER_DB_URL`n"

./mvnw spring-boot:run
