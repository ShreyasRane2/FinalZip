@echo off
echo ========================================
echo FORCE CLEAN APPLICATION SERVICE
echo ========================================
echo.
echo This will delete ALL compiled files and force a complete rebuild
echo.
pause

echo.
echo Step 1: Deleting target folder...
if exist target rmdir /s /q target
echo Done!

echo.
echo Step 2: Deleting .classpath and .project (will be regenerated)...
if exist .classpath del /f .classpath
if exist .project del /f .project
echo Done!

echo.
echo Step 3: Deleting .settings folder...
if exist .settings rmdir /s /q .settings
echo Done!

echo.
echo Step 4: Running Maven clean...
call mvnw.cmd clean
echo Done!

echo.
echo Step 5: Running Maven install...
call mvnw.cmd install -DskipTests
echo Done!

echo.
echo ========================================
echo CLEAN COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. In STS, right-click the project and select "Refresh" (F5)
echo 2. If needed, right-click project and select "Maven" -^> "Update Project"
echo 3. Stop the old Application Service in Boot Dashboard
echo 4. Start Application Service again
echo.
pause
