plugins {
    id("com.android.application")
}

val ciVersionCode = System.getenv("GITHUB_RUN_NUMBER")?.toIntOrNull() ?: 1

android {
    namespace = "com.xiaoyuzhuang.lifepoints"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.xiaoyuzhuang.lifepoints"
        minSdk = 24
        targetSdk = 35
        versionCode = ciVersionCode
        versionName = "1.0.$ciVersionCode"
    }

    signingConfigs {
        create("release") {
            val path = System.getenv("LIFEPOINTS_KEYSTORE_PATH")
            val storePass = System.getenv("LIFEPOINTS_KEYSTORE_PASSWORD")
            val keyPass = System.getenv("LIFEPOINTS_KEY_PASSWORD") ?: storePass
            if (!path.isNullOrBlank() && !storePass.isNullOrBlank()) {
                storeFile = file(path)
                storePassword = storePass
                keyAlias = System.getenv("LIFEPOINTS_KEY_ALIAS") ?: "lifepoints"
                keyPassword = keyPass
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("release")
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
