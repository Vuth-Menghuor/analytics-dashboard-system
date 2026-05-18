# Analytics Dashboard Nuxt App

Nuxt frontend for the analytics dashboard. The app is organized by feature so pages stay small and reusable logic can scale as Moodle APIs replace the current mock service data.

## Project Structure

```text
app/
  assets/css/          Global CSS split by base, layout, feature, and responsive rules
  components/          Vue components grouped by feature or shared UI responsibility
    account/           Account settings/profile modal pieces
    auth/              Login/signup form helpers
    charts/            Chart presentation components
    common/            Reusable state/filter UI
    courses/           Course analytics feature view
    dashboard/         Dashboard and generic analytics workspaces
    sidebar/           Sidebar layout pieces
    students/          Student analytics feature view
    tables/            Typed analytics table wrappers
  composables/         State and view-model logic, grouped by feature
  constants/           Static navigation, colors, dashboard, and settings config
  layouts/             App and auth shells
  middleware/          Route auth and role guards
  pages/               Thin route wrappers with page metadata only
  services/            API/service boundary; swap mock data for backend calls here
  stores/              Pinia stores
  types/               Shared TypeScript contracts
```

## Scaling Rules

- Keep route files in `app/pages` thin: define page metadata and render a feature component.
- Put shared UI in `components/common`, `components/charts`, or `components/tables`.
- Put feature-specific UI in its feature folder, for example `components/courses`.
- Keep loading, filtering, and derived view state in composables instead of page templates.
- Keep backend/mock boundaries in `services`; components should consume typed composables.
- Add shared contracts in `types` before passing broad records between components.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
