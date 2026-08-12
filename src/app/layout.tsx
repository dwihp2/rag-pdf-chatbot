import './globals.css';
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "DeptQ — Q&A for Every Department",
  description: "DeptQ (Dept + Q): a RAG-powered PDF chatbot with a cited knowledge base for every department.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 min-h-screen`}>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}