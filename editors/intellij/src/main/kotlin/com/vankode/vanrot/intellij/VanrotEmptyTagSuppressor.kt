package com.vankode.vanrot.intellij

import com.intellij.codeInspection.InspectionSuppressor
import com.intellij.codeInspection.SuppressQuickFix
import com.intellij.psi.PsiElement

class VanrotEmptyTagSuppressor : InspectionSuppressor {
  override fun isSuppressedFor(element: PsiElement, toolId: String): Boolean {
    if (toolId != EMPTY_TAG_INSPECTION) return false
    val name = element.containingFile?.name ?: return false
    return VanrotTemplateFiles.isTemplate(name)
  }

  override fun getSuppressActions(
    element: PsiElement?,
    toolId: String,
  ): Array<SuppressQuickFix> = SuppressQuickFix.EMPTY_ARRAY

  private companion object {
    const val EMPTY_TAG_INSPECTION = "CheckEmptyScriptTag"
  }
}
