import type { Metadata } from "next";
import { TemplateGallery } from "@/components/studio/template-gallery";

export const metadata: Metadata = {
  title: "Hazır Stüdyolar",
  description:
    "Önceden tasarlanmış lüks stüdyo şablonları — birini seçin, ürününüz anında o sahneye taşınsın.",
};

export default function StudiosPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="font-heading text-3xl font-semibold sm:text-4xl">
          Hazır Stüdyolar
        </h1>
        <p className="mt-3 text-muted-foreground">
          Her şablonun arkasında, uzmanlarca hazırlanmış gizli bir sahne promptu
          vardır. Birini seçtiğinizde ürününüz doğrudan o stüdyoya taşınır — prompt
          yazmanıza gerek yok.
        </p>
      </div>

      <div className="mt-10">
        <TemplateGallery />
      </div>
    </div>
  );
}