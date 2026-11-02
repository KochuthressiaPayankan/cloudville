import { Fredoka } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = {
  title: "Cloudville: learn cloud with cartoons",
  description: "Learn how servers, traffic and cloud billing work, one cartoon café at a time.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={fredoka.className}>{children}</body>
    </html>
  );
}
