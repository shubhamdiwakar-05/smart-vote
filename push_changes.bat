@echo off
set "PATH=%PATH%;C:\Program Files\Git\cmd"
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "Add beautiful mock data to ResultsPage"
"C:\Program Files\Git\cmd\git.exe" push origin master
