// app/layout.js (The correct structure)

import './globals.css'; // Your global styles
import Providers from '../components/Provider'; // Import the client wrapper

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* The body should only contain server-side elements or the client wrapper */}
      <body>
        {/* The entire application content is wrapped in the client provider component */}
        <Providers>
            {children}
        </Providers>
      </body>
    </html>
  );
}