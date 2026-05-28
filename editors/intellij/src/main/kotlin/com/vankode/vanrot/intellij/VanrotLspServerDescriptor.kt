package com.vankode.vanrot.intellij

import com.intellij.execution.configurations.GeneralCommandLine
import com.intellij.openapi.project.Project
import com.intellij.openapi.vfs.VirtualFile
import com.intellij.platform.lsp.api.ProjectWideLspServerDescriptor

class VanrotLspServerDescriptor(project: Project) :
  ProjectWideLspServerDescriptor(project, "Vanrot") {

  override fun isSupportedFile(file: VirtualFile): Boolean =
    VanrotTemplateFiles.isTemplate(file.name)

  override fun createCommandLine(): GeneralCommandLine {
    val node = VanrotNodeRuntime.resolve(project)
    val script = VanrotBundledServer.serverScript()
    return GeneralCommandLine(node.toString(), script.toString(), "--stdio")
      .withWorkDirectory(project.basePath)
  }
}
