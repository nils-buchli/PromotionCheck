npm run build
npx cap sync
echo 'Syncing frontend...' 
rsync -av --delete -e "ssh -p 2112" ./dist/ nils@456-optiplex.ddns.net:/var/www/pluspoints/