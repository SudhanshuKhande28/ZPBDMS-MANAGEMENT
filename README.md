# ZPBDMS Team Register

A small shared tracker for issues, tasks, and district rollout status —
same as the version you saw in chat, but as a real website your team
can open on their own, with no Claude tab needed. Everyone who opens
the link sees the same live data.

It needs two things to go live:
1. **A database** — using Firebase Firestore (free, no server to manage).
2. **A place to host the website itself** — Vercel is the easiest (free, connects to GitHub).

Total time: about 15–20 minutes the first time.

---

## Step 1 — Install Node.js (if you don't have it)

Download the LTS version from https://nodejs.org and install it.
Check it worked by running in a terminal:
```
node -v
```

## Step 2 — Create a free Firebase project

1. Go to https://console.firebase.google.com and sign in with a Google account.
2. Click **Add project**, give it a name (e.g. `zpbdms-register`), and finish the wizard (you can decline Google Analytics).
3. In the left sidebar, click **Build → Firestore Database → Create database**. Choose a location close to India (e.g. `asia-south1`), and start in **production mode**.
4. Once created, go to the **Rules** tab of Firestore and replace the contents with what's in `firestore.rules` in this project, then **Publish**.
5. In the left sidebar, click the gear icon → **Project settings**. Under "Your apps", click the **</>** (web) icon to register a new web app (any nickname is fine, no need for Firebase Hosting yet).
6. Firebase will show you a `firebaseConfig` object. Copy it.

## Step 3 — Paste your config into the project

Open `src/firebase.js` in this project and replace the placeholder
`firebaseConfig` values with the ones you copied.

## Step 4 — Run it locally to check it works

In a terminal, inside this project folder:
```
npm install
npm run dev
```
Open the URL it prints (usually `http://localhost:5173`). Try adding
an issue — if it appears and the "Saved" indicator shows up, your
database is connected correctly.

## Step 5 — Put the code on GitHub

1. Create a free account at https://github.com if you don't have one.
2. Create a new repository (e.g. `zpbdms-register`).
3. In this project folder, run:
```
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/zpbdms-register.git
git push -u origin main
```

## Step 6 — Deploy on Vercel (free)

1. Go to https://vercel.com and sign up using your GitHub account.
2. Click **Add New → Project**, and select your `zpbdms-register` repo.
3. Vercel auto-detects it's a Vite app — leave the defaults and click **Deploy**.
4. In a minute or two you'll get a live URL like
   `https://zpbdms-register.vercel.app` — share that with your team.

Any time you push a change to GitHub, Vercel redeploys automatically.

---

## Notes

- **Who can edit:** anyone with the link can read and write the
  tracker (see `firestore.rules`). That's simplest for a small
  internal team. If you later want to restrict it to specific
  teammates, add Firebase Authentication (Google sign-in is a common
  choice) and I can help wire that in.
- **Cost:** Firebase's free tier and Vercel's free tier are both far
  more than a small team tracker will use.
- **Changing the design or fields:** all the UI and data logic is in
  `src/App.jsx` — it's the same component structure as the in-chat
  version, so anything you'd ask me to change there applies here too.
