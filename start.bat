@echo off
echo Building...
npm run build
if %errorlevel% neq 0 exit /b %errorlevel%

echo Copying assets...
npx cap copy
if %errorlevel% neq 0 exit /b %errorlevel%

cd android
echo Building APK...
gradlew.bat assembleDebug
if %errorlevel% neq 0 exit /b %errorlevel%
cd ..

echo Syncing...
npx cap sync android
if %errorlevel% neq 0 exit /b %errorlevel%

echo Running on device/emulator...
npx cap run android