import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

/**
 * `(app)` ve `(marketing)` layout'larının paylaştığı görsel iskelet — tüm
 * sitede TEK bir başlık/altbilgi teması olsun diye ikisi de burayı kullanır.
 * Yetkilendirme mantığı burada YOK; auth redirect'i çağıran layout kendi
 * sorumluluğunda tutar.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
