Set-Location "c:\Users\ASUS\Desktop\Clone\Success-Sprout"
Write-Host "Current location: $(Get-Location)"
Write-Host "Git status:"
& git status --short
Write-Host "`nStaging changes..."
& git add .
Write-Host "Committing..."
& git commit -m "chore: Remove all Supabase references - Pure MERN stack only"
Write-Host "Pushing to GitHub..."
& git push origin main
Write-Host "Done!"
