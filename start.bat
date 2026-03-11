npm run build
npx cap copy
cd android
gradlew assembleDebug
cd ..
npx run cap android