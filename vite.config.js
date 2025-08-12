import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // "server" gäller bara för dev-servern (npm run dev)
    proxy: {
      // "proxy" säger åt dev-servern att vidarebefordra (proxy:a) vissa URL:er
      "/api": {
        // Alla anrop som börjar med /api i din frontend...
        target: "https://chatify-api.up.railway.app",
        // ...skickas vidare till den riktiga backend-servern här:
        changeOrigin: true,
        // "changeOrigin: true" gör att proxyn sätter "Host"-headern till target-domänen.
        // Många backend/hostinglösningar kräver att Host matchar deras domän för att acceptera anropet.
        secure: true,
        // "secure: true" betyder: verifiera TLS-certifikatet (https). Vi pratar med https, så true är korrekt.
        // (Om du proxy:ar till en självsignerad cert i dev, kan man tillfälligt sätta false.)

        // "rewrite" ändrar den inkommande sökvägen innan den skickas till target.
        // Här tar vi bort prefixet "/api" så:
        //   frontend:  fetch('/api/csrf')  →
        //   proxy till: https://chatify-api.up.railway.app/csrf
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
  },
});
