package com.vankode.vanrot.intellij

import com.intellij.ide.plugins.PluginManagerCore
import com.intellij.openapi.extensions.PluginId
import java.nio.file.Path

object VanrotBundledServer {
  private const val PLUGIN_ID = "com.vankode.vanrot"

  fun serverScript(): Path {
    val descriptor = PluginManagerCore.getPlugin(PluginId.getId(PLUGIN_ID))
      ?: error("Vanrot: plugin descriptor not found for $PLUGIN_ID")
    return descriptor.pluginPath.resolve("server").resolve("bin").resolve("server.js")
  }
}
