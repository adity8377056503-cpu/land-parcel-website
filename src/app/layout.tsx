import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    default: "Land Parcel - Your Trusted Partner in Premium Property Deals",
    template: "%s | Land Parcel",
  },
  description:
    "Land Parcel is a premium real estate marketplace connecting buyers, sellers, investors and developers across Delhi NCR. Find residential, commercial, industrial and agricultural properties.",
  keywords:
    "property for sale Delhi, real estate Delhi NCR, residential plots, commercial property Gurugram, warehouse for sale, agricultural land Haryana, Land Parcel",
  authors: [{ name: "Land Parcel" }],
  creator: "Land Parcel",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://landparcel.in",
    siteName: "Land Parcel",
    title: "Land Parcel - Your Trusted Partner in Premium Property Deals",
    description:
      "Premium real estate marketplace for Delhi NCR - residential, commercial, industrial and agricultural properties.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Land Parcel Real Estate",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Land Parcel - Premium Real Estate Delhi NCR",
    description:
      "Find the Right Property. Build Your Future. Explore premium properties across Delhi NCR.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-[#64748B] bg-white">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#172B4D",
              color: "#fff",
              borderRadius: "12px",
              fontSize: "14px",
            },
            success: {
              iconTheme: {
                primary: "#C6A66B",
                secondary: "#fff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
