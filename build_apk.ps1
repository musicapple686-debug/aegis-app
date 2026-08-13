Write-Host "Starting Android APK Build via Expo Application Services (EAS)..." -ForegroundColor Cyan
Write-Host "This will generate an installable .apk file. The process typically takes 5-10 minutes." -ForegroundColor Yellow
npx eas-cli build -p android --profile preview --non-interactive
Write-Host "Build finished. Follow the link provided by EAS to download your APK." -ForegroundColor Green
