import MainHeader from "@/components/main-header/main-header";
import { DeletedMealsProvider } from "@/store/deleted-meals-context";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata = {
  title: "NextLevel Food",
  description: "Delicious meals, shared by a food-loving community.",
};

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <DeletedMealsProvider>
          <MainHeader />
          {children}
        </DeletedMealsProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
