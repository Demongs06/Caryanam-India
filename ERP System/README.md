# HRMS

React + Vite frontend, Express API, MongoDB database and Cloudinary PDF storage.

## Local development

### Backend

1. Open `backend`.
2. Install dependencies: `npm install`.
3. Copy `.env.example` to `.env` and fill in MongoDB, JWT, Cloudinary and first-admin settings.
4. Start the API: `npm start`.

The API runs on `http://localhost:5000`. Health check: `http://localhost:5000/api/health`.

### Frontend

1. Open `employee-dashboard`.
2. Install dependencies: `npm install`.
3. Create `.env.local` with `VITE_API_URL=http://localhost:5000`.
4. Start React: `npm run dev`.

## Deployment

### Netlify

- Base directory: `ERP System/employee-dashboard`
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com`

The included `netlify.toml` configures the build and React Router fallback.

### Render

- Root directory: `ERP System/backend`
- Runtime: Node
- Build command: `npm install`
- Start command: `npm start`
- Region: Singapore
- Plan: Free (service sleeps when idle)

Set these environment variables in Render:

- `MONGODB_URI`, `MONGODB_DB`
- `JWT_SECRET` (random value, at least 32 characters)
- `CLIENT_URL` (your Netlify site origin)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` for the first admin

The first admin is created only when the MongoDB employees collection is empty. Changing these bootstrap variables later does not reset an existing account.

## Demo mode

Use a separate MongoDB database for the public portfolio demo. Set `DEMO_MODE=true` and configure `DEMO_ADMIN_EMAIL`, `DEMO_ADMIN_PASSWORD`, `DEMO_EMPLOYEE_EMAIL` and `DEMO_EMPLOYEE_PASSWORD`. The first startup creates fictional demo accounts and sample attendance, leave and holiday records. Do not use demo mode or demo credentials for actual employee information.

## Security and operational notes

- Passwords are stored as bcrypt hashes; JWT and service credentials are environment variables.
- Employee and admin routes enforce roles on the API, not only in React.
- Payslip PDFs are uploaded as authenticated Cloudinary raw assets. The API returns short-lived signed download URLs only after authentication.
- The current app is a single-organization HRMS. Before using it for real payroll, configure backups, access reviews, retention policies, audit requirements and a separate production database. Free hosting is suitable for a demo, not a production availability or backup guarantee.
- Existing JSON seed files are not imported. They contain old test records and plaintext passwords; fresh MongoDB collections start without those records.
