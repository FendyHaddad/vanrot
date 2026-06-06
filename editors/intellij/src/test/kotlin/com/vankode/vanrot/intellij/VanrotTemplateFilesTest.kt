package com.vankode.vanrot.intellij

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class VanrotTemplateFilesTest {
  @Test
  fun acceptsTemplateFiles() {
    assertTrue(VanrotTemplateFiles.isTemplate("home.component.html"))
    assertTrue(VanrotTemplateFiles.isTemplate("about.page.html"))
    assertTrue(VanrotTemplateFiles.isTemplate("settings.layout.html"))
    assertTrue(VanrotTemplateFiles.isTemplate("profile.dialog.html"))
    assertTrue(VanrotTemplateFiles.isTemplate("filters.widget.html"))
    assertTrue(VanrotTemplateFiles.isTemplate("signup.form.html"))
    assertTrue(VanrotTemplateFiles.isTemplate("primary.button.html"))
  }

  @Test
  fun rejectsNonHtml() {
    assertFalse(VanrotTemplateFiles.isTemplate("home.component.ts"))
  }

  @Test
  fun rejectsEntryAndDocHtml() {
    assertFalse(VanrotTemplateFiles.isTemplate("index.html"))
    assertFalse(VanrotTemplateFiles.isTemplate("landing-page-design.html"))
    assertFalse(VanrotTemplateFiles.isTemplate("vanrot-presentation.html"))
    assertFalse(VanrotTemplateFiles.isTemplate("panel.html"))
    assertFalse(VanrotTemplateFiles.isTemplate("devtools.html"))
  }
}
