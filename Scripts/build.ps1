param(
    [string]$ProjectRoot = (Split-Path $PSScriptRoot -Parent),
    [ValidateSet("development", "production")][string]$Environment = "development",
    [int]$BuildNumber,
    [string]$BuildOutputDir,
    [string]$StepResultPath
)

$ErrorActionPreference = "Stop"
$ProjectRoot = (Resolve-Path -LiteralPath $ProjectRoot).ProviderPath

if ([string]::IsNullOrWhiteSpace($BuildOutputDir)) {
    throw "SPB must provide -BuildOutputDir."
}

Write-Host "==> Building Saturno.VSCode.FancyLib"
Write-Host "==> Environment: $Environment"

Push-Location -LiteralPath $ProjectRoot
try {
    Write-Host "==> npm run compile"
    & npm run compile
    if ($LASTEXITCODE -ne 0) { throw "TypeScript compilation failed." }
}
finally {
    Pop-Location
}

# This library has no VS Code extension of its own and no npm publish - per VERSION.json
# it is distributed as a git submodule at the TypeScript-source level, and each of the
# three sibling extensions compiles Source/*.ts itself as part of its own build. The
# staged artifact is therefore the source tree the submodule actually exposes (proven to
# type-check cleanly by the npm compile above), not a compiled bundle nobody imports.
Copy-Item -Path (Join-Path $ProjectRoot "Source") -Destination $BuildOutputDir -Recurse -Force
Copy-Item -LiteralPath (Join-Path $ProjectRoot "package.json") -Destination $BuildOutputDir -Force
Copy-Item -LiteralPath (Join-Path $ProjectRoot "LICENSE.txt") -Destination $BuildOutputDir -Force
Copy-Item -LiteralPath (Join-Path $ProjectRoot "README.md") -Destination $BuildOutputDir -Force

if (-not [string]::IsNullOrWhiteSpace($StepResultPath)) {
    @{ schema = "saturno-spb-step-result/v1"; step = "build"; status = "success"; artifacts = @("Source/index.ts") } |
        ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $StepResultPath -Encoding utf8
}

Write-Host "==> Done"
