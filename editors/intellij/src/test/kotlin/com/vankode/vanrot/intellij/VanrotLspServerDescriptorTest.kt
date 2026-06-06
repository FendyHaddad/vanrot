package com.vankode.vanrot.intellij

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class VanrotLspServerDescriptorTest {
  @Test
  fun templateSupportCoversVanrotRoleTemplates() {
    assertTrue(VanrotTemplateFiles.isTemplate("home.page.html"))
    assertTrue(VanrotTemplateFiles.isTemplate("profile.dialog.html"))
    assertTrue(VanrotTemplateFiles.isTemplate("filters.widget.html"))
    assertTrue(VanrotTemplateFiles.isTemplate("signup.form.html"))
    assertFalse(VanrotTemplateFiles.isTemplate("index.html"))
  }
}
