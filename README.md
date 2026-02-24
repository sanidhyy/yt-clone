<a name="readme-top"></a>

# AI-Powered YouTube Clone using Next.js 15 and Mux

![AI-Powered YouTube Clone using Next.js 15 and Mux](/.github/images/img_main.png 'AI-Powered YouTube Clone using Next.js 15 and Mux')

[![Ask Me Anything!](https://flat.badgen.net/static/Ask%20me/anything?icon=github&color=black&scale=1.01)](https://github.com/sanidhyy 'Ask Me Anything!')
[![GitHub license](https://flat.badgen.net/github/license/sanidhyy/yt-clone?icon=github&color=black&scale=1.01)](https://github.com/sanidhyy/yt-clone/blob/main/LICENSE 'GitHub license')
[![Maintenance](https://flat.badgen.net/static/Maintained/yes?icon=github&color=black&scale=1.01)](https://github.com/sanidhyy/yt-clone/commits/main 'Maintenance')
[![GitHub branches](https://flat.badgen.net/github/branches/sanidhyy/yt-clone?icon=github&color=black&scale=1.01)](https://github.com/sanidhyy/yt-clone/branches 'GitHub branches')
[![Github commits](https://flat.badgen.net/github/commits/sanidhyy/yt-clone?icon=github&color=black&scale=1.01)](https://github.com/sanidhyy/yt-clone/commits 'Github commits')
[![GitHub issues](https://flat.badgen.net/github/issues/sanidhyy/yt-clone?icon=github&color=black&scale=1.01)](https://github.com/sanidhyy/yt-clone/issues 'GitHub issues')
[![GitHub pull requests](https://flat.badgen.net/github/prs/sanidhyy/yt-clone?icon=github&color=black&scale=1.01)](https://github.com/sanidhyy/yt-clone/pulls 'GitHub pull requests')
[![Vercel status](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://newtube-clone.vercel.app 'Vercel status')

<!-- Table of Contents -->
<details>

<summary>

# :notebook_with_decorative_cover: Table of Contents

</summary>

- [Folder Structure](#bangbang-folder-structure)
- [Getting Started](#toolbox-getting-started)
- [Screenshots](#camera-screenshots)
- [Tech Stack](#gear-tech-stack)
- [Stats](#wrench-stats)
- [Contribute](#raised_hands-contribute)
- [Acknowledgements](#gem-acknowledgements)
- [Buy Me a Coffee](#coffee-buy-me-a-coffee)
- [Follow Me](#rocket-follow-me)
- [Learn More](#books-learn-more)
- [Deploy on Vercel](#page_with_curl-deploy-on-vercel)
- [Give A Star](#star-give-a-star)
- [Star History](#star2-star-history)
- [Give A Star](#star-give-a-star)

</details>

## :bangbang: Folder Structure

Here is the folder structure of this app.

<!--- FOLDER_STRUCTURE_START --->
```bash
yt-clone/
  |- migrations/
  |- public/
  |- src/
    |-- app/
      |--- (auth)/
      |--- (home)/
      |--- (studio)/
      |--- api/
      |--- apple-icon.png
      |--- error.tsx
      |--- favicon.ico
      |--- globals.css
      |--- icon0.svg
      |--- icon1.png
      |--- layout.tsx
      |--- manifest.json
      |--- not-found.tsx
    |-- components/
      |--- providers/
      |--- ui/
      |--- filter-carousel.tsx
      |--- infinite-scroll.tsx
      |--- responsive-modal.tsx
      |--- user-avatar.tsx
    |-- config/
      |--- http-status-codes.ts
      |--- index.ts
    |-- constants/
      |--- index.ts
    |-- db/
      |--- index.ts
      |--- schema.ts
    |-- env/
      |--- client.ts
      |--- server.ts
    |-- hooks/
      |--- use-confirm.tsx
      |--- use-intersection-observer.ts
      |--- use-mobile.tsx
    |-- lib/
      |--- encryption.ts
      |--- mux.ts
      |--- qstash.ts
      |--- ratelimit.ts
      |--- redis.ts
      |--- uploadthing.ts
      |--- utils.ts
    |-- modules/
      |--- auth/
      |--- categories/
      |--- comment-reactions/
      |--- comments/
      |--- home/
      |--- playlists/
      |--- search/
      |--- studio/
      |--- subscriptions/
      |--- suggestions/
      |--- users/
      |--- video-reactions/
      |--- video-views/
      |--- videos/
    |-- scripts/
      |--- seed-categories.ts
    |-- trpc/
      |--- routers/
      |--- client.tsx
      |--- init.ts
      |--- query-client.ts
      |--- server.tsx
    |-- proxy.ts
  |- .env.example
  |- .env/.env.local
  |- .gitignore
  |- .prettierrc.mjs
  |- bun.lock
  |- components.json
  |- drizzle.config.ts
  |- environment.d.ts
  |- eslint.config.mjs
  |- next.config.ts
  |- package.json
  |- postcss.config.mjs
  |- tailwind.config.ts
  |- tsconfig.json
  |- vercel.ts
```
<!--- FOLDER_STRUCTURE_END --->

<br />

## :toolbox: Getting Started

1. Make sure **Git** and **NodeJS** is installed.
2. Clone this repository to your local computer.
3. Create `.env.local` file in **root** directory.
4. Contents of `.env.local`:

```env
# disable telemetry
DO_NOT_TRACK="1"
CLERK_TELEMETRY_DISABLED="1"
CLERK_TELEMETRY_DEBUG="1"
NEXT_TELEMETRY_DISABLED="1"

# app base url
NEXT_PUBLIC_APP_BASE_URL="http://localhost:3000"

# clerk api keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
CLERK_SECRET_KEY="sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

# clerk webhook
CLERK_WEBHOOK_SECRET="whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

# clerk redirect urls
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/"
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/"

# neon db uri
DATABASE_URL="postgresql://<username>:<password>@<hostname>/NewTube?sslmode=require"

# upstash redis url and token
UPSTASH_REDIS_REST_URL="https://<db-slug>.upstash.io"
UPSTASH_REDIS_REST_TOKEN="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

# qstash token, url and keys
QSTASH_TOKEN="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
UPSTASH_WORKFLOW_URL="https://<slug>.ngrok-free.app"
QSTASH_CURRENT_SIGNING_KEY="sig_xxxxxxxxxxxxxxxxxxxxxxxx"
QSTASH_NEXT_SIGNING_KEY="sig_xxxxxxxxxxxxxxxxxxxxxxxxxxx"

# mux image and stream base url
NEXT_PUBLIC_MUX_IMAGE_BASE_URL="https://image.mux.com"
NEXT_PUBLIC_MUX_STREAM_BASE_URL="https://stream.mux.com"

# mux token and webhook secret
MUX_TOKEN_ID="xxxxxxxxx-xxx-xxxx-xxxx-xxxxxxxxxxxxxx"
MUX_TOKEN_SECRET="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
MUX_WEBHOOK_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# uploadthing app id and token
UPLOADTHING_APP_ID="xxxxxxxxx"
UPLOADTHING_TOKEN="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

# openai api base url
OPENAI_API_BASE_URL="https://api.openai.com/v1"

# open ai api key cookie name and verification secret (generated by `openssl rand -hex 32`)
OPENAI_API_KEY_COOKIE_NAME="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
VERIFICATION_SECRET="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

```

### 5. Disable Telemetry (Optional)

```bash
DO_NOT_TRACK="1"
CLERK_TELEMETRY_DISABLED="1"
CLERK_TELEMETRY_DEBUG="1"
NEXT_TELEMETRY_DISABLED="1"
```

- These disable analytics/telemetry from Clerk and Next.js. Keep them as provided.

---

### 6. App Base URL

```bash
NEXT_PUBLIC_APP_BASE_URL="http://localhost:3000"
```

- Keep as `http://localhost:3000` during development.
- Change to your deployed URL (e.g., `https://yourdomain.com`) in production.

---

### 7. Clerk (Authentication)

- Go to [Clerk Dashboard](https://dashboard.clerk.com/).
- Create a new application.
- Navigate to **API Keys**:
  - Copy **Publishable Key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - Copy **Secret Key** → `CLERK_SECRET_KEY`
- Set up a **Webhook** (under "Webhooks") pointing to:
  `https://<your-domain>/api/users/webhook` (this will be your server endpoint, can be tunneled via [ngrok](https://ngrok.com/)).
  Copy the generated secret → `CLERK_WEBHOOK_SECRET`
- Redirect URLs: Keep as provided unless you modify authentication routes.

---

### 8. Neon (PostgreSQL Database)

- Sign up at [Neon](https://neon.tech/).
- Create a new **PostgreSQL project**.
- Go to **Connection Details** and copy the **Connection String**.
- Replace `<username>`, `<password>`, and `<hostname>` with your Neon credentials.
- Append `?sslmode=require` at the end (needed for secure connections).

---

### 9. Upstash Redis (API Ratelimit)

- Sign up at [Upstash](https://upstash.com/).
- Create a **Redis database**.
- In the database dashboard:
  - Copy the **REST URL** → `UPSTASH_REDIS_REST_URL`
  - Copy the **REST Token** → `UPSTASH_REDIS_REST_TOKEN`

---

### 10. Upstash QStash (AI Workflows)

- In your [Upstash Dashboard](https://console.upstash.com/), create a **QStash project**.
- Copy the **QStash Token** → `QSTASH_TOKEN`.
- Configure your **Workflow URL** (this will be your server endpoint, can be tunneled via [ngrok](https://ngrok.com/)).
- Obtain the **Signing Keys** from the QStash dashboard:
  - Current Signing Key → `QSTASH_CURRENT_SIGNING_KEY`
  - Next Signing Key → `QSTASH_NEXT_SIGNING_KEY`

---

### 11. Mux (Video Uploads)

- Sign up at [Mux](https://mux.com/) and create a new project.
- In your **Dashboard → Settings → API Access Tokens**:
  - Create a new token with Videos (**Read & Write**) permissions.
  - Copy **Token ID** → `MUX_TOKEN_ID`
  - Copy **Token Secret** → `MUX_TOKEN_SECRET`
- Set up a **Webhook** in Mux (point to `https://<your-domain>/api/videos/webhook` (this will be your server endpoint, can be tunneled via [ngrok](https://ngrok.com/)).) and copy the **Webhook Signing Secret** → `MUX_WEBHOOK_SECRET`

---

### 12. UploadThing (File Uploads)

- Sign up at [UploadThing](https://uploadthing.com/).
- Create a new app.
- Copy the **App ID** → `UPLOADTHING_APP_ID`
- Copy the **API Token** → `UPLOADTHING_TOKEN`

---

### 13. OpenAI (AI Features)

- Store it in your cookies under the name specified by `OPENAI_API_KEY_COOKIE_NAME`.
- Generate both **verification secret** and **cookie name** (for cryptographic signing):

  ```bash
  openssl rand -hex 32
  ```

  Copy the output → `VERIFICATION_SECRET` and `OPENAI_API_KEY_COOKIE_NAME` separately

---

14. Install Project Dependencies using `npm install --legacy-peer-deps` or `yarn install --legacy-peer-deps` or `bun install --legacy-peer-deps`.

15. Now app is fully configured 👍 and you can start using this app using either one of `npm run dev` or `yarn dev` or `bun dev`.

**NOTE:** Please make sure to keep your API keys and configuration values secure and do not expose them publicly.

## :camera: Screenshots

![Modern UI/UX](/.github/images/img1.png 'Modern UI/UX')

![Playlist functionality](/.github/images/img2.png 'Playlist functionality')

![Creator profile](/.github/images/img3.png 'Creator profile')

## :gear: Tech Stack

[![React JS](https://skillicons.dev/icons?i=react 'React JS')](https://react.dev/ 'React JS') [![Next JS](https://skillicons.dev/icons?i=next 'Next JS')](https://nextjs.org/ 'Next JS') [![Typescript](https://skillicons.dev/icons?i=ts 'Typescript')](https://www.typescriptlang.org/ 'Typescript') [![Tailwind CSS](https://skillicons.dev/icons?i=tailwind 'Tailwind CSS')](https://tailwindcss.com/ 'Tailwind CSS') [![Vercel](https://skillicons.dev/icons?i=vercel 'Vercel')](https://vercel.app/ 'Vercel')

## :wrench: Stats

[![Stats for NewTube](/.github/images/stats.svg 'Stats for NewTube')](https://pagespeed.web.dev/analysis?url=https://newtube-clone.vercel.app 'Stats for NewTube')

## :raised_hands: Contribute

You might encounter some bugs while using this app. You are more than welcome to contribute. Just submit changes via pull request and I will review them before merging. Make sure you follow community guidelines.

## :gem: Acknowledgements

Useful resources and dependencies that are used in NewTube.

- Thanks to CodeWithAntonio: https://codewithantonio.com/
<!--- DEPENDENCIES_START --->
- [@babel/eslint-parser](https://www.npmjs.com/package/@babel/eslint-parser): ^7.28.6
- [@clerk/nextjs](https://www.npmjs.com/package/@clerk/nextjs): ^6.37.4
- [@eslint/eslintrc](https://www.npmjs.com/package/@eslint/eslintrc): ^3
- [@hookform/resolvers](https://www.npmjs.com/package/@hookform/resolvers): ^5.1.1
- [@ianvs/prettier-plugin-sort-imports](https://www.npmjs.com/package/@ianvs/prettier-plugin-sort-imports): ^4.7.1
- [@mux/mux-node](https://www.npmjs.com/package/@mux/mux-node): ^12.8.0
- [@mux/mux-uploader-react](https://www.npmjs.com/package/@mux/mux-uploader-react): ^1.4.1
- [@mux/mux-video-react](https://www.npmjs.com/package/@mux/mux-video-react): ^0.29.0
- [@neondatabase/serverless](https://www.npmjs.com/package/@neondatabase/serverless): ^1.0.2
- [@radix-ui/react-avatar](https://www.npmjs.com/package/@radix-ui/react-avatar): ^1.1.11
- [@radix-ui/react-dialog](https://www.npmjs.com/package/@radix-ui/react-dialog): ^1.1.14
- [@radix-ui/react-dropdown-menu](https://www.npmjs.com/package/@radix-ui/react-dropdown-menu): ^2.1.15
- [@radix-ui/react-label](https://www.npmjs.com/package/@radix-ui/react-label): ^2.1.8
- [@radix-ui/react-select](https://www.npmjs.com/package/@radix-ui/react-select): ^2.2.5
- [@radix-ui/react-separator](https://www.npmjs.com/package/@radix-ui/react-separator): ^1.1.8
- [@radix-ui/react-slot](https://www.npmjs.com/package/@radix-ui/react-slot): ^1.2.4
- [@radix-ui/react-tooltip](https://www.npmjs.com/package/@radix-ui/react-tooltip): ^1.2.7
- [@radix-ui/react-visually-hidden](https://www.npmjs.com/package/@radix-ui/react-visually-hidden): ^1.2.4
- [@t3-oss/env-nextjs](https://www.npmjs.com/package/@t3-oss/env-nextjs): ^0.13.8
- [@tanstack/react-query](https://www.npmjs.com/package/@tanstack/react-query): ^5.80.7
- [@trivago/prettier-plugin-sort-imports](https://www.npmjs.com/package/@trivago/prettier-plugin-sort-imports): ^6.0.2
- [@trpc/client](https://www.npmjs.com/package/@trpc/client): ^11.10.0
- [@trpc/react-query](https://www.npmjs.com/package/@trpc/react-query): ^11.7.2
- [@trpc/server](https://www.npmjs.com/package/@trpc/server): ^11.6.0
- [@types/node](https://www.npmjs.com/package/@types/node): ^25
- [@types/react](https://www.npmjs.com/package/@types/react): 19.2.14
- [@types/react-dom](https://www.npmjs.com/package/@types/react-dom): 19.2.3
- [@uploadthing/react](https://www.npmjs.com/package/@uploadthing/react): ^7.3.2
- [@upstash/ratelimit](https://www.npmjs.com/package/@upstash/ratelimit): ^2.0.5
- [@upstash/redis](https://www.npmjs.com/package/@upstash/redis): ^1.36.2
- [@upstash/workflow](https://www.npmjs.com/package/@upstash/workflow): ^0.2.14
- [@vercel/config](https://www.npmjs.com/package/@vercel/config): ^0.0.33
- [class-variance-authority](https://www.npmjs.com/package/class-variance-authority): ^0.7.1
- [client-only](https://www.npmjs.com/package/client-only): ^0.0.1
- [clsx](https://www.npmjs.com/package/clsx): ^2.1.1
- [concurrently](https://www.npmjs.com/package/concurrently): ^9.1.2
- [date-fns](https://www.npmjs.com/package/date-fns): ^4.1.0
- [dotenv](https://www.npmjs.com/package/dotenv): ^17.2.3
- [drizzle-kit](https://www.npmjs.com/package/drizzle-kit): ^0.31.5
- [drizzle-orm](https://www.npmjs.com/package/drizzle-orm): ^0.45.1
- [drizzle-zod](https://www.npmjs.com/package/drizzle-zod): ^0.8.2
- [embla-carousel-react](https://www.npmjs.com/package/embla-carousel-react): ^8.6.0
- [eslint](https://www.npmjs.com/package/eslint): ^10
- [eslint-config-next](https://www.npmjs.com/package/eslint-config-next): 16.1.6
- [eslint-config-prettier](https://www.npmjs.com/package/eslint-config-prettier): ^10.0.1
- [eslint-plugin-prettier](https://www.npmjs.com/package/eslint-plugin-prettier): ^5.5.5
- [eslint-plugin-tailwindcss](https://www.npmjs.com/package/eslint-plugin-tailwindcss): ^3.18.0
- [jiti](https://www.npmjs.com/package/jiti): ^2.6.1
- [lucide-react](https://www.npmjs.com/package/lucide-react): ^0.564.0
- [next](https://www.npmjs.com/package/next): 16.1.6
- [openai](https://www.npmjs.com/package/openai): ^5.22.1
- [player.style](https://www.npmjs.com/package/player.style): ^0.3.0
- [postcss](https://www.npmjs.com/package/postcss): ^8
- [prettier](https://www.npmjs.com/package/prettier): ^3.8.1
- [prettier-plugin-tailwindcss](https://www.npmjs.com/package/prettier-plugin-tailwindcss): ^0.7.2
- [react](https://www.npmjs.com/package/react): 19.2.4
- [react-dom](https://www.npmjs.com/package/react-dom): 19.2.4
- [react-error-boundary](https://www.npmjs.com/package/react-error-boundary): ^6.0.0
- [react-hook-form](https://www.npmjs.com/package/react-hook-form): ^7.71.2
- [react-hot-toast](https://www.npmjs.com/package/react-hot-toast): ^2.5.2
- [server-only](https://www.npmjs.com/package/server-only): ^0.0.1
- [sort-classes](https://www.npmjs.com/package/sort-classes): npm:prettier-plugin-tailwindcss
- [superjson](https://www.npmjs.com/package/superjson): ^2.2.6
- [tailwind-merge](https://www.npmjs.com/package/tailwind-merge): ^3.4.1
- [tailwindcss](https://www.npmjs.com/package/tailwindcss): ^3.4.1
- [tailwindcss-animate](https://www.npmjs.com/package/tailwindcss-animate): ^1.0.7
- [tidy-imports](https://www.npmjs.com/package/tidy-imports): npm:@trivago/prettier-plugin-sort-imports
- [typescript](https://www.npmjs.com/package/typescript): ^5
- [uploadthing](https://www.npmjs.com/package/uploadthing): ^7.7.3
- [vaul](https://www.npmjs.com/package/vaul): ^1.1.2
- [zod](https://www.npmjs.com/package/zod): ^4.1.13

<!--- DEPENDENCIES_END --->

## :coffee: Buy Me a Coffee

[<img src="https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" width="200" />](https://www.buymeacoffee.com/sanidhy 'Buy me a Coffee')

## :rocket: Follow Me

[![Follow Me](https://img.shields.io/github/followers/sanidhyy?style=social&label=Follow&maxAge=2592000)](https://github.com/sanidhyy 'Follow Me')
[![Tweet about this project](https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Fx.com%2F_sanidhyy)](https://x.com/intent/tweet?text=Check+out+this+amazing+app:&url=https%3A%2F%2Fgithub.com%2Fsanidhyy%2Fyt-clone 'Tweet about this project')

## :books: Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## :page_with_curl: Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## :star: Give A Star

You can also give this repository a star to show more people and they can use this repository.

## :star2: Star History

<a href="https://star-history.com/#sanidhyy/yt-clone&Timeline">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=sanidhyy/yt-clone&type=Timeline&theme=dark" />
  <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=sanidhyy/yt-clone&type=Timeline" />
  <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=sanidhyy/yt-clone&type=Timeline" />
</picture>
</a>

<br />
<p align="right">(<a href="#readme-top">back to top</a>)</p>
