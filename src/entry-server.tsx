// @refresh reload
import { createHandler, StartServer } from '@solidjs/start/server'

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
          <meta name="theme-color" content="#090708" />
          <link rel="icon" type="image/png" sizes="256x256" href="/favicon.png" />
          <meta
            name="description"
            content="Explore experimental, WIP, and community openpilot-supported vehicle projects in one place."
          />
          <meta property="og:title" content="Alice in Forkland" />
          <meta
            property="og:description"
            content="Explore experimental, WIP, and community openpilot-supported vehicle projects in one place."
          />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://aliceinforkland.com" />
          <meta property="og:image" content="https://aliceinforkland.com/social-share.png" />
          <meta property="og:image:type" content="image/png" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content="Alice in Forkland social share image" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Alice in Forkland" />
          <meta
            name="twitter:description"
            content="Explore experimental, WIP, and community openpilot-supported vehicle projects in one place."
          />
          <meta name="twitter:image" content="https://aliceinforkland.com/social-share.png" />
          <meta name="twitter:image:alt" content="Alice in Forkland social share image" />
          <title>Alice in Forkland</title>
          <script async src="https://plausible.io/js/pa-r0g78luI0EJsq8nLJI-Cl.js"></script>
          <script>
            {`window.plausible = window.plausible || function() { (plausible.q = plausible.q || []).push(arguments) },
            plausible.init = plausible.init || function(i) { plausible.o = i || {} }; plausible.init();`}
          </script>
          <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin="anonymous" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=JetBrains+Mono:wght@100..800&display=swap"
            rel="stylesheet"
          />
          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
))
