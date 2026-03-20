@echo off
:: Maven Wrapper script for Windows
:: Downloads and runs Maven if not already cached

setlocal

set "MAVEN_VERSION=3.9.6"
set "MAVEN_HOME=%USERPROFILE%\.m2\wrapper\dists\apache-maven-%MAVEN_VERSION%"
set "MAVEN_CMD=%MAVEN_HOME%\bin\mvn.cmd"
set "MAVEN_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/%MAVEN_VERSION%/apache-maven-%MAVEN_VERSION%-bin.zip"

if exist "%MAVEN_CMD%" goto runMaven

echo Downloading Maven %MAVEN_VERSION%...
mkdir "%MAVEN_HOME%" 2>nul
set "TEMP_ZIP=%TEMP%\maven-%MAVEN_VERSION%.zip"
curl -fsSL "%MAVEN_URL%" -o "%TEMP_ZIP%"
if errorlevel 1 (
    echo Failed to download Maven. Please check your internet connection.
    exit /b 1
)

echo Extracting Maven...
powershell -Command "Expand-Archive -Path '%TEMP_ZIP%' -DestinationPath '%USERPROFILE%\.m2\wrapper\dists' -Force"
del /f "%TEMP_ZIP%" 2>nul

:runMaven
"%MAVEN_CMD%" %*
