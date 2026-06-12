<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/0b74156b-9d95-438a-be5c-0daf252af614

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
```
   npm install
```
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
```
   npm run dev
```
4. Build Vite Project
```
   npm run build
```

## Project Go
- Compilar para Windows
```
CGO_ENABLED=1 GOOS=windows GOARCH=amd64 CC=x86_64-w64-mingw32-gcc go build -o gestoque.exe
```
- Compilar para Linux
```
go build
```