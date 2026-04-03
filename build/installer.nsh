!macro _TryUninstallLegacyByDir INSTALL_DIR
  ${if} ${FileExists} "${INSTALL_DIR}\Uninstall Aolong Finance System.exe"
    DetailPrint "Found old version in ${INSTALL_DIR}, uninstalling..."
    ExecWait '"${INSTALL_DIR}\Uninstall Aolong Finance System.exe" /S /KEEP_APP_DATA _?=${INSTALL_DIR}' $R0
    Sleep 800
  ${endif}
!macroend

!macro customInit
  # electron-builder already tries uninstall via registry.
  # This is a fallback path-based cleanup for legacy installs.
  !insertmacro _TryUninstallLegacyByDir "$PROGRAMFILES64\Aolong Finance System"
  !insertmacro _TryUninstallLegacyByDir "$PROGRAMFILES\Aolong Finance System"
  !insertmacro _TryUninstallLegacyByDir "$LOCALAPPDATA\Programs\Aolong Finance System"
!macroend
