import { Slot, usePathname, useRouter } from "expo-router";
import Navbar from "../../components/Navbar";

export default function BusinessLayout() {
  const pathname = usePathname();
  const router = useRouter();

  const allowedPages = ["/admin"];

  return (
    <>
      {/* NAVBAR */}
      <Navbar links={[{ name: "DASHBOARD", route: "/admin" }]} />

      <Slot />
    </>
  );
}
