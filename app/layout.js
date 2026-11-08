import { Fredoka } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const fredoka = Fredoka({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = {
  title: "Cloudville: learn cloud with cartoons",
  description: "Learn how servers, traffic and cloud billing work, one cartoon café at a time.",
};

const gaId = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={fredoka.className}>{children}
        {gaId && <><Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" /><Script id="cloudville-ga4" strategy="afterInteractive">{`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} window.gtag=gtag; gtag('js', new Date()); gtag('config', '${gaId}', { anonymize_ip: true });`}</Script></>}
      </body>
    </html>
  );
}
