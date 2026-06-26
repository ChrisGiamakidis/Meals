import Footer from "@/components/footer/footer";
import MainHeaderWrapper from "@/components/main-header/main-header-wrapper";
import { DeletedMealsProvider } from "@/store/deleted-meals-context";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Montserrat, Quicksand } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-quicksand",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata = {
  title: "NextLevel Food",
  description: "Delicious meals, shared by a food-loving community.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }) {
  return (
    <html lang="en" className={`${quicksand.variable} ${montserrat.variable}`}>
      <body>
        <DeletedMealsProvider>
          <MainHeaderWrapper />
          {children}
          <Footer />
        </DeletedMealsProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
