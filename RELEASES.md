# Homebase release policy

Homebase preview releases are traditional signed Android APKs. The app does not
load over-the-air JavaScript updates.

1. Increment the Expo app version and package version together using semantic
   versioning. Use a patch increment for normal fixes, such as 1.0.1 to 1.0.2.
2. Commit and push the release to main. The Expo workflow builds an Android
   preview APK for every push to that branch after the GitHub repository is
   connected in the Expo project settings.
3. Android build codes are allocated remotely by Expo and auto-incremented,
   making every APK installable over the prior version.
4. For a local release without waiting for the workflow, run
   npm run release:android.

Users download each new APK from the Expo build page and install it as a normal
Android upgrade. No cache clearing or second launch is required.
