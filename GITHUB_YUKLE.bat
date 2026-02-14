@echo off
echo ========================================
echo   GITHUB'A YUKLEME SCRIPTI
echo ========================================
echo.

REM GitHub kullanici adinizi buraya yazin
set GITHUB_USERNAME=KULLANICI_ADINIZ

echo GitHub kullanici adiniz: %GITHUB_USERNAME%
echo.
echo UYARI: Yukaridaki KULLANICI_ADINIZ yerine kendi GitHub kullanici adinizi yazin!
echo Bu dosyayi bir metin editoru ile acip duzenleyin.
echo.
pause

echo.
echo GitHub'a baglaniyor...
"C:\Program Files\Git\bin\git.exe" remote add origin https://github.com/%GITHUB_USERNAME%/quiz-app.git

echo.
echo GitHub'a yukleniyor...
"C:\Program Files\Git\bin\git.exe" push -u origin main

echo.
echo ========================================
echo   TAMAMLANDI!
echo ========================================
echo.
echo GitHub'da kontrol edin:
echo https://github.com/%GITHUB_USERNAME%/quiz-app
echo.
pause
