rm -rf ../jmwoo.github.io/assets/static/css/*
rm -rf ../jmwoo.github.io/assets/static/js/*
echo 'removed old files'

npm run build

cp ./build/static/css/* ../jmwoo.github.io/assets/static/css
cp ./build/static/js/* ../jmwoo.github.io/assets/static/js
cp ./build/index.html ../jmwoo.github.io/diet/index.html
echo 'copied new files'

echo done