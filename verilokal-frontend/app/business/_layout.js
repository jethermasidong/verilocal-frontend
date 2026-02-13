import { Slot } from "expo-router";
import Navbar from "../../components/Navbar";

export default function BusinessLayout() {
  return (
    <>
      <Navbar
        links={[
          { name: "DASHBOARD", route: "/business" },
        ]}
      />

      <Slot />
    </>
  );
}
