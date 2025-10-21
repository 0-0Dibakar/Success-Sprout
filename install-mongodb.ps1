# Define download and installation paths
$downloadPath = "C:\Users\ASUS\Desktop\Sucess Sprout\mongodb-installer.msi"
$mongoDBPath = "C:\Program Files\MongoDB\Server\7.0\bin"
$dataPath = "C:\data\db"

# Create data directory if it doesn't exist
if (-not (Test-Path $dataPath)) {
    New-Item -ItemType Directory -Path $dataPath -Force
    Write-Host "Created MongoDB data directory at $dataPath"
}

# Download MongoDB installer if not already present
if (-not (Test-Path $downloadPath)) {
    Write-Host "Downloading MongoDB installer..."
    $url = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.2-signed.msi"
    Invoke-WebRequest -Uri $url -OutFile $downloadPath
    Write-Host "MongoDB installer downloaded successfully"
}

# Install MongoDB
Write-Host "Installing MongoDB..."
Start-Process msiexec.exe -ArgumentList "/i `"$downloadPath`" /quiet /qn /norestart ADDLOCAL=ServerService,Client,Router,MonitoringTools,ImportExportTools" -Wait

# Add MongoDB to PATH if not already added
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
if (-not ($env:Path -like "*MongoDB*")) {
    [System.Environment]::SetEnvironmentVariable("Path", $env:Path + ";$mongoDBPath", "Machine")
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
}

Write-Host "MongoDB installation completed!"
Write-Host "Starting MongoDB service..."

# Start MongoDB
try {
    Start-Process "$mongoDBPath\mongod.exe" -ArgumentList "--dbpath=`"$dataPath`"" -WindowStyle Hidden
    Write-Host "MongoDB service started successfully!"
} catch {
    Write-Host "Error starting MongoDB: $_"
}