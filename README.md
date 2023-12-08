# PREREQUISITES:

This is a **monorepo** setup using **npm workspaces**.
<br><br>

---

# HOW DO I RUN THIS?

Everything must be run from the root - assuming you have downloaded the source code in `c:\somefolder\openfin-react`.

- The root is `c:\somefolder\openfin-react`
- this is the folder where you will run the scripts below to run the various things

```
C:\someFolder\openfin-react
├── README.md
├── node_modules
├── package.json
├── packages
│   ├── apps
│   ├── common
│   ├── openfin-platform
├── poc-meeting-notes
└── npm run.lock
```

# SCRIPTS

    IMPORTANT: Run these in the order listed below

## STEP-1:

- Install all dependencies
- use `npm run install --frozen-lockfile`

## STEP-2:

- Run `apps`
- use `npm run start:apps`
- this will start a react app on `localhost:3000`
- most of the features in these apps are meant to run under `openfin-platform` project
  - but you can still run the apps in browser without these features -- eg. to style and layout your react component. 
  - It will be easier to do that with browser than in openfin-platform.
  - then use the entries defined in `webpack.common.js` to start one of the apps

## STEP-3:

- we need to serve `openfin-platform`
- use `npm run serve:platform`
  - this will serve the platform on `localhost:3100`

## STEP-4:

- launch Openfin Platform with the manifest served from `localhost:3100`
- use `npm run launch:platform`
