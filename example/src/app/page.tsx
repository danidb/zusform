import {
  PippoBaudoField,
  PippoWatch,
  SomeForm,
  SomeOtherOtherStuff,
  SomeOtherStuff,
} from "@/components/SomeForm";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <SomeForm>
        <SomeOtherStuff />
        <SomeOtherOtherStuff />
        <PippoBaudoField />
        <PippoWatch />
      </SomeForm>
    </main>
  );
}
