import SessionProviderWrapper from "./SessionProviderWrapper";
import './globals.css';

export default async function RootLayout({ children }) {
  
  const todayDate = new Date().toISOString().split('T')[0].split('-')[2]
  const noBackground = '/images/none.jpg'
  
  
  return (
    <html lang="en">
      <body
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(/images/${todayDate}.jpg), linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${noBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
        }}
      >
        <div className="relative z-10">
          {/* Wrap children in SessionProvider via the client-side wrapper */}
          <SessionProviderWrapper>{children}</SessionProviderWrapper>
        </div>
      </body>
    </html>
  );
}
