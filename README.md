# PromotionCheck

PromotionCheck is a grade tracking app for Swiss high school students. It does not only calculate your averages, it tells you if you are going to pass the year.

The app runs on Android and in the browser. It works fully offline and syncs your data across all your devices as soon as you log in.

Live version: https://456-optiplex.ddns.net

## The idea

At my Gymnasium you do not pass the year with a good average alone. You pass with pluspoints.

Every subject average gets rounded to the nearest half grade. The difference to a 4 is what counts:

* a 5.0 gives you +1 pluspoint
* a 4.5 gives you +0.5 pluspoints
* a 3.5 gives you 2 minuspoints, because everything below a 4 counts double

At the end all points of a year get added up. If the total is negative, you fail.

Most grade apps only show you averages, so you still have to calculate your points yourself and your grades only live on the one device you typed them into.

That is the reason I built PromotionCheck. It shows the pluspoints next to every subject and the total for the whole year, live, every time you enter a new grade, and it syncs everything to your other devices.

## What it can do

* Organize grades in years, subjects, sub subjects and single grades, with a weight on every level
* Show the weighted average and the pluspoints of every element, updated live
* Set a weight to 0 so an element still shows up but does not count
* Dream grade calculator: enter the average you want and the weight of your next exam and it tells you which mark you need
* Analytics page with the progression of your year average over time and a small trend chart for every subject
* Sorting by name, average, mark or date, and coloring thresholds you can set yourself
* Rounding setting from halfs up to hundredths
* Import and export a whole year as a file, so you can move your data or keep a backup
* Account with login, so your data is on all your devices at the same time
* Announcements that I can send to all users from the server, for example before an update

Without an account everything still works. The data just stays on your device.

## Tech stack

**Frontend**
* Vue 3 with the composition API and `<script setup>`
* Pinia for the state, Vue Router for the navigation
* Tailwind CSS for the styling
* Chart.js for the analytics charts
* socket.io client for the live sync

**Mobile**
* Capacitor 8 to build the Vue app into a real Android APK
* `@capacitor-community/sqlite` for the local database, which is native SQLite on Android and sql.js in the browser

**Backend**
* Python with Flask
* Flask SQLAlchemy on a PostgreSQL database
* Flask JWT Extended for the authentication
* Flask SocketIO for the live events
* Redis to keep track of which devices of a user are online

**Hosting**
* My own home server, reachable over a DDNS domain
* Deployed with two small rsync scripts over SSH

## How it works

### Data model

The data is a tree with four levels:

```
Year
 |__ Subject          (weight)
      |__ Grade       (mark, weight, date)
      |__ SubSubject  (weight)
           |__ Grade  (mark, weight, date)
```

A subject either holds its grades directly or it holds sub subjects, which is what you need for subjects like languages, where written and oral get counted separately. Every average is a weighted average of the level below it, so the calculation runs bottom up through the whole tree.

Users are connected to their years over a mapping table. That way the ownership of any element can be checked with one join back to that table.

### Local first storage

Every write goes into the local SQLite database first, then the UI updates, and only after that the app talks to the server. So the app never waits for the network and works completely offline.

Every local row has a `synced` column. New rows start at 0. The push functions only send the rows that are still at 0 and set them to 1 once the server confirmed them.

On the server nothing gets deleted for real, deleted rows only get a `deleted` flag. That flag matters, because a device that was offline while you deleted something has no other way of finding out about it. On the next pull it sees the flag and removes the row locally.

### Sync and live updates

When the app starts it pulls everything from the server and pushes everything that is not synced yet.

For the live part every device gets its own `device_id`, which gets baked into the JWT when you log in. The socket connection then joins two rooms, one for the user and one for `user_id:device_id`. Redis stores which devices of a user are currently connected.

When a request changes something, the backend emits a `sync_required` event to every device of that user except the one that sent the request. So if I add a grade on my phone, my laptop pulls the change a moment later without me doing anything. There is also a `reload_required` event, which is used when the account itself changes, for example after deleting the user.

### Authentication

Passwords are hashed with werkzeug before they go into the database. A login returns a JWT that is valid for 14 days. Every API route sits behind `@jwt_required()` and on top of that checks that the element you are touching really belongs to you, again by joining it back over the year mapping table. Without that second check anyone with a valid token could edit somebody else's grades just by guessing an ID.

### Analytics

The progression chart is not just a list of your marks. For every grade of the year, sorted by date, the whole average tree gets rebuilt with only the grades up to that date. That gives you the real average you had at that moment, with all the weights of the subjects and sub subjects included.

The small trend chart of a subject uses a weighted linear regression over your marks, so a heavy exam pulls the trend line more than a small test.

### Serving

Flask serves the built Vue app itself and falls back to `index.html` on unknown routes, so the router still works when you reload a page. The Android app uses the exact same build, just packed by Capacitor, which means there is only one codebase for both platforms.

## Project structure

```
mobile-app/
  backend/
    app.py           app factory, SPA fallback
    config.py        config and environment variables
    extentions.py    db, jwt, socketio, redis
    models/          SQLAlchemy models
    routes/          auth, years, subjects, sub_subjects, grades, announcements
    app_socket/      socket events and room handling
    utils.py         sync and reload triggers
    announce.py      small CLI script to send announcements
  frontend/
    src/
      views/         the pages
      components/    UI parts, islands, settings, legal texts
      stores/        Pinia stores, all the grade logic lives here
      services/      db, sync, socket, import and export
      models/        plain data classes
    android/         Capacitor Android project
```

## Running it locally

**Backend**

```
cd mobile-app/backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install flask flask_cors flask_sqlalchemy flask_jwt_extended flask_socketio redis
python app.py
```

You need a PostgreSQL database called `pluspointsdb` and a running Redis. The database password and the JWT key are read from the environment variables `DB_PASSWORD` and `JWT_KEY`.

**Frontend**

```
cd mobile-app/frontend
npm install
npm run dev
```

**Android**

```
npm run build
npx cap sync
npx cap run android
```

## Status

The app is finished and I use it every day for my own grades, mostly to catch the last bugs before I put it out. It is not published yet. The domain is not transferred and I do not hand out the APK, so right now it only runs on my server and on my own phone.

What I still want to do: put it on the Play Store, move it to the real domain and add a dark mode.
