# Start API Gateway with environment variables from .env
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

Write-Host "Starting API Gateway on port $env:API_GATEWAY_PORT"
Write-Host "Config Server: $env:CONFIG_SERVER_URL`n"

./mvnw spring-boot:run
