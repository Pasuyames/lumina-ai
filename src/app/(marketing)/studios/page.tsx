import type { Metadata } from "next";
import { TemplateGallery } from "@/components/studio/template-gallery";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Hazır Stüdyolar",
  description:
    "Önceden tasarlanmış lüks stüdyo şablonları — birini seçin, ürününüz anında o sahneye taşınsın.",
};

export default function StudiosPage() {
  return (
    <PageHeader
      title="Hazır Stüdyolar"
      description="Her şablonun arkasında, uzmanlarca hazırlanmış gizli bir sahne promptu vardır. Birini seçtiğinizde ürününüz doğrudan o stüdyoya taşınır — prompt yazmanıza gerek yok."
      width="wide"
    >
      <div className="mt-10">
        <TemplateGallery />
      </div>
    </PageHeader>
  );
}