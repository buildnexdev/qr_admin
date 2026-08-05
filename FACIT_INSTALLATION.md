# Facit Modern — NammaQr Installation Guide

This project integrates the **[Facit Modern](https://facit-modern.omtanke.studio/)** admin template into NammaQr, following the official [Facit installation steps](https://facit.omtanke.studio/getting-started/installation).

## Prerequisites

- **Node.js** 18+ (Facit requires 16+)
- **npm** or **yarn**
- Facit license / template files (reference: `getitnow-thala` project)

## Installation Steps

### 1. Install dependencies

```bash
cd c:\MAMP\htdocs\Nammaqr\qr_admin
npm install --legacy-peer-deps
```

### 2. Environment configuration (`.env`)

Facit uses `REACT_APP_*` variables. In this Vite project they are defined as `VITE_*` in `.env` and mapped in `vite.config.ts`:

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_MODERN_DESIGN` | `true` | Floating glass panels (`body.modern-design`) |
| `VITE_ASIDE_TOUCH_STATUS` | `true` | Draggable sidebar handle |
| `VITE_DARK_MODE` | `false` | Default theme |
| `VITE_PRIMARY_COLOR` | `#2d5cfe` | NammaQr brand blue |

### 3. Start development server

```bash
npm run dev
```

Open **http://localhost:5173** → login → `/admin` to see the Facit shell.

### 4. Production build

```bash
npx vite build
```

## Project Structure (Facit)

```
qr_admin/src/
├── layout/              # Facit shell (Aside, Header, Footer, Wrapper)
├── styles/styles.scss   # Full Facit ITCSS theme
├── components/bootstrap/# Facit UI kit (Card, Button, Modal…)
├── components/facit/
│   └── FacitShell.tsx   # Admin layout wrapper
├── pages/_layout/
│   ├── _asides/         # NammaQr sidebar
│   ├── _headers/        # NammaQr header
│   └── _footers/        # NammaQr footer
├── routes/
│   ├── asideRoutes.tsx
│   ├── headerRoutes.tsx
│   └── footerRoutes.tsx
├── hooks/               # useDarkMode, useDeviceScreen, useAsideTouch
├── contexts/
│   └── themeContext.tsx
└── .env                 # Facit configuration
```

## How it works

- **Public pages** (`/`, `/login`, `/register`) use the existing NammaQr UI.
- **Admin pages** (`/admin/*`) use `FacitShell`:
  - Dark collapsible sidebar with NammaQr menu
  - Glass header with search, theme toggle, profile
  - Facit `styles.scss` (blur, shadows, modern-design layout)
  - All existing NammaQr pages (Dashboard, Menu, Orders…) render inside `<Outlet />`

## Customization

1. **Colors** — edit `.env` `VITE_PRIMARY_COLOR` and `src/styles/settings/_index.scss`
2. **Sidebar menu** — edit `src/const/menu.ts`
3. **Header actions** — edit `src/pages/_layout/_headers/NammaQrFacitHeader.tsx`

## Reference

- Live demo: [facit-modern.omtanke.studio](https://facit-modern.omtanke.studio/)
- Documentation: [facit.omtanke.studio](https://facit.omtanke.studio/)
- Storybook: [facit-story.omtanke.studio](https://facit-story.omtanke.studio/)
