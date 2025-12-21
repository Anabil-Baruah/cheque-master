import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'ChequeTrack',
  description: 'Manage post-dated cheques and recoveries',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
