import UIKit

@objc(AppDelegate)
class AppDelegate: ExpoAppDelegate {

  override func application(_ application: UIApplication,
                           didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    registerPlugins()

    // Set these BEFORE super so RN 0.81 reads them
    self.turboModuleEnabled = true   // needed for RNTP v5
    self.fabricEnabled      = true  // avoid early emitter race
    // self.bridgelessEnabled = false // (default)

    self.moduleName  = "AmplifyAudiobooks"
    self.initialProps = [:]

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  override func bundleURL() -> URL! {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
