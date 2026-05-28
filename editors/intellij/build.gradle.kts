plugins {
  id("java")
  id("org.jetbrains.kotlin.jvm") version "1.9.24"
  id("org.jetbrains.intellij.platform") version "2.0.1"
}

group = providers.gradleProperty("pluginGroup").get()
version = providers.gradleProperty("pluginVersion").get()

repositories {
  mavenCentral()
  intellijPlatform { defaultRepositories() }
}

dependencies {
  testImplementation("junit:junit:4.13.2")

  intellijPlatform {
    intellijIdeaUltimate(providers.gradleProperty("platformVersion"))
    pluginVerifier()
    instrumentationTools()
    testFramework(org.jetbrains.intellij.platform.gradle.TestFrameworkType.Platform)
  }
}

intellijPlatform {
  pluginConfiguration {
    ideaVersion {
      sinceBuild = "232"
    }
  }
  pluginVerification {
    ides { recommended() }
  }
}

java {
  sourceCompatibility = JavaVersion.VERSION_17
  targetCompatibility = JavaVersion.VERSION_17
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
  kotlinOptions.jvmTarget = "17"
}

val languageServerDist = layout.projectDirectory.dir("../../packages/language-server/dist")

tasks.named<org.gradle.api.tasks.Sync>("prepareSandbox") {
  from(languageServerDist) {
    into("${rootProject.name}/server")
  }
}
