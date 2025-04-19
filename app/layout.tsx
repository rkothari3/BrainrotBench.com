import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ModelsProvider } from "@/contexts/models-context";
import { ErrorBoundary } from "@/components/error-boundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Brainrot Bench - AI Model Comparison",
  description: "Compare AI models generating Italian brainrot content",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <ModelsProvider>{children}</ModelsProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
