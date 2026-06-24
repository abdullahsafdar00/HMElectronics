import { Outfit } from "next/font/google";
import "./globals.css";
import { AppContextProvider } from "@/context/AppContext"
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs";

const outfit = Outfit({ subsets: ['latin'], weight: ["300", "400", "500"] })

export const metadata = {
  title: "HMElectronics",
  description: "HMElectronics is a well updated online shopping in Pakistan. HmElectronics offers a variety of electric products such as Kitchen Appliances, Irons and heaters, Hairs dryers and straightners, trimmers, hair products, and more",
};


export default function RootLayout({ children }) {
  return (
    <ClerkProvider
  publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
  frontendApi={process.env.NEXT_PUBLIC_CLERK_FRONTEND_API}
>
  <html lang="en">
    <body className={`${outfit.className} antialiased text-gray-700`} suppressHydrationWarning>
      
      <Toaster />
      <AppContextProvider>
        {children}
      </AppContextProvider>
    </body>
  </html>
</ClerkProvider>

  );
}
