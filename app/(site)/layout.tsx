import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { SiteModalsProvider } from "@/components/site/SiteModals";
import { auth } from "@/lib/auth";
import { getSettings } from "@/lib/content";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, settings] = await Promise.all([auth(), getSettings()]);

  return (
    <SiteModalsProvider isAuthed={!!session?.user}>
      <Nav />
      {children}
      <Footer settings={settings} />
    </SiteModalsProvider>
  );
}
