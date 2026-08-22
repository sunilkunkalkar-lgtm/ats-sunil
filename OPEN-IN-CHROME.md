# Open this ATS in Chrome

GitHub is only the **code**. `http://127.0.0.1:3000` only works after a server is running on **your** computer. If that link fails, use GitHub Codespaces — it gives a real `https://` address Chrome can open.

## Easiest: GitHub Codespaces (no Node install)

1. Open https://github.com/sunilkunkalkar-lgtm/ats-sunil while logged into GitHub.
2. Click the green **Code** button.
3. Click the **Codespaces** tab.
4. Click **Create codespace on main**.
5. Wait until the editor finishes setting up (a few minutes the first time).
6. Open the **Ports** tab (bottom of the window).
7. Find port **3000**, right-click it, choose **Visibility** → **Public** if needed, then click the **globe** (Open in Browser).
8. Copy that `https://….app.github.dev` address into a new Chrome tab.

Keep the Codespace running. If you stop it, the Chrome link dies until you start the Codespace again.

## On your Windows PC instead

1. Install Node.js LTS from https://nodejs.org and reboot.
2. Unzip the repo (or `git pull`).
3. Double-click `start-ats.bat` and **leave the black window open**.
4. In Chrome type: `http://127.0.0.1:3000`  
   Not `https`. Not port `3001`. Do not click a Cursor preview link.
