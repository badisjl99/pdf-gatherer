@echo off
setlocal

if "%~1"=="" (
    echo Usage: %0 ^<query^>
    exit /b 1
)

set "query=%~1"
set "query=%query: =+%"

node app.js %query%

endlocal
