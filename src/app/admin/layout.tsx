import { HostGate } from "@/features/host/hostGate/HostGate";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <HostGate>{children}</HostGate>;
}
