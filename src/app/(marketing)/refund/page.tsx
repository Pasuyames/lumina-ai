import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { LegalDisclaimer } from "@/components/site/legal-disclaimer";

export const metadata: Metadata = {
  title: "İptal & İade Politikası",
  description: "Renza kredi paketleri için iptal ve iade koşulları.",
};

export default function RefundPage() {
  return (
    <PageHeader
      title="İptal & İade Politikası"
      description="Son güncelleme: 2026"
      width="narrow"
    >
      <div className="mt-8 space-y-8">
        <LegalDisclaimer />

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-medium">
            1. Başarısız üretimlerde otomatik iade
          </h2>
          <p className="text-muted-foreground">
            Bir görsel üretimi teknik bir hata nedeniyle tamamlanamazsa, o
            üretim için düşülen kredi hesabınıza otomatik olarak geri
            yüklenir. Bu iade için ayrıca talepte bulunmanız gerekmez.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-medium">
            2. Kullanılmamış kredilerin iadesi
          </h2>
          <p className="text-muted-foreground">
            Satın aldığınız bir paketten hiç kredi harcamadıysanız, satın
            alma tarihinden itibaren 14 gün içinde destek@renza.app
            adresinden talepte bulunarak tam iade alabilirsiniz. Paketten
            kısmen kredi harcandıysa, iade talepleri destek ekibimiz
            tarafından değerlendirilir.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-medium">
            3. İade edilemeyen durumlar
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Başarıyla tamamlanmış ve indirilmiş üretimler için harcanan krediler</li>
            <li>Kullanım şartlarının ihlali nedeniyle askıya alınan hesaplar</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-medium">4. Krediler sona ermez</h2>
          <p className="text-muted-foreground">
            Renza bir abonelik değildir — satın aldığınız krediler otomatik
            yenilenmez ve kullanmadığınız krediler bir sonraki döneme aynen
            taşınır, süre sonu nedeniyle silinmez.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-medium">5. İade süreci</h2>
          <p className="text-muted-foreground">
            Onaylanan iadeler, orijinal ödeme yönteminize, bankanızın işlem
            sürelerine bağlı olarak genellikle birkaç iş günü içinde
            yansıtılır.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-medium">6. İletişim</h2>
          <p className="text-muted-foreground">
            İade talepleriniz için destek@renza.app adresinden bize
            ulaşabilirsiniz.
          </p>
        </section>
      </div>
    </PageHeader>
  );
}
