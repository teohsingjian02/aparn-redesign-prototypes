# Opens the template DOCX in Microsoft Word (proving it opens), reports its page count and exports a tagged PDF reading copy.
#   powershell -ExecutionPolicy Bypass -File tools/word_export.ps1
param(
  [string]$Docx = (Join-Path $PSScriptRoot "..\static\downloads\APARN-Research-Progress-Template-draft-v0.1.docx"),
  [string]$Pdf = (Join-Path $PSScriptRoot "..\static\downloads\APARN-Research-Progress-Template-draft-v0.1.pdf")
)
$ErrorActionPreference = "Stop"
$Docx = (Resolve-Path $Docx).Path
$Pdf = [System.IO.Path]::GetFullPath($Pdf)
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
  $doc = $word.Documents.Open($Docx, $false, $true)
  $pages = $doc.ComputeStatistics(2)
  $words = $doc.ComputeStatistics(0)
  # 17 = wdExportFormatPDF; 1 = wdExportCreateHeadingBookmarks; DocStructureTags = tagged PDF
  $doc.ExportAsFixedFormat($Pdf, 17, $false, 0, 0, 1, 1, 0, $true, $true, 1, $true, $true, $false)
  $doc.Close($false)
  Write-Output "opened $([System.IO.Path]::GetFileName($Docx)): $pages pages, $words words"
  Write-Output "wrote $([System.IO.Path]::GetFileName($Pdf)) ($([math]::Round((Get-Item $Pdf).Length / 1KB)) KB)"
} finally {
  $word.Quit()
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}
