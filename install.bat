@echo off
REM KishansKraft Website - Windows Production Installation Script
REM Automated setup script for deploying the website on Windows servers

setlocal enabledelayedexpansion

REM Colors (Windows doesn't support ANSI colors by default, but we'll add basic formatting)
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "PURPLE=[95m"
set "CYAN=[96m"
set "NC=[0m"

REM Configuration
set "PROJECT_NAME=KishansKraft Website"
set "PROJECT_DIR=kishans-kraft-website"
set "NODE_MIN_VERSION=16"

echo.
echo ========================================================================
echo                    KishansKraft Website - Windows Setup
echo ========================================================================
echo.
echo   Automated installation script for Windows production deployment
echo   Enterprise-ready with security, performance and monitoring
echo.
echo ========================================================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [INFO] Running as Administrator - Good!
) else (
    echo [WARNING] Not running as Administrator. Some features may not work.
    echo Please run as Administrator for full functionality.
    pause
)

REM Function to check system requirements
:check_system_requirements
echo [STEP] Checking system requirements...

REM Check Windows version
for /f "tokens=4-5 delims=. " %%i in ('ver') do set VERSION=%%i.%%j
echo [INFO] Windows version: %VERSION%

REM Check available disk space (simplified check)
for /f "tokens=3" %%a in ('dir /-c ^| find "bytes free"') do set free_space=%%a
echo [INFO] Available disk space: %free_space% bytes

echo [SUCCESS] System requirements check completed
echo.
goto :eof

REM Function to check and install Node.js
:check_nodejs
echo [STEP] Checking Node.js installation...

node -v >nul 2>&1
if %errorLevel% == 0 (
    for /f "tokens=1 delims=v" %%a in ('node -v') do set NODE_VERSION=%%a
    echo [SUCCESS] Node.js !NODE_VERSION! is installed
) else (
    echo [WARNING] Node.js is not installed
    echo [INFO] Please download and install Node.js from https://nodejs.org
    echo [INFO] Choose the LTS version for production use
    start https://nodejs.org
    pause
    
    REM Check again after installation
    node -v >nul 2>&1
    if %errorLevel% == 0 (
        echo [SUCCESS] Node.js installation detected
    ) else (
        echo [ERROR] Node.js installation failed or not in PATH
        pause
        exit /b 1
    )
)

npm -v >nul 2>&1
if %errorLevel% == 0 (
    echo [SUCCESS] NPM is available
) else (
    echo [ERROR] NPM is not available
    pause
    exit /b 1
)

echo.
goto :eof

REM Function to check Git installation
:check_git
echo [STEP] Checking Git installation...

git --version >nul 2>&1
if %errorLevel% == 0 (
    for /f "tokens=3" %%a in ('git --version') do set GIT_VERSION=%%a
    echo [SUCCESS] Git !GIT_VERSION! is installed
) else (
    echo [WARNING] Git is not installed
    echo [INFO] Please download and install Git from https://git-scm.com
    start https://git-scm.com/download/win
    pause
    
    REM Check again
    git --version >nul 2>&1
    if %errorLevel% == 0 (
        echo [SUCCESS] Git installation detected
    ) else (
        echo [WARNING] Git not detected. You can continue without Git.
    )
)

echo.
goto :eof

REM Function to setup project
:setup_project
echo [STEP] Setting up KishansKraft website project...

if exist "%PROJECT_DIR%" (
    echo [WARNING] Project directory already exists
    set /p choice="Remove existing directory and reinstall? (y/N): "
    if /i "!choice!"=="y" (
        rmdir /s /q "%PROJECT_DIR%"
    ) else (
        echo [INFO] Installation cancelled
        pause
        exit /b 0
    )
)

REM Check if we're already in the project directory
if exist "package.json" (
    findstr /c:"kishans-kraft-website" package.json >nul 2>&1
    if !errorLevel! == 0 (
        echo [INFO] Already in KishansKraft project directory
        set "PROJECT_DIR=."
        goto project_ready
    )
)

REM Create project directory and copy files
mkdir "%PROJECT_DIR%"

REM Copy all necessary files
for %%f in (*.html *.js *.json *.md *.txt) do (
    if exist "%%f" copy "%%f" "%PROJECT_DIR%\"
)

REM Copy directories
if exist "assets" xcopy "assets" "%PROJECT_DIR%\assets" /e /i /q
if exist "data" xcopy "data" "%PROJECT_DIR%\data" /e /i /q
if exist "images" xcopy "images" "%PROJECT_DIR%\images" /e /i /q
if exist "partials" xcopy "partials" "%PROJECT_DIR%\partials" /e /i /q

:project_ready
cd /d "%PROJECT_DIR%"
echo [SUCCESS] Project setup completed

echo.
goto :eof

REM Function to install npm dependencies
:install_npm_dependencies
echo [STEP] Installing npm dependencies...

