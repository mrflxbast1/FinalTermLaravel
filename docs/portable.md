# Portable Windows edition

The portable ZIP is for running and presenting Stockroom. The source ZIP is for GitHub and development. They contain the same application, but the portable version also includes its runtime and built dependencies.

## Downloads

- `FinalTermLaravel-source.zip`: the complete application source, without a private `.env`, database, installed dependencies, or local development tools. It is also available through GitHub's Code download.
- `Stockroom-1.0.0-windows-x64.zip`: the ready-to-run Windows edition. Recipients extract it and double-click `Open Stockroom.cmd`.
- `Stockroom-1.0.0-windows-x64.zip.sha256`: optional checksum for verifying that a download is intact.

Project owner: **Basty Mirafelix**, [mrflxbast1](https://github.com/mrflxbast1), mirafelixjohnbasty@gmail.com.

The source and ready-to-run downloads are published together at [FinalTermLaravel Releases](https://github.com/mrflxbast1/FinalTermLaravel/releases).

## Publishing an updated version

1. Commit the application changes to the main branch and run the application tests.
2. Build and verify the new portable version using the commands below.
3. Create a GitHub release with a matching version tag and attach the portable ZIP, checksum, and source ZIP.
4. Update the download link in README.md when the version changes. Keep large release binaries outside the source tree.

## Using the portable package

Extract the complete archive to a writable folder on a Windows 10/11 x64 PC. Double-click `Open Stockroom.cmd`. The first launch creates an application key, database, demo accounts, and sample inventory. Later launches preserve them.

The terminal displays the app's address and opens the default browser after checking that the login page is ready. It uses only `127.0.0.1`, so it is accessible on the same PC. If port 8000 is occupied, another port is selected. A second launch reopens the verified running instance belonging to that folder.

Press **Q** in the launcher window to stop, or close that window. Closing the browser alone leaves the local server running. A Windows job object makes the server exit when its launcher closes, including an abrupt console close.

### Windows runtime exception

PHP needs Microsoft's Visual C++ runtime. Many PCs already have it. If the bundled PHP cannot start because this runtime is missing, the launcher offers to download the [official Microsoft installer](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist). It verifies the Microsoft signature before opening the installer. The installer displays its own terms and may request administrator approval or a restart. Internet is only needed for this exceptional first-time repair; normal launches do not download anything.

### Data and backups

Keep `app/.env` and `app/database/database.sqlite` together. The former contains the application key; the latter stores accounts and inventory. Close the launcher before backing up the entire folder. A used portable folder contains your data; share the original release ZIP to give someone a fresh copy.

Password-reset links are written to `app/storage/logs/laravel.log` instead of being emailed. They contain the correct address for the port chosen on that launch.

Do not overwrite an existing installation with a new ZIP. Keep a backup and use a fresh folder for the new version. This release does not provide an automatic update or database transfer tool.

### Troubleshooting

- **Missing runtime or files:** extract the whole ZIP; do not open the CMD file from inside the archive.
- **Cannot write to the folder:** extract under Documents rather than Program Files or a read-only location.
- **Browser did not open:** use the address printed in the launcher.
- **Windows runtime error:** follow the launcher's Microsoft installer instructions.
- **Startup failure:** read the terminal and `app/storage/logs/portable-server-error.log` or `laravel.log`.
- **Missing `.env` with an existing database:** restore both files from the same backup. The launcher refuses to generate a replacement key over an existing database.

## Building a release

Maintainers need the development prerequisites described in the README. From the source checkout:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/build-portable.ps1 -Version 1.0.0
powershell.exe -NoProfile -ExecutionPolicy Bypass -File tests/portable-smoke.ps1 -Archive dist/Stockroom-1.0.0-windows-x64.zip
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/build-source.ps1
```

The builder uses the PHP version and SHA-256 pinned in `packaging/php-runtime.json`, installs production Composer dependencies from the lockfile into a new staging directory, builds the frontend, and copies only application files. It never packages the developer's database or `.env`. PHP and frontend license notices travel with the release. Output is ignored under `dist/` and an existing release is never overwritten.

Use `-PhpArchive path/to/the-matching-php.zip` to build from a previously downloaded official archive; its checksum is still verified. Updating PHP requires checking the new official archive's hash and changing the manifest deliberately.

For scripted checks, `app/scripts/portable.ps1 -InitializeOnly` prepares the data without serving; `-NoBrowser` starts the server without opening a browser. These options are intended for maintenance and release verification.
