import { Slot } from "expo-router";
import { View } from "react-native";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Head from 'expo-router/head';
export default function HomeLayout() {
  return (
    <>
      <Head>
        <title>VeriLocal</title>
        <link rel="icon" href='/favicon.ico?v=1' />
      </Head>

      <Navbar 
        links={[
          { name: "HOME", route: "/" },
          { name: "ABOUT", route: "/aboutme" },
          { name: "CONTACT", route: "/contact" },
          { name: "JOIN US", route: "/login-business" },
        ]}
      />

      <View style={{ height: 70, }} />
      
      <Slot />

      <Footer />
    </>
  );
}