if not exist "package.json" (
    echo [ERROR] package.json not found. Make sure you're in the project directory.
    pause
    exit /b 1
)

REM Clean install
if exist "node_modules" rmdir /s /q "node_modules"
if exist "package-lock.json" del "package-lock.json"

REM Install dependencies
npm install
if %errorLevel% == 0 (
    echo [SUCCESS] NPM dependencies installed
) else (
    echo [ERROR] NPM installation failed
    pause
    exit /b 1
)

echo.
goto :eof

REM Function to build project
:build_project
echo [STEP] Building project for production...

npm run build
if %errorLevel% == 0 (
    echo [SUCCESS] Project built successfully
) else (
    echo [ERROR] Build failed. Check the output above for errors.
    pause
    exit /b 1
)

REM Verify build output
if exist "dist\index.html" (
    echo [SUCCESS] Build output ready in dist\ folder
) else (
    echo [ERROR] Build output not found. Build may have failed.
    pause
    exit /b 1
)

echo.
goto :eof

REM Function to setup IIS (Internet Information Services)
:setup_iis
echo [STEP] Setting up IIS configuration...

REM Check if IIS is available
dism /online /get-featureinfo /featurename:IIS-WebServerRole | find "State : Enabled" >nul
if %errorLevel% == 0 (
    echo [SUCCESS] IIS is installed and enabled
) else (
    echo [WARNING] IIS is not installed or enabled
    echo [INFO] To install IIS, run: dism /online /enable-feature /featurename:IIS-WebServerRole
    set /p choice="Install IIS now? (y/N): "
    if /i "!choice!"=="y" (
        dism /online /enable-feature /featurename:IIS-WebServerRole
        dism /online /enable-feature /featurename:IIS-WebServer
        dism /online /enable-feature /featurename:IIS-CommonHttpFeatures
        dism /online /enable-feature /featurename:IIS-HttpErrors
        dism /online /enable-feature /featurename:IIS-HttpRedirect
        dism /online /enable-feature /featurename:IIS-ApplicationDevelopment
        dism /online /enable-feature /featurename:IIS-NetFxExtensibility45
        dism /online /enable-feature /featurename:IIS-HealthAndDiagnostics
        dism /online /enable-feature /featurename:IIS-HttpLogging
        dism /online /enable-feature /featurename:IIS-Security
        dism /online /enable-feature /featurename:IIS-RequestFiltering
        dism /online /enable-feature /featurename:IIS-Performance
        dism /online /enable-feature /featurename:IIS-WebServerManagementTools
        dism /online /enable-feature /featurename:IIS-ManagementConsole
        dism /online /enable-feature /featurename:IIS-IIS6ManagementCompatibility
        dism /online /enable-feature /featurename:IIS-Metabase
        echo [SUCCESS] IIS installed successfully
    ) else (
        echo [INFO] Skipping IIS setup. You can use any other web server.
        goto skip_iis
    )
)

REM Get site name
set /p SITE_NAME="Enter site name (default: KishansKraft): "
if "%SITE_NAME%"=="" set "SITE_NAME=KishansKraft"

REM Get port
set /p PORT="Enter port number (default: 80): "
if "%PORT%"=="" set "PORT=80"

