import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { LegalDisclaimer } from "@/components/site/legal-disclaimer";

export const metadata: Metadata = {
  title: "Gizlilik Politikası & KVKK Aydınlatma Metni",
  description:
    "Renza'nın kişisel verilerinizi nasıl işlediğine dair gizlilik politikası ve KVKK aydınlatma metni.",
};

export default function PrivacyPage() {
  return (
    <PageHeader
      title="Gizlilik Politikası & KVKK Aydınlatma Metni"
      description="Son güncelleme: 2026"
      width="narrow"
    >
      <div className="mt-8 space-y-8">
        <LegalDisclaimer />

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-medium">1. Veri sorumlusu</h2>
          <p className="text-muted-foreground">
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;)
            uyarınca, Renza hizmetini işleten şirket, veri sorumlusu
            sıfatıyla kişisel verilerinizi aşağıda açıklanan şekilde işler.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-medium">2. İşlenen kişisel veriler</h2>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Kimlik ve iletişim bilgileri: ad soyad, e-posta adresi</li>
            <li>Hesap bilgileri: kayıt tarihi, kredi bakiyesi, işlem geçmişi</li>
            <li>
              Yüklediğiniz ürün görselleri ve bunlardan üretilen çıktı
              görseller
            </li>
            <li>
              Teknik veriler: IP adresi, tarayıcı bilgisi (güvenlik ve
              kötüye kullanım önleme amacıyla)
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-medium">3. İşleme amaçları</h2>
          <p className="text-muted-foreground">
            Kişisel verileriniz; hesabınızı oluşturmak ve yönetmek, yüklediğiniz
            ürün görsellerini yapay zekâ ile işleyerek talep ettiğiniz stüdyo
            görsellerini üretmek, kredi/ödeme işlemlerini yürütmek, hizmeti
            güvenli tutmak ve yasal yükümlülükleri yerine getirmek amacıyla
            işlenir.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-medium">
            4. Yapay zekâ işleme ve üçüncü taraf paylaşımı
          </h2>
          <p className="text-muted-foreground">
            Görsel üretim talebiniz doğrultusunda, yüklediğiniz ürün
            görselleri işlenmek üzere Google&apos;ın Gemini API hizmetine
            iletilir. Bu aktarım yalnızca sizin talebiniz üzerine, üretim
            işlemini gerçekleştirmek amacıyla yapılır. Hesap ve veritabanı
            altyapımız Supabase üzerinde barındırılır. Verileriniz, bu
            hizmet sağlayıcılar dışında, yasal zorunluluklar hariç üçüncü
            kişilerle paylaşılmaz veya satılmaz.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-medium">5. Saklama süresi</h2>
          <p className="text-muted-foreground">
            Kişisel verileriniz, hesabınız aktif olduğu sürece ve yasal
            saklama yükümlülüklerinin gerektirdiği süre boyunca saklanır.
            Hesabınızı sildiğinizde, hesap ve üretim verileriniz sistemden
            kalıcı olarak silinir.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-medium">6. Çerezler</h2>
          <p className="text-muted-foreground">
            Hizmet, oturumunuzu açık tutmak için zorunlu oturum çerezleri
            kullanır. Bu çerezler hizmetin çalışması için gereklidir ve
            reklam/izleme amaçlı üçüncü taraf çerezleri kullanılmaz.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-medium">
            7. KVKK m.11 kapsamındaki haklarınız
          </h2>
          <p className="text-muted-foreground">
            KVKK&apos;nın 11. maddesi uyarınca; kişisel verilerinizin işlenip
            işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme,
            işlenme amacını ve amacına uygun kullanılıp kullanılmadığını
            öğrenme, yurt içinde/yurt dışında aktarıldığı üçüncü kişileri
            bilme, eksik/yanlış işlenmişse düzeltilmesini isteme, silinmesini
            veya yok edilmesini isteme ve bu işlemlerin bildirilmesini talep
            etme haklarına sahipsiniz. Ayrıca hesabınızın{" "}
            <a href="/settings" className="text-primary hover:underline">
              Ayarlar
            </a>{" "}
            sayfasından hesabınızı tamamen silebilirsiniz.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-medium">8. İletişim</h2>
          <p className="text-muted-foreground">
            Haklarınızı kullanmak veya sorularınız için kvkk@renza.app
            adresinden bize ulaşabilirsiniz.
          </p>
        </section>
      </div>
    </PageHeader>
  );
}
