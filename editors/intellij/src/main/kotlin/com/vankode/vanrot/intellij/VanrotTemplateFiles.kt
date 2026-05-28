package com.vankode.vanrot.intellij

object VanrotTemplateFiles {
  private const val EXTENSION = ".html"
  private val EXCLUDE_EXACT = setOf(
    "index.html",
    "panel.html",
    "devtools.html",
    "landing-page-design.html",
  )
  private val EXCLUDE_SUFFIX = listOf("-presentation.html")

  fun isTemplate(filePath: String): Boolean {
    val base = filePath.replace('\\', '/').substringAfterLast('/')
    if (!base.endsWith(EXTENSION)) return false
    if (base in EXCLUDE_EXACT) return false
    if (EXCLUDE_SUFFIX.any { base.endsWith(it) }) return false
    return true
  }
}
