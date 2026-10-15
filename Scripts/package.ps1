param(
    [string]$ProjectRoot,
    [string]$Preset,
    [string]$Environment,
    [string]$ExportMode,
    [int]$BuildNumber,
    [string]$ReleaseName,
    [string]$BuildOutputDir,
    [string]$PackageOutputDir,
    [string]$BuildChannel,
    [string]$StepResultPath,
    [string]$SpbDriverRoot,
    [Parameter(ValueFromRemainingArguments = $true)][string[]]$ForwardedArgs
)

$ErrorActionPreference = "Stop"
if ([string]::IsNullOrWhiteSpace($SpbDriverRoot)) { throw "This v2 hook must be invoked by spb." }
. (Join-Path $SpbDriverRoot "drivers\node-source-library.ps1")
$DriverArguments = @{} + $PSBoundParameters
$null = $DriverArguments.Remove("SpbDriverRoot")
Invoke-SpbNodeSourceLibraryPackage @DriverArguments
