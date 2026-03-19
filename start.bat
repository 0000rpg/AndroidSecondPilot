npm run build
npx cap copy
cd android
gradlew assembleDebug
cd ..
npx cap sync android
npx cap run android