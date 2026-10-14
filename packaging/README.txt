STOCKROOM - WINDOWS PORTABLE EDITION
Project owner: Basty Mirafelix
Contact: mirafelixjohnbasty@gmail.com
GitHub: https://github.com/mrflxbast1

1. Extract the whole ZIP to a writable folder (for example, Documents).
2. Double-click Open Stockroom.cmd. The browser opens when Stockroom is ready.
3. Sign in with admin@stockroom.test / Stockroom123!

Keep the Stockroom terminal open while using the app. Press Q in that
window, or close it, to stop the local server. Closing just the browser
does not stop the app. Double-clicking again reopens the same running copy.

Windows 10/11, 64-bit Intel/AMD. No separate PHP, Composer, Node.js, Git,
or database installation is required. If Microsoft's Visual C++ runtime
is missing, the launcher offers its official installer. That one-time
repair requires internet and may ask for administrator approval.

The first launch creates your own database and application key. Later
launches preserve your work. Normal use works offline. Nothing is hosted
online or synchronized between computers.

Other accounts (same initial password: Stockroom123!):
  manager@stockroom.test - manage inventory
  user@stockroom.test    - view only
New registrations have the User role. Admin can change roles in Team members.

BACKUP: Close Stockroom, then copy this entire extracted folder. Your data
is in app/database/database.sqlite and its key is in app/.env. Keep both.
Do not send a used copy to someone else if it contains your private data.
Share the original release ZIP for a fresh installation instead.

Forgot password? Reset links are written to app/storage/logs/laravel.log;
this local app does not send email.

If the browser does not open, use the address printed in the terminal.
The launcher chooses another port if 8000 is busy. If startup fails, read
the terminal message and app/storage/logs/portable-server-error.log.
Do not run from inside the ZIP, a read-only folder, or Program Files.

This release includes PHP and third-party libraries under their own
licenses. See licenses/, runtime/php/license.txt, runtime/php/readme-redist-bins.txt,
and the license files in app/vendor/. Source and rebuild instructions
are supplied in the project's GitHub repository.
