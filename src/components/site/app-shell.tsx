import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";

/**
 * `(app)` ve `(marketing)` layout'larında tekrarlanan görsel iskelet
 * (Navbar + main + Footer). Yetkilendirme mantığı burada YOK — sadece
 * ortak görsel çerçeve; auth redirect'i çağıran layout kendi sorumluluğunda
 * tutar.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
