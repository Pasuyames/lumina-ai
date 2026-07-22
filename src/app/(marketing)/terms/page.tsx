import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { LegalDisclaimer } from "@/components/site/legal-disclaimer";

export const metadata: Metadata = {
  title: "Kullanım Şartları",
  description: "Lumina hizmetini kullanırken geçerli olan kullanım şartları.",
};

export default function TermsPage() {
  return (
    <PageHeader
      title="Kullanım Şartları"
      description="Son güncelleme: 2026"
      width="narrow"
    >
      <div className="mt-8 space-y-8">
        <LegalDisclaimer />

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-medium">1. Hizmetin kapsamı</h2>
          <p className="text-muted-foreground">
            Lumina, kullanıcıların yüklediği ürün fotoğraflarını yapay zekâ
            ile işleyerek profesyonel stüdyo görselleri üreten bir hizmettir.
            Hizmet kredi bazlıdır: her üretim, seçilen kaliteye göre hesabınızdan
            kredi düşer. Üretim teknik bir hatayla başarısız olursa, o üretim
            için düşülen kredi hesabınıza otomatik olarak iade edilir.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-medium">2. Hesap oluşturma</h2>
          <p className="text-muted-foreground">
            Hizmeti kullanmak için geçerli bir e-posta adresiyle hesap
            oluşturmanız gerekir. Hesabınızın güvenliğinden ve şifrenizin
            gizliliğinden siz sorumlusunuz. Yeni kayıtlara belirli miktarda
            ücretsiz kredi tanımlanır; bu miktar önceden haber verilmeksizin
            değiştirilebilir.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-medium">
            3. Yüklenen içerik ve mülkiyet
          </h2>
          <p className="text-muted-foreground">
            Yüklediğiniz ürün görselleri üzerindeki hak sahipliği size aittir;
            bunları yalnızca sizin talebiniz üzerine görsel üretmek amacıyla
            işleriz. Ürettiğiniz görselleri, ürününüzü satmak veya
            pazarlamak dahil ticari amaçlarla kullanabilirsiniz.
          </p>
          <p className="text-muted-foreground">
            Başkasına ait, telifi ihlal eden, yasa dışı veya üçüncü kişilerin
            haklarını ihlal eden içerik yüklememeyi kabul edersiniz.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-medium">4. Krediler ve ödeme</h2>
          <p className="text-muted-foreground">
            Krediler paket halinde satın alınır ve kullanılmadıkları sürece
            sona ermez. Ödeme koşulları ve iade politikası için{" "}
            <a href="/refund" className="text-primary hover:underline">
              İptal &amp; İade Politikası
            </a>{" "}
            sayfasına bakınız.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-medium">5. Kabul edilemez kullanım</h2>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Hizmeti başkalarının haklarını ihlal edecek şekilde kullanmak</li>
            <li>Otomatik araçlarla aşırı yük bindirmek veya kötüye kullanmak</li>
            <li>Hesap veya kredi sistemini teknik açıklardan yararlanarak istismar etmek</li>
          </ul>
          <p className="text-muted-foreground">
            Bu kurallara aykırı kullanım tespit edilirse hesabınız askıya
            alınabilir veya kapatılabilir.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-medium">6. Sorumluluğun sınırlanması</h2>
          <p className="text-muted-foreground">
            Hizmet &quot;olduğu gibi&quot; sunulur. Üretilen görsellerin
            belirli bir platformun veya üçüncü tarafın standartlarını
            karşılayacağı garanti edilmez. Yasaların izin verdiği azami
            ölçüde, dolaylı zararlardan sorumlu tutulamayız.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-medium">7. Değişiklikler</h2>
          <p className="text-muted-foreground">
            Bu şartları zaman zaman güncelleyebiliriz. Önemli değişiklikler
            hizmet üzerinden veya e-posta yoluyla duyurulur.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-medium">8. İletişim</h2>
          <p className="text-muted-foreground">
            Sorularınız için destek@lumina.app adresinden bize ulaşabilirsiniz.
          </p>
        </section>
      </div>
    </PageHeader>
  );
}
