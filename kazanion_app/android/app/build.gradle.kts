plugins {
    id("com.android.application")
    id("kotlin-android")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

android {
    namespace = "com.example.kazanion_app"
    compileSdk = 35 // veya flutter.compileSdkVersion, ama 34 önerilir
    ndkVersion = "27.0.12077973" // Zorunlu NDK sürümü

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_11.toString()
    }

    defaultConfig {
        applicationId = "com.example.kazanion_app"
        minSdk = 23 // Firebase ve modern kütüphaneler için minimum SDK
        targetSdk = 35 // veya flutter.targetSdkVersion
        versionCode = 1 // veya flutter.versionCode
        versionName = "1.0.0" // veya flutter.versionName
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("debug")
        }
    }
}

flutter {
    source = "../.."
}
