# Add Node.js to Windows Firewall (REQUIRES ADMIN PRIVILEGES)
# This script creates firewall rules to allow Node.js network access

Write-Host "`n$('='*60)`n"
Write-Host "Windows Firewall Configuration for Node.js Backend"
Write-Host "$('='*60)`n"

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "❌ ERROR: This script must be run as Administrator!`n"
    Write-Host "Please:`n"
    Write-Host "1. Right-click on PowerShell or this script"
    Write-Host "2. Select 'Run as Administrator'"
    Write-Host "3. Try again`n"
    exit 1
}

Write-Host "✅ Running with Administrator privileges`n"

# Node.js executable path
$nodePath = "C:\Program Files\nodejs\node.exe"

if (-not (Test-Path $nodePath)) {
    Write-Host "❌ ERROR: Node.js not found at: $nodePath`n"
    exit 1
}

Write-Host "📍 Node.js path: $nodePath`n"

# Create firewall rules
Write-Host "Creating firewall rules...`n"

try {
    # Inbound rule for port 8080
    Write-Host "  Adding inbound rule for port 8080..."
    New-NetFirewallRule -DisplayName "Node.js Backend (Inbound)" `
        -Program $nodePath `
        -Direction Inbound `
        -Action Allow `
        -Protocol TCP `
        -LocalPort 8080 `
        -ErrorAction SilentlyContinue
    Write-Host "    ✅ Rule created`n"
    
    # Outbound rule
    Write-Host "  Adding outbound rule..."
    New-NetFirewallRule -DisplayName "Node.js Backend (Outbound)" `
        -Program $nodePath `
        -Direction Outbound `
        -Action Allow `
        -Protocol TCP `
        -ErrorAction SilentlyContinue
    Write-Host "    ✅ Rule created`n"
    
    Write-Host "$('='*60)`n"
    Write-Host "✅ Firewall rules configured successfully!`n"
    Write-Host "Next steps:`n"
    Write-Host "1. Start the backend: npm run dev"
    Write-Host "2. Test health endpoint: http://localhost:8080/health"
    Write-Host "3. If it works, the issue was the firewall`n"
    Write-Host "$('='*60)`n"
    
} catch {
    Write-Host "❌ Error creating firewall rules: $_`n"
    exit 1
}