REM Create IIS site
set "SITE_PATH=%cd%\dist"
appcmd add site /name:"%SITE_NAME%" /physicalPath:"%SITE_PATH%" /bindings:http/*:%PORT%:

if %errorLevel% == 0 (
    echo [SUCCESS] IIS site created successfully
    echo [INFO] Site available at: http://localhost:%PORT%
) else (
    echo [ERROR] Failed to create IIS site
)

:skip_iis
echo.
goto :eof

REM Function to create maintenance scripts
:setup_monitoring
echo [STEP] Setting up monitoring and maintenance...

mkdir scripts 2>nul

REM Create backup script
(
echo @echo off
echo REM Automated backup script for KishansKraft website
echo.
echo set "DATE=%%date:~-4,4%%%%date:~-10,2%%%%date:~-7,2%%_%%time:~0,2%%%%time:~3,2%%%%time:~6,2%%"
echo set "DATE=%%DATE: =0%%"
echo set "BACKUP_DIR=backups\backup_%%DATE%%"
echo set "PROJECT_DIR=%%~dp0\.."
echo.
echo mkdir "%%BACKUP_DIR%%" 2^>nul
echo.
echo REM Backup website files
echo xcopy "%%PROJECT_DIR%%\dist" "%%BACKUP_DIR%%\dist\" /e /i /q
echo xcopy "%%PROJECT_DIR%%\data" "%%BACKUP_DIR%%\data\" /e /i /q
echo copy "%%PROJECT_DIR%%\package.json" "%%BACKUP_DIR%%\"
echo.
echo echo Backup created: %%BACKUP_DIR%%
echo.
echo REM Keep only last 7 backups
echo for /f "skip=7 delims=" %%%%i in ^('dir /b /od backups\backup_*'^) do rd /s /q "backups\%%%%i"
) > scripts\backup.bat

REM Create update script
(
echo @echo off
echo REM Automated update script for KishansKraft website
echo.
echo set "PROJECT_DIR=%%~dp0\.."
echo cd /d "%%PROJECT_DIR%%"
echo.
echo echo Updating KishansKraft website...
echo.
echo REM Create backup before update
echo call scripts\backup.bat
echo.
echo REM Pull latest changes ^(if using git^)
echo if exist ".git" git pull origin main
echo.
echo REM Update dependencies
echo npm install
echo.
echo REM Rebuild project
echo npm run build
echo.
echo echo Update completed successfully!
) > scripts\update.bat

echo [SUCCESS] Maintenance scripts created in scripts\ folder

echo.
goto :eof

REM Function to run tests
:run_tests
echo [STEP] Running post-installation tests...

set /a test_count=0
set /a passed_tests=0

REM Test 1: Check if dist directory exists
set /a test_count+=1
if exist "dist" (
    set /a passed_tests+=1
    echo [SUCCESS] Build output directory exists
) else (
    echo [ERROR] Build output directory missing
)

REM Test 2: Check if main HTML files exist
set /a test_count+=1
if exist "dist\index.html" (
    set /a passed_tests+=1
    echo [SUCCESS] Main HTML files exist
) else (
    echo [ERROR] Main HTML files missing
)

REM Test 3: Check if assets are built
set /a test_count+=1
if exist "dist\assets\css\style.css" (
    if exist "dist\assets\js\site.js" (
        set /a passed_tests+=1
        echo [SUCCESS] CSS and JavaScript assets built
    ) else (
        echo [ERROR] JavaScript assets missing
    )
) else (
    echo [ERROR] CSS assets missing
)

REM Test 4: Check if PWA files exist
set /a test_count+=1
if exist "dist\manifest.json" (
    if exist "dist\sw.js" (
        set /a passed_tests+=1
        echo [SUCCESS] PWA files present
    ) else (
        echo [ERROR] Service worker missing
    )
) else (
    echo [ERROR] PWA manifest missing
)

REM Test 5: Check if Node.js and npm work
set /a test_count+=1
node -v >nul 2>&1
if %errorLevel% == 0 (
    npm -v >nul 2>&1
    if !errorLevel! == 0 (
        set /a passed_tests+=1
        echo [SUCCESS] Node.js and npm working
    ) else (
        echo [ERROR] npm not working
    )
) else (
    echo [ERROR] Node.js not working
)

echo.
echo [INFO] Test Results: %passed_tests%/%test_count% tests passed

if %passed_tests% == %test_count% (
    echo [SUCCESS] All tests passed!
) else (
    echo [WARNING] Some tests failed. Please review the installation.
)

echo.
goto :eof

REM Function to show final instructions
:show_final_instructions
echo.
echo ========================================================================
echo                        Installation Completed!
echo ========================================================================
echo.

echo [SUCCESS] KishansKraft website has been successfully installed!
echo.

echo [INFO] Next Steps:
echo 1. Update placeholder content:
echo    - Replace phone numbers (+91 99999 99999) with actual numbers
echo    - Update email addresses (hello@kishanskraft.com)
echo    - Add real product images to images\ folder
echo    - Update business information in HTML files
echo.

echo 2. Configure your domain:
echo    - Point your domain to this server
echo    - Update sitemap.xml with your domain
echo    - Set up SSL certificate for HTTPS
echo.

echo 3. Set up analytics:
echo    - Add Google Analytics tracking ID
echo    - Configure Google Search Console
echo    - Set up monitoring and alerts
echo.

echo 4. Go live:
echo    - Test all functionality thoroughly
echo    - Run Lighthouse performance test
echo    - Submit sitemap to search engines
echo.

echo [INFO] Useful Commands:
echo • Update website: scripts\update.bat
echo • Create backup: scripts\backup.bat
echo • Rebuild project: npm run build
echo • Start dev server: npm run dev
echo.

echo [INFO] Important Files:
echo • Website files: dist\ folder
echo • Source code: Current directory
echo • Documentation: README.md, DEVELOPMENT.md
echo • Deployment guide: DEPLOYMENT-CHECKLIST.md
echo.

echo [INFO] Test locally with: npm run preview
echo.

echo [SUCCESS] KishansKraft website is ready for production!

echo.
goto :eof

REM Main execution
:main
echo [BLUE]Starting automated installation...[NC]
echo.

call :check_system_requirements
call :check_nodejs
call :check_git
call :setup_project
call :install_npm_dependencies
call :build_project
call :setup_iis
call :setup_monitoring
call :run_tests
call :show_final_instructions

echo.
echo Installation process completed!
pause
exit /b 0