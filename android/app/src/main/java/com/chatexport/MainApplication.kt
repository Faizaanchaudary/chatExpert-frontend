package com.chatexport

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import android.content.Intent
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.uimanager.ViewManager
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader
import android.content.pm.PackageManager

// CustomIntentModule implementation
class CustomIntentModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "CustomIntent"

    @ReactMethod
    fun openApp(packageName: String, promise: Promise) {
        val packageManager = reactApplicationContext.packageManager
        val intent = packageManager.getLaunchIntentForPackage(packageName)
        if (intent != null) {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
            promise.resolve(true) // Successfully launched
        } else {
            try {
                packageManager.getPackageInfo(packageName, PackageManager.GET_ACTIVITIES)
                promise.reject("APP_NOT_LAUNCHABLE", "App exists but cannot be launched")
            } catch (e: PackageManager.NameNotFoundException) {
                promise.reject("APP_NOT_FOUND", "App with package name $packageName not found")
            }
        }
        
    }
}

// CustomIntentPackage implementation
class CustomIntentPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(
            CustomIntentModule(reactContext),
            ContentResolverModule(reactContext)  // Add ContentResolver module
        )
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}

// MainApplication implementation
class MainApplication : Application(), ReactApplication {

    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {
            override fun getPackages(): List<ReactPackage> =
                PackageList(this).packages.apply {
                    // Packages that cannot be autolinked yet can be added manually here, for example:
                    // add(AsyncStoragePackage())
                    add(CustomIntentPackage())
                }

            override fun getJSMainModuleName(): String = "index"
            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG
            override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
        }

    override val reactHost: ReactHost
        get() = getDefaultReactHost(applicationContext, reactNativeHost)

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, false)
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            // If you opted in for the New Architecture, we load the native entry point for this app.
            load()
        }
    }
}
