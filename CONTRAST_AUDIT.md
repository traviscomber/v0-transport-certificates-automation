# Conductor Portal - Contrast & Branding Audit

## ISSUES FOUND:

### 1. Layout & Sidebar (app/conductor/layout.tsx)
- ❌ OLD: Light theme (white bg, light nav) mixing with dark pages
- ✅ FIXED: Changed to dark theme (slate-950 bg, slate-700 borders)
- ✅ FIXED: Orange brand color in logo and hover states

### 2. Dashboard (app/conductor/page.tsx)
- ❌ OLD: Blue text for compliance percentage
- ✅ FIXED: Changed to orange (#ff6b35)
- ⚠️ TODO: Check all text colors for WCAG AA contrast

### 3. Documentos (app/conductor/documentos/page.tsx)
- ❌ Text contrast issues on dark backgrounds
- ❌ Badge colors not following brand
- ⚠️ TODO: Update all text to white/light colors
- ⚠️ TODO: Update badges to use orange/green/red proper contrast

### 4. Perfil (app/conductor/perfil/page.tsx)
- ✅ Already has good dark theme
- ⚠️ TODO: Verify all input backgrounds and labels have proper contrast

### 5. Upload (app/conductor/upload/page.tsx)
- ⚠️ TODO: Check for contrast issues with form inputs

### 6. Onboarding (components/conductor/onboarding-guide.tsx)
- ✅ Good branding with orange/navy/cyan
- ⚠️ TODO: Verify text contrast ratios WCAG AA+

## BRANDBOOK COLORS TO USE:
- Primary Orange: #ff6b35
- Navy/Slate: #0f172a / #1e293b
- Cyan Accent: #00d9ff
- White Text: #ffffff (on dark)
- Light Gray Text: #cbd5e1 (secondary info)
- Dark Gray Text: #94a3b8 (tertiary)

## WCAG AA Standards:
- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- Focus indicators: Clearly visible

## ACTION ITEMS:
- [ ] Verify all text on dark backgrounds has 4.5:1 contrast
- [ ] Update all blues to orange (#ff6b35) for CTAs
- [ ] Verify all inputs have visible labels and focus states
- [ ] Test with WCAG contrast checker tool
