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
│   ├── openfin-platform
```

# SCRIPTS

    IMPORTANT: Run these in the order listed below

## STEP-1:

- Install all dependencies
- use `npm run install`

## STEP-2:

- we need to serve `openfin-platform`
- use `npm run serve`
  - this will serve the platform on `localhost:3100`

## STEP-4:

- launch Openfin Platform with the manifest served from `localhost:3100`
- use `npm run launch`
