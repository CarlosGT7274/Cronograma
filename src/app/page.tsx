import Cronograma from "@/components/dashboard/Cronograma";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Image from "next/image";

export default function Home() {
  return (
    <DefaultLayout>
     <Cronograma /> 
    </DefaultLayout>
  );
}
