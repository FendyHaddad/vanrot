package com.vankode.vanrot.intellij

import java.nio.file.Files
import java.nio.file.Path
import org.junit.Assert.assertEquals
import org.junit.Test

class VanrotBundledServerTest {
  @Test
  fun bundledServerPathsPointAtPackagedServerFiles() {
    val pluginPath = Path.of("/plugin/Vanrot")

    assertEquals(
      pluginPath.resolve("server").resolve("bin").resolve("server.js"),
      VanrotBundledServer.serverScript(pluginPath),
    )
    assertEquals(
      pluginPath.resolve("server").resolve("package.json"),
      VanrotBundledServer.serverPackage(pluginPath),
    )
    assertEquals(
      pluginPath.resolve("server").resolve("template-globs.json"),
      VanrotBundledServer.templateGlobs(pluginPath),
    )
  }

  @Test
  fun resolvesPluginRootFromBundledJarLocation() {
    val pluginPath = Files.createTempDirectory("vanrot-plugin")
    val jarPath = pluginPath.resolve("lib").resolve("vanrot-intellij.jar")

    Files.createDirectories(jarPath.parent)
    Files.createDirectories(pluginPath.resolve("server").resolve("bin"))
    Files.createFile(pluginPath.resolve("server").resolve("bin").resolve("server.js"))

    assertEquals(
      pluginPath,
      VanrotBundledServer.pluginRootForCodePath(jarPath),
    )
  }
}
