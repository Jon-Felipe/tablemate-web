# TableMate

TableMate is a restaurant discovery web app. Browse restaurants, view details and menus, create an account, and access your profile.

## Features

- Browse restaurants with cuisine, location, description, and rating details.
- View restaurant information and menu items.
- Register, log in, and view a protected account profile.
- Responsive interface built with React and TypeScript.

## Getting started

### Requirements

- Node.js and npm
- A TableMate API server

### Install and run

```sh
npm ci
```

Create a `.env.local` file in the project root and set the API base URL:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Replace the example URL with the base URL for your API server. The app expects the API to provide restaurant and menu data as well as registration, login, and current-user endpoints.

Start the development server:

```sh
npm run dev
```

Vite prints the local URL when the server is ready.

## Application routes

| Route | Description | Access |
| --- | --- | --- |
| `/` | Browse restaurants | Public |
| `/restaurants/:id` | View a restaurant and its menu | Public |
| `/login` | Log in to an account | Public |
| `/register` | Create an account | Public |
| `/profile` | View account details and log out | Requires authentication |

## API

Requests are made relative to `VITE_API_BASE_URL`. Responses use an envelope with `statusCode`, `message`, and `data` fields. The app uses these endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/restaurants` | List restaurants |
| `GET` | `/restaurants/:id` | Get a restaurant |
| `GET` | `/restaurants/:id/menu` | Get a restaurant menu |
| `POST` | `/users` | Register a user |
| `POST` | `/users/login` | Log in and receive an access token |
| `GET` | `/users/me` | Get the authenticated user's profile (Bearer token required) |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create a production build |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run Oxlint |

## Built with

- React and TypeScript
- Vite
- React Router
- Redux Toolkit and RTK Query
- Vitest and Testing Library
