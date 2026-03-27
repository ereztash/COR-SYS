$desktop = [Environment]::GetFolderPath("Desktop")
$shell = New-Object -ComObject WScript.Shell
$sc = $shell.CreateShortcut("$desktop\COR-SYS.lnk")
$sc.TargetPath = "$desktop\cor-sys\start-corsys.bat"
$sc.WorkingDirectory = "$desktop\cor-sys"
$sc.Description = "COR-SYS"
$sc.WindowStyle = 7
$sc.Save()
Write-Host "Done: $desktop\COR-SYS.lnk"
