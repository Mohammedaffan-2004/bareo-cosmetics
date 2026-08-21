Add-Type -AssemblyName System.Drawing

$files = Get-ChildItem -Path "public" -Recurse -Include "*.jpg","*.jpeg"
foreach ($f in $files) {
    try {
        $bmp = [System.Drawing.Bitmap]::FromFile($f.FullName)
        $out = Join-Path "scratch" ($f.BaseName + ".png")
        $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Dispose()
        Write-Host "Converted: $($f.Name) -> $out"
    } catch {
        Write-Host "Error converting $($f.Name): $_"
    }
}
