echo 'Syncing backend...' 
rsync -av --delete -e "ssh -p 2112" ./../backend/ nils@456-optiplex.ddns.net:/development/pluspoints-backend/