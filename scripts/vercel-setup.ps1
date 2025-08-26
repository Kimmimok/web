# vercel-setup.ps1
# Usage: Open PowerShell in repository root and run:
#   .\scripts\vercel-setup.ps1
# This script helps you install/vercel CLI, link the project, and add environment variables.
# It is interactive for safety. Do NOT store secrets in this script.

param(
    [string]$AppendUrl = "https://script.google.com/macros/s/XXX/exec",
    [string]$AppendToken = "your_token_here",
    [string]$Environment = "production",
    [switch]$UseProxy
)

function Ensure-NodeAndVercel {
    Write-Host "Checking vercel CLI..."
    $v = (Get-Command vercel -ErrorAction SilentlyContinue)
    if (-not $v) {
        Write-Host "vercel CLI not found. Installing globally via npm..."
        npm i -g vercel
    } else {
        Write-Host "vercel CLI found: $($v.Path)"
    }
}

function Run-Vercel-Setup {
    Write-Host "Logging in to Vercel (interactive)..."
    vercel login
    Write-Host "Linking local directory to a Vercel project (interactive)..."
    vercel link

    Write-Host "Adding environment variables to Vercel project ($Environment)..."
    # Add variables interactively (recommended) so CLI won't echo secrets in logs
    vercel env add REACT_APP_SHEET_APPEND_URL $Environment
    vercel env add REACT_APP_SHEET_APPEND_TOKEN $Environment
    if ($UseProxy) {
        vercel env add REACT_APP_USE_PROXY $Environment
    }

    Write-Host "Listing environment variables for verification:"
    vercel env ls

    Write-Host "Trigger a new deployment (optional). You can push to the linked branch or run vercel --prod." 
    Write-Host "To deploy now (confirm when prompted): vercel --prod"
}

# Main
Ensure-NodeAndVercel
Run-Vercel-Setup

Write-Host "Done. Remember to revoke old tokens if they were leaked and update Apps Script properties as needed."
