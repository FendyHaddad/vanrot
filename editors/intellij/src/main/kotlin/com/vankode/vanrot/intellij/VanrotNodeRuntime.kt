package com.vankode.vanrot.intellij

import com.intellij.openapi.project.Project
import java.io.File
import java.nio.file.Files
import java.nio.file.Path

object VanrotNodeRuntime {
  fun resolve(project: Project): Path =
    projectNode(project)
      ?: pathNode()
      ?: error("Vanrot: no Node.js runtime found (checked project node_modules/.bin and PATH).")

  private fun projectNode(project: Project): Path? {
    val base = project.basePath ?: return null
    val candidate = Path.of(base, "node_modules", ".bin", "node")
    return candidate.takeIf { Files.isExecutable(it) }
  }

  private fun pathNode(): Path? {
    val path = System.getenv("PATH") ?: return null
    for (dir in path.split(File.pathSeparatorChar)) {
      val candidate = Path.of(dir, "node")
      if (Files.isExecutable(candidate)) return candidate
    }
    return null
  }
}
