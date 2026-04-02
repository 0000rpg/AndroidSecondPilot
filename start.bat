@echo off
echo Building...
call npm run build

echo Copying assets...
call npx cap copy

cd android
echo Building APK...
call gradlew.bat assembleDebug
cd ..

echo Syncing...
call npx cap sync android

:: ========== Emulator start ==========
set AVD_NAME=Medium_Phone_API_36.1
set EMULATOR_PATH=%LocalAppData%\Android\Sdk\emulator\emulator.exe
set ADB_PATH=%LocalAppData%\Android\Sdk\platform-tools\adb.exe

echo Checking if emulator is already booted...
%ADB_PATH% shell getprop sys.boot_completed 2>nul | findstr "1" >nul
if %errorlevel% equ 0 (
    echo Emulator already booted.
    goto :run
)

echo Starting emulator %AVD_NAME%...
start "" "%EMULATOR_PATH%" -avd "%AVD_NAME%" -no-snapshot

echo Waiting for full boot (up to 90 sec)...
set TIMEOUT=90
set /a cnt=0
:wait
timeout /t 3 /nobreak >nul
%ADB_PATH% shell getprop sys.boot_completed 2>nul | findstr "1" >nul
if %errorlevel% equ 0 goto :booted
set /a cnt+=3
if %cnt% geq %TIMEOUT% (
    echo Timed out waiting for emulator.
    exit /b 1
)
goto :wait

:booted
echo Emulator ready.

:run
echo Running app...
call npx cap run android --target "Medium_Phone_API_36.1"
echo Done.
pause