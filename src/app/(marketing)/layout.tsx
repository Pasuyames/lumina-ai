import { AppShell } from "@/components/site/app-shell";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
