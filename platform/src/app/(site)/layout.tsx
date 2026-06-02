import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { RevealObserver } from "@/components/site/reveal-observer";
import { getSessionContext } from "@/lib/entitlements";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getSessionContext();
  return (
    <div className="flex min-h-screen flex-col">
      <Header isLoggedIn={ctx.isLoggedIn} />
      <RevealObserver />
      <main className="flex-1 pt-[72px]">{children}</main>
      <Footer />
    </div>
  );
}
