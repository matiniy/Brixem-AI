# PowerShell script to update Groq model in Vercel
Write-Host "Updating GROQ_MODEL to llama-3.3-70b-versatile..."

# Update for all environments
$environments = @("production", "preview", "development")

foreach ($env in $environments) {
    Write-Host "Updating $env environment..."
    echo "llama-3.3-70b-versatile" | npx vercel env add GROQ_MODEL $env
}

Write-Host "Done! GROQ_MODEL updated to llama-3.3-70b-versatile"
