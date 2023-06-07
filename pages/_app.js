import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { ThirdwebProvider, metamaskWallet, paperWallet, walletConnectV1 } from "@thirdweb-dev/react";
import { pageview, GA_TRACKING_ID } from '../analytics'; // Import these from your analytics.js file
import "../styles/globals.css";

const activeChain = "polygon";

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      pageview(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${GA_TRACKING_ID}');
        `,
        }}
      />
      <ThirdwebProvider 
        activeChain={activeChain}
        supportedWallets={[
          paperWallet({
            clientId: "f1e4d287-d0db-4ebb-abd0-e435805f946d",
          }),
          walletConnectV1(),
          metamaskWallet(),
        ]}
      >
        <Component {...pageProps} />
      </ThirdwebProvider>
    </>
  );
}

export default MyApp;
