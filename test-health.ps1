# Brixem AI Health Check Script
# Run this after setting up environment variables

Write-Host "🔍 Brixem AI Health Check Starting..." -ForegroundColor Cyan
Write-Host ""

# Test Environment Variables
Write-Host "1. Testing Environment Variables..." -ForegroundColor Yellow
try {
    $envTest = Invoke-RestMethod -Uri "http://localhost:3000/api/test-env" -Method GET
    if ($envTest.groqApiKey -ne "NOT LOADED" -and $envTest.supabaseUrl -ne "NOT LOADED") {
        Write-Host "   ✅ Environment variables loaded" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Environment variables missing" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Environment test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Database Connection
Write-Host "2. Testing Database Connection..." -ForegroundColor Yellow
try {
    $dbTest = Invoke-RestMethod -Uri "http://localhost:3000/api/test-db" -Method GET
    Write-Host "   ✅ Database connected successfully" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Database connection failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Authentication
Write-Host "3. Testing Authentication..." -ForegroundColor Yellow
try {
    $authTest = Invoke-RestMethod -Uri "http://localhost:3000/api/test-auth" -Method GET
    Write-Host "   ✅ Authentication working" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Authentication failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Projects API
Write-Host "4. Testing Projects API..." -ForegroundColor Yellow
try {
    $projectsTest = Invoke-RestMethod -Uri "http://localhost:3000/api/projects" -Method GET
    Write-Host "   ✅ Projects API working" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Projects API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test AI Chat
Write-Host "5. Testing AI Chat..." -ForegroundColor Yellow
try {
    $chatBody = @{
        messages = @(
            @{
                role = "user"
                text = "Hello, test message"
            }
        )
    } | ConvertTo-Json -Depth 3

    $chatTest = Invoke-RestMethod -Uri "http://localhost:3000/api/chat" -Method POST -ContentType "application/json" -Body $chatBody
    Write-Host "   ✅ AI Chat working" -ForegroundColor Green
} catch {
    Write-Host "   ❌ AI Chat failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Health Check Complete!" -ForegroundColor Cyan
Write-Host "If all tests pass, you've achieved 95%+ health! 🚀" -ForegroundColor Green
