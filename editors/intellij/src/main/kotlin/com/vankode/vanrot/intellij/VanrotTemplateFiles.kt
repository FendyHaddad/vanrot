package com.vankode.vanrot.intellij

object VanrotTemplateFiles {
  private val TEMPLATE_FILE_PATTERN =
    Regex(""".*\.(component|page|layout|dialog|widget|form|button)\.html$""")

  fun isTemplate(filePath: String): Boolean {
    val base = filePath.replace('\\', '/').substringAfterLast('/')
    return TEMPLATE_FILE_PATTERN.matches(base)
  }
}
