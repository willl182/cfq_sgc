@echo off
setlocal enabledelayedexpansion

REM --------------------------------------------------------------------------
REM Script para convertir archivos .docx a .pdf usando Pandoc en una carpeta.
REM --------------------------------------------------------------------------

REM --- Configuración ---
REM Establece la carpeta donde se encuentran tus archivos .docx
set "carpeta_fichas=Z:\201_calferquim\203_areas\203.15_fichas-tecnicas_N\Nueva carpeta"

REM --- Verificación ---
REM Comprueba si la carpeta especificada existe
if not exist "%carpeta_fichas%" (
    echo ERROR: La carpeta "%carpeta_fichas%" no fue encontrada.
    echo Por favor, verifica la ruta y vuelve a intentarlo.
    pause
    exit /b 1
)

REM Comprueba si pandoc está disponible (búsqueda simple, puede no ser infalible)
pandoc --version >nul 2>&1
if errorlevel 9009 (
    echo ERROR: Pandoc no se encontró en el PATH del sistema.
    echo Asegúrate de que Pandoc esté instalado y agregado al PATH.
    echo Puedes descargarlo desde https://pandoc.org/
    pause
    exit /b 1
)

echo Iniciando proceso de conversion en la carpeta:
echo %carpeta_fichas%
echo --------------------------------------------------

REM --- Bucle de Conversión ---
REM Itera sobre todos los archivos .docx en la carpeta de origen
for %%f in ("%carpeta_fichas%\*.docx") do (
    echo.
    echo Procesando archivo: "%%~nxf"

    REM Construye el nombre del archivo de salida .pdf
    REM %%~dpnf obtiene la ruta, nombre base del archivo (sin extensión)
    set "archivo_entrada=%%f"
    set "archivo_salida=%%~dpnf.pdf"

    REM Ejecuta el comando pandoc
    echo Convirtiendo a: "!archivo_salida!"
    pandoc "!archivo_entrada!" -o "!archivo_salida!"

    REM Comprueba si hubo un error en la conversión
    if errorlevel 1 (
        echo *** ERROR al convertir "!archivo_entrada!" ***
    ) else (
        echo Convertido exitosamente: "%%~nxf"
    )
)

echo --------------------------------------------------
echo Proceso de conversion completado.
pause
endlocal