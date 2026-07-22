# Bug Fix Log: Lid Label Color/Texture Removing Global Material

## Issue Description
**User Report:** "I applied the face color only to the lid label and save after in editor 1 it removes the texture to all material. So only remove texture to applied color or face color to material instead of all one."

**Behavior:** When applying a custom graphic or color to a specific face (e.g., "Lid Label") using Editor 2, saving and returning to Editor 1 would accidentally delete the PBR texture (like a pattern) from the entire model.

## Root Cause
The bug existed in two main areas:

1. **`handleBackToModelViewer` (in `src/pages/EditorPage.jsx`)**: 
   When saving a graphic for a specific target material (e.g., "Lid Label"), the logic was aggressively clearing the material state using `delete nextMaterials[targetMat]` or setting it to `null`. For non-wearable models, this caused a cascading failure where Editor 1 would fall back to the "all" material, or the deletion logic would inadvertently wipe out the underlying base texture for the rest of the object.

2. **Material Fallback Logic (in `src/components/editor/EditorScreen1.jsx`)**: 
   Inside the rendering loop, `materialType` was defined using `appliedMaterials[id] || appliedMaterials["all"]`. If a specific face (like "Lid Label") was set to `null` to clear its texture, this `||` operator evaluated it as falsy and mistakenly fell back to applying the global `"all"` material anyway, or vice versa, causing unexpected texture removals.

## Solution / Implementation
To ensure this doesn't happen again in future updates, ensure the following logic is maintained:

### 1. In `src/pages/EditorPage.jsx` (`handleBackToModelViewer` & `handleApplyColor`)
- **Do NOT delete base materials when applying a decal:** When a graphic is applied to a specific label on non-wearable models, we now use a Decal Mesh that sits *on top* of the base material.
- **Do not aggressively delete `newMaterials`:** In `handleBackToModelViewer`, we removed the blocks that delete `newMaterials[targetMat]`. The base PBR material MUST be retained so that the rest of the model keeps its texture, while the decal mesh naturally covers the specific label face.

### 2. In `src/components/editor/EditorScreen1.jsx` (Material Fallback)
- **Strict Undefined Checking:** When resolving `materialType` or `colorHex` for a specific face (`id`), you must use a strict `undefined` check rather than a truthy `||` fallback.
- **Correct Code Pattern:**
  ```javascript
  let materialType =
    last === "color"
      ? null
      : appliedMaterials
        ? appliedMaterials[id] !== undefined
          ? appliedMaterials[id]
          : appliedMaterials["all"]
        : null;
  ```
- By checking `!== undefined`, we allow a face to explicitly be set to `null` (meaning "no texture here") without accidentally triggering the fallback to `appliedMaterials["all"]`. This ensures isolated faces like the "Lid Label" can act independently from the rest of the container's body.
