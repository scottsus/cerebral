import "~/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { Footer } from "~/components/footer";
import { Navbar } from "~/components/navbar";
import { type Metadata } from "next";
import { Toaster } from "sonner";
import { Outfit } from "next/font/google";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Some Title",
  description: "Some description",
  icons: [{ rel: "icon", url: "/github.svg" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={outfit.className}>
        <Toaster position="top-center" />
        <body className="flex min-h-screen w-full flex-col items-center bg-[#2F2F2F]">
          <Navbar />
          {children}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
