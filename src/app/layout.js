import { cookies } from "next/headers";
import SessionProviderWrapper from "./SessionProviderWrapper";
import './globals.css';

export default async function RootLayout({ children }) {
  // Fetch the daily background
  async function fetchDailyBackground() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/generate-daily-background`, { 
        next: { revalidate: 86400 } // Cache for 24 hours
      });

      if (!res.ok) throw new Error("Failed to fetch background");
      const { imageUrl } = await res.json();
      return imageUrl || null;
    } catch (error) {
      console.error("Error fetching daily background:", error);
      return null;
    }
  }

  // Fetch the background image URL
  const imageUrl = await fetchDailyBackground();

  return (
    <html lang="en">
      <body
        style={{
          backgroundImage: imageUrl ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${imageUrl})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
          backgroundColor: imageUrl ? "black" : "white", // Fallback color
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
