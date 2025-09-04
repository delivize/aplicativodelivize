import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Delivize",
  description: "Crie Cardápios Que vendem!",
  icons: {
    icon: "logodelivize.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}

        {/* Brevo Conversations */}
        <Script id="brevo-chat" strategy="afterInteractive">
          {`
            (function(d, w, c) {
                w.BrevoConversationsID = '674f45bd20eac6190c04878c';
                w[c] = w[c] || function() {
                    (w[c].q = w[c].q || []).push(arguments);
                };
                var s = d.createElement('script');
                s.async = true;
                s.src = 'https://conversations-widget.brevo.com/brevo-conversations.js';
                if (d.head) d.head.appendChild(s);
            })(document, window, 'BrevoConversations');
          `}
        </Script>
        {/* /Brevo Conversations */}
      </body>
    </html>
  );
}
