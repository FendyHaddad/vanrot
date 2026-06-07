package com.vankode.vanrot.intellij

import com.intellij.ide.plugins.cl.PluginAwareClassLoader
import java.nio.file.Path

object VanrotBundledServer {
  fun serverScript(): Path {
    val pluginClassLoader = VanrotBundledServer::class.java.classLoader as? PluginAwareClassLoader
      ?: error("Vanrot: plugin classloader does not expose the plugin descriptor")
    return serverScript(pluginClassLoader.pluginDescriptor.pluginPath)
  }

  fun serverScript(pluginPath: Path): Path =
    pluginPath.resolve("server").resolve("bin").resolve("server.js")

  fun serverPackage(pluginPath: Path): Path =
    pluginPath.resolve("server").resolve("package.json")

  fun templateGlobs(pluginPath: Path): Path =
    pluginPath.resolve("server").resolve("template-globs.json")
}
