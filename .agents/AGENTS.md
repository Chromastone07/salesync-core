# Dependency Constraints for SaleSync
- **Strict Dependency Management**: DO NOT arbitrarily upgrade packages that contain native modules, as this can break the standalone Android builds.
- **Reanimated Version**: Keep `react-native-reanimated` strictly locked to `~3.16.2`. Never bump this to v4 as it causes a fatal native initialization crash in this project's setup.
- **Worklets**: DO NOT install or use `react-native-worklets` as it is incompatible and crashes the application on startup.
- **Native Modules**: When adding any new packages, carefully check for peer dependency version conflicts before saving `package.json`.
