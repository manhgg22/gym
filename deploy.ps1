# deploy.ps1

# Configuration
$Ec2User = "ec2-user"
$Ec2Host = "3.27.92.87"
$PemKey = "tshirtbackend.pem"
$RemotePath = "/home/ec2-user/gym"

Write-Host "🚀 Starting Deployment Process..." -ForegroundColor Cyan

# 0. Git Auto Push
$CommitMsg = Read-Host "Enter commit message (Leave empty to skip Git Push)"
if ($CommitMsg) {
    Write-Host "🐙 Pushing to Git..." -ForegroundColor Yellow
    git add .
    git commit -m "$CommitMsg"
    git push
}

# 1. Build Client Locally
Write-Host "📦 Building Client Locally..." -ForegroundColor Yellow
Set-Location client
try {
    npm install
    $env:VITE_API_BASE = "/api"
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Client build failed" }
} catch {
    Write-Error "Build failed. Exiting."
    exit 1
}
Set-Location ..

# 2. Compress Artifacts
# We need 'client/dist' and 'server' (excluding node_modules)
Write-Host "🗜️ Compressing Artifacts..." -ForegroundColor Yellow
$ArchiveName = "deploy_package.zip"

if (Test-Path $ArchiveName) { Remove-Item $ArchiveName }

# Create a temporary folder for packing
$TempDeploy = "temp_deploy"
if (Test-Path $TempDeploy) { Remove-Item $TempDeploy -Recurse -Force }
New-Item -ItemType Directory -Path $TempDeploy | Out-Null
New-Item -ItemType Directory -Path "$TempDeploy/client" | Out-Null

# Copy client dist
Copy-Item -Path "client/dist" -Destination "$TempDeploy/client" -Recurse

# Copy server (exclude node_modules)
# Copy server (exclude node_modules)
Copy-Item -Path "server" -Destination "$TempDeploy" -Recurse

# Cleanup unnecessary server files
$ServerExcludes = @("node_modules", ".git", ".gitignore", ".vscode", "test.js", "README.md", ".env")
foreach ($Item in $ServerExcludes) {
    if (Test-Path "$TempDeploy/server/$Item") {
        Remove-Item "$TempDeploy/server/$Item" -Recurse -Force
    }
}

# Compress
Compress-Archive -Path "$TempDeploy/*" -DestinationPath $ArchiveName

# Cleanup Temp
Remove-Item $TempDeploy -Recurse -Force

# 3. Upload to EC2
Write-Host "aaS Uploading to EC2..." -ForegroundColor Yellow
$ScpCommand = "scp -i $PemKey $ArchiveName ${Ec2User}@${Ec2Host}:/home/${Ec2User}/$ArchiveName"
Invoke-Expression $ScpCommand

if ($LASTEXITCODE -ne 0) {
    Write-Error "SCP Upload failed."
    exit 1
}

# 4. Extract and Restart on Server
Write-Host "🔄 Updating Server..." -ForegroundColor Yellow
$RemoteCommands = "
    # Stop errors from one command stopping the whole script? maybe not needed for unzip
    cd /home/$Ec2User
    
    # Unzip over the gym directory. 
    # Validating directory existence
    mkdir -p gym

    # Unzip
    unzip -o $ArchiveName -d gym/
    
    # Server cleanup & install
    cd gym/server
    npm install --production
    
    # Restart PM2 using Ecosystem file
    pm2 startOrReload ecosystem.config.cjs
    pm2 save
    
    # Cleanup zip
    rm ~/deploy_package.zip
    
    echo '✅ Deployment Complete!'
"

# Remove carriage returns for Linux compatibility
$RemoteCommands = $RemoteCommands -replace "`r", ""

# Use ssh to execute commands
# Note: We use -o StrictHostKeyChecking=no to avoid prompt issues if feasible, but user has connected before so likely fine.
ssh -i $PemKey ${Ec2User}@${Ec2Host} $RemoteCommands

Write-Host "✨ All Done!" -ForegroundColor Green
