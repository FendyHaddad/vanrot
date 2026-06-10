package com.vankode.vanrot.intellij

import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class VanrotPluginResourcesTest {
  @Test
  fun includesMarketplacePluginIcons() {
    assertPluginIcon("META-INF/pluginIcon.svg")
    assertPluginIcon("META-INF/pluginIcon_dark.svg")
  }

  @Test
  fun declaresStablePlatformModuleDependencies() {
    val pluginXml = pluginXml()

    assertTrue(
      "Plugin XML should depend on the stable IntelliJ platform module.",
      pluginXml.contains("<depends>com.intellij.modules.platform</depends>"),
    )
    assertTrue(
      "Plugin XML should depend on the stable IntelliJ language module for PSI and inspections.",
      pluginXml.contains("<depends>com.intellij.modules.lang</depends>"),
    )
    assertFalse(
      "Plugin XML should not directly depend on HtmlTools because it pulls a large IDE plugin tree into verifier reports.",
      pluginXml.contains("<depends>HtmlTools</depends>"),
    )
  }

  private fun assertPluginIcon(path: String) {
    val resource = javaClass.classLoader.getResource(path)
    assertNotNull("$path should be packaged as a JetBrains plugin icon", resource)

    val icon = requireNotNull(resource).readText()
    assertTrue("$path should use the JetBrains 40x40 plugin icon canvas", icon.contains("viewBox=\"0 0 40 40\""))
    assertTrue("$path should include the Vanrot logo geometry", icon.contains("M227.687 292.106"))
  }

  private fun pluginXml(): String {
    val resource = javaClass.classLoader.getResource("META-INF/plugin.xml")
    assertNotNull("META-INF/plugin.xml should be packaged as a JetBrains plugin descriptor", resource)
    return requireNotNull(resource).readText()
  }
}
