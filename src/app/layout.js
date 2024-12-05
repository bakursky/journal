import SessionProviderWrapper from "./SessionProviderWrapper";
import './globals.css';

export default async function RootLayout({ children }) {
  
  const todayDate = new Date().toISOString().split('T')[0].split('-')[2]
  
  const backgroundImageUrl = `/images/${todayDate}.jpg?cacheBuster=${Date.now()}`;
  // const noBackground = '/images/none.jpg'
  
  
  return (
    <html lang="en">
      <body
        style={{
          backgroundImage: backgroundImageUrl ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${backgroundImageUrl})` : 'none',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
          backgroundColor: backgroundImageUrl ? "black" : "white",
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
