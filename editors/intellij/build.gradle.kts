import java.util.zip.ZipFile

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
      untilBuild = provider { null }
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

val repositoryRoot = layout.projectDirectory.dir("../..")
val languageServerPackage = layout.projectDirectory.dir("../../packages/language-server")
val intellijLanguageServerDist = languageServerPackage.dir("dist-intellij")

val buildIntellijLanguageServer by tasks.registering(org.gradle.api.tasks.Exec::class) {
  workingDir = repositoryRoot.asFile

  val pnpmExecutable = if (System.getProperty("os.name").lowercase().contains("windows")) {
    "pnpm.cmd"
  } else {
    "pnpm"
  }

  commandLine(pnpmExecutable, "--filter", "@vanrot/language-server", "build:intellij")

  inputs.file(repositoryRoot.file("pnpm-lock.yaml"))
  inputs.file(repositoryRoot.file("tsconfig.base.json"))
  inputs.file(languageServerPackage.file("package.json"))
  inputs.file(languageServerPackage.file("tsconfig.json"))
  inputs.dir(languageServerPackage.dir("scripts"))
  inputs.dir(languageServerPackage.dir("src"))
  inputs.file(repositoryRoot.file("packages/compiler/package.json"))
  inputs.file(repositoryRoot.file("packages/compiler/tsconfig.json"))
  inputs.dir(repositoryRoot.dir("packages/compiler/src"))
  inputs.file(repositoryRoot.file("packages/config/package.json"))
  inputs.file(repositoryRoot.file("packages/config/tsconfig.json"))
  inputs.dir(repositoryRoot.dir("packages/config/src"))
  inputs.file(repositoryRoot.file("packages/runtime/package.json"))
  inputs.file(repositoryRoot.file("packages/runtime/tsconfig.json"))
  inputs.dir(repositoryRoot.dir("packages/runtime/src"))
  inputs.file(repositoryRoot.file("packages/ui/package.json"))
  inputs.file(repositoryRoot.file("packages/ui/tsconfig.json"))
  inputs.dir(repositoryRoot.dir("packages/ui/src"))
  outputs.dir(intellijLanguageServerDist)
}

tasks.named<org.gradle.api.tasks.Sync>("prepareSandbox") {
  dependsOn(buildIntellijLanguageServer)

  from(intellijLanguageServerDist) {
    into("${rootProject.name}/server")
  }
}

val verifyVanrotPluginPackage by tasks.registering {
  dependsOn("buildPlugin")

  doLast {
    val pluginArchives = layout.buildDirectory.dir("distributions").get().asFile
      .listFiles { file -> file.extension == "zip" }
      ?.toList()
      ?: emptyList()

    require(pluginArchives.isNotEmpty()) {
      "No JetBrains plugin ZIP found under build/distributions."
    }

    val zip = pluginArchives.maxBy { it.lastModified() }
    ZipFile(zip).use { archive ->
      val names = mutableListOf<String>()
      val entries = archive.entries()

      while (entries.hasMoreElements()) {
        names.add(entries.nextElement().name)
      }

      require(names.any { it.endsWith("server/bin/server.js") }) {
        "Plugin ZIP is missing the bundled Vanrot language server."
      }
      require(names.any { it.endsWith("server/package.json") }) {
        "Plugin ZIP is missing bundled server package metadata."
      }
      require(names.any { it.endsWith("server/template-globs.json") }) {
        "Plugin ZIP is missing generated template globs."
      }

      val pluginJarName = names.firstOrNull { name ->
        name.endsWith(".jar") &&
          name.contains("/lib/${rootProject.name}-") &&
          !name.endsWith("-searchableOptions.jar")
      }

      require(pluginJarName != null) {
        "Plugin ZIP is missing the plugin implementation JAR."
      }

      val pluginJar = temporaryDir.resolve("vanrot-plugin.jar")
      archive.getInputStream(archive.getEntry(pluginJarName)).use { input ->
        pluginJar.outputStream().use { output -> input.copyTo(output) }
      }

      ZipFile(pluginJar).use { jar ->
        val jarNames = mutableListOf<String>()
        val jarEntries = jar.entries()

        while (jarEntries.hasMoreElements()) {
          jarNames.add(jarEntries.nextElement().name)
        }

        require(jarNames.any { it == "META-INF/plugin.xml" }) {
          "Plugin implementation JAR is missing META-INF/plugin.xml."
        }

        val pluginXml = jar.getInputStream(jar.getEntry("META-INF/plugin.xml")).use { input ->
          input.bufferedReader().readText()
        }

        require(pluginXml.contains("""since-build="232"""")) {
          "Plugin XML must keep JetBrains since-build 232 compatibility."
        }
        require(!pluginXml.contains("until-build")) {
          "Plugin XML must not set until-build; Marketplace should allow future IDE builds."
        }
      }
    }
  }
}
