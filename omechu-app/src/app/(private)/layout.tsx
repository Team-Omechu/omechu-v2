import { ProtectedRoute } from "@/app/providers";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
