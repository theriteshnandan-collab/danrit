param (
    [string]$msg = "Update: Code improvements"
)

Write-Host "🚀 Preparing to ship..." -ForegroundColor Cyan

# Add all changes
git add .

# Commit
git commit -m "$msg"

# Push
Write-Host "📦 Pushing to origin..." -ForegroundColor Yellow
git push origin main

if ($?) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Deployment failed." -ForegroundColor Red
}
