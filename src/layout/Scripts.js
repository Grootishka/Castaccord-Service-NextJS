import React from "react";
import Script from "next/script";

const Scripts = () => (
	<div>
		<Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.gaCode}`} strategy="lazyOnload" />
		<Script id="google-analytics" strategy="afterInteractive">
			{`
          window.dataLayer = window.dataLayer || [];
  		  function gtag(){dataLayer.push(arguments);}
  		  gtag('js', new Date());

          gtag('config', '${process.env.gaCode}');
        `}
		</Script>

		<Script id="fb-pixel" strategy="afterInteractive">
			{`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${process.env.fbPixelId}');
        fbq('track', 'PageView');
      `}
		</Script>
		<noscript>
			<img height="1" width="1" style={{ display: "none" }} src={`https://www.facebook.com/tr?id=${process.env.fbPixelId}&ev=PageView&noscript=1`} />
		</noscript>
	</div>
);

export default Scripts;
