@echo off
taskkill /F /IM gcodex-code-mode-host.exe 2>nul
taskkill /F /IM gcodex-core-host.exe 2>nul
start /B "" "%USERPROFILE%\.vscode\extensions\openai.chatgpt\bin\windows\gcodex-code-mode-host.exe" --silent
exit
