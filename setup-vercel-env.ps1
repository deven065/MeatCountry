# Vercel Environment Variables Setup - PowerShell
# Run this in PowerShell to add all environment variables to Vercel

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Vercel Environment Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
try {
    vercel --version | Out-Null
    Write-Host "✅ Vercel CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
}

Write-Host ""
Write-Host "📝 Please login to Vercel..." -ForegroundColor Yellow
vercel login

Write-Host ""
Write-Host "🔗 Linking to your Vercel project..." -ForegroundColor Yellow
vercel link

Write-Host ""
Write-Host "📦 Adding environment variables..." -ForegroundColor Yellow
Write-Host ""

# Function to add environment variable
function Add-VercelEnv {
    param($name, $value)
    Write-Host "Adding $name..." -ForegroundColor Cyan
    echo $value | vercel env add $name production
    echo $value | vercel env add $name preview
    echo $value | vercel env add $name development
}

# Add environment variables
Add-VercelEnv "NEXT_PUBLIC_SUPABASE_URL" "https://kyzmybdosgscumnxersb.supabase.co"
Add-VercelEnv "NEXT_PUBLIC_SUPABASE_ANON_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5em15YmRvc2dzY3VtbnhlcnNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NzAyODQsImV4cCI6MjA4MTA0NjI4NH0.mkyZxFOu3vXAE_-MpuHuSGAUtNW-nR9wp6p-cwHfrUk"
Add-VercelEnv "SUPABASE_SERVICE_ROLE" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5em15YmRvc2dzY3VtbnhlcnNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ3MDI4NCwiZXhwIjoyMDgxMDQ2Mjg0fQ.uy-VhhADASD2wnfn13Yfx04Jeso7gpSdef9Qw52_Y4I"
Add-VercelEnv "NEXT_PUBLIC_RAZORPAY_KEY_ID" "rzp_test_S1KXYtqhgIkhCJ"
Add-VercelEnv "RAZORPAY_KEY_SECRET" "VU3J37d2X26CwdujjS7yHxqY"
Add-VercelEnv "NEXT_PUBLIC_ADMIN_PASSWORD" "admin123"
Add-VercelEnv "NEXT_PUBLIC_ADMIN_SETUP_PASSWORD" "MeatCountry2025!Admin"
Add-VercelEnv "FAST2SMS_API_KEY" "g6lnVuUesiF9vhyTI5BJozPdEwpRQrHWMqSN40fm8XOctLKAjDXP0TZJHonxRhgpDUk7bijN3Mc68AVE"

Write-Host ""
Write-Host "⚠️  IMPORTANT: Update NEXT_PUBLIC_SITE_URL manually!" -ForegroundColor Yellow
Write-Host "   Your Vercel URL: " -NoNewline
$siteUrl = Read-Host

if ($siteUrl) {
    Add-VercelEnv "NEXT_PUBLIC_SITE_URL" $siteUrl
    Write-Host "✅ Site URL added: $siteUrl" -ForegroundColor Green
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✅ Environment variables added!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to Razorpay Dashboard" -ForegroundColor White
Write-Host "2. Add your Vercel domain to whitelisted domains" -ForegroundColor White
Write-Host "3. Deploy: git push or vercel --prod" -ForegroundColor White
Write-Host ""
