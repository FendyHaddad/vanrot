package com.vankode.vanrot.intellij

import java.nio.file.Files
import java.nio.file.Path

object VanrotBundledServer {
  fun serverScript(): Path = serverScript(pluginRootForCodePath(codePath()))

  internal fun pluginRootForCodePath(codePath: Path): Path {
    val normalizedCodePath = if (Files.isRegularFile(codePath)) codePath.parent else codePath
    val pluginRoot = generateSequence(normalizedCodePath) { path -> path.parent }
      .firstOrNull { path -> Files.isRegularFile(serverScript(path)) }

    return pluginRoot
      ?: error("Vanrot: bundled server not found beside plugin code path: $codePath")
  }

  fun serverScript(pluginPath: Path): Path =
    pluginPath.resolve("server").resolve("bin").resolve("server.js")

  fun serverPackage(pluginPath: Path): Path =
    pluginPath.resolve("server").resolve("package.json")

  fun templateGlobs(pluginPath: Path): Path =
    pluginPath.resolve("server").resolve("template-globs.json")

  private fun codePath(): Path {
    val location = VanrotBundledServer::class.java.protectionDomain.codeSource?.location
      ?: error("Vanrot: plugin code source is unavailable")

    return Path.of(location.toURI())
  }
}
