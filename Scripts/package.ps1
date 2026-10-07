param(
    [string]$ProjectRoot = (Split-Path $PSScriptRoot -Parent),
    [string]$BuildOutputDir,
    [string]$PackageOutputDir,
    [string]$ReleaseName,
    [string]$StepResultPath
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($BuildOutputDir) -or -not (Test-Path -LiteralPath $BuildOutputDir -PathType Container)) {
    throw "Build output is required before packaging FancyLib."
}
if ([string]::IsNullOrWhiteSpace($PackageOutputDir) -or [string]::IsNullOrWhiteSpace($ReleaseName)) {
    throw "SPB package output and release name are required."
}

$Payload = Join-Path $PackageOutputDir "source"
New-Item -ItemType Directory -Force -Path $Payload | Out-Null
Copy-Item -LiteralPath $BuildOutputDir -Destination $Payload -Recurse -Force
$ArchiveName = "$ReleaseName-source.zip"
$ArchivePath = Join-Path $PackageOutputDir $ArchiveName
Compress-Archive -Path (Join-Path $Payload "*") -DestinationPath $ArchivePath -CompressionLevel Optimal -Force

@{ schema = "saturno-spb-step-result/v1"; step = "package"; status = "success"; artifacts = @($ArchiveName) } |
    ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $StepResultPath -Encoding utf8
