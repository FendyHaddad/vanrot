package com.vankode.vanrot.intellij

import com.intellij.openapi.project.Project
import com.intellij.openapi.vfs.VirtualFile
import com.intellij.platform.lsp.api.LspServerSupportProvider
import com.intellij.platform.lsp.api.LspServerSupportProvider.LspServerStarter

class VanrotLspServerSupportProvider : LspServerSupportProvider {
  override fun fileOpened(project: Project, file: VirtualFile, serverStarter: LspServerStarter) {
    if (!VanrotTemplateFiles.isTemplate(file.name)) return
    serverStarter.ensureServerStarted(VanrotLspServerDescriptor(project))
  }
}
