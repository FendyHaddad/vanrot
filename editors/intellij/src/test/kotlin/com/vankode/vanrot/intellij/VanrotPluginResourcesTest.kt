package com.vankode.vanrot.intellij

import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class VanrotPluginResourcesTest {
  @Test
  fun includesMarketplacePluginIcons() {
    assertPluginIcon("META-INF/pluginIcon.svg")
    assertPluginIcon("META-INF/pluginIcon_dark.svg")
  }

  private fun assertPluginIcon(path: String) {
    val resource = javaClass.classLoader.getResource(path)
    assertNotNull("$path should be packaged as a JetBrains plugin icon", resource)

    val icon = requireNotNull(resource).readText()
    assertTrue("$path should use the JetBrains 40x40 plugin icon canvas", icon.contains("viewBox=\"0 0 40 40\""))
    assertTrue("$path should include the Vanrot logo geometry", icon.contains("M227.687 292.106"))
  }
}
