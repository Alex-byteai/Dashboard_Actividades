@echo off
chcp 65001 > nul
echo ========================================================
echo   Sincronizando Dashboard Actividades con Google Sheets
echo ========================================================
python sync_sheets.py
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause > nul
