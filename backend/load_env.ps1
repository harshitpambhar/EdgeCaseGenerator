# Load .env file and set environment variables
$envFile = "t:\D-drive\TestCaseGenerator\backend\.env"
$content = Get-Content $envFile

foreach ($line in $content) {
    if ($line -match '^\s*#' -or $line -match '^\s*$') {
        continue
    }
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $matches[1]
        $value = $matches[2]
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
        Write-Host "Set: $key"
    }
}

Write-Host "`nEnvironment variables loaded successfully!`n"
Write-Host "AUTH_DB_URL: $env:AUTH_DB_URL"
Write-Host "USER_DB_URL: $env:USER_DB_URL"
Write-Host "DB_USERNAME: $env:DB_USERNAME"
Write-Host "`n--- Ready to start services ---`n"
