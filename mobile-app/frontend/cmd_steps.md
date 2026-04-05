# Frontend

## Navigate To Frontend
cd C:\dev\pluspointsFp\mobile-app\frontend

## Run Vue 
npm run dev

## Update Mobile App
npm run build; npx cap sync 

## Run Emulator
npx cap run android

## Shortcut Vue
cd C:\dev\pluspointsFp\mobile-app\frontend; npm run dev

## Shortcut Emulator
cd C:\dev\pluspointsFp\mobile-app\frontend; npm run build; npx cap sync; npx cap run android

## Save Dist To Server
scp -r C:\dev\pluspointsFp\mobile-app\frontend\dist\ nils@456-optiplex.ddns.net:/var/www/pluspoints/

# Backend

## Navigate To Backend 
cd C:\dev\pluspointsFp\mobile-app\backend 

## Start Python Venv
.\venv\Scripts\Activate.ps1

## Start Flask 
python app.py 

## Shortcut Flask
cd C:\dev\pluspointsFp\mobile-app\backend; .\venv\Scripts\Activate.ps1; python app.py

# Flask Log 
journalctl -u flask_app.service -f