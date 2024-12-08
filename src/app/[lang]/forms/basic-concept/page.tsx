// import { Locale } from "~/i18n-config";
// import { getDictionary } from "~/get-dictionary";
// import { BasicForm } from "@/features/forms/basic-form";

// export default async function Page(props: {
//   params: Promise<{ lang: Locale }>;
// }) {
//   const { lang } = await props.params;

//   const dictionary = await getDictionary(lang);

//   return (
//     <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
//       <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
//         <BasicForm />
//       </main>
//     </div>
//   );
// }

import { Locale } from "~/i18n-config";
import { getDictionary } from "~/get-dictionary";
import { BasicForm, RequiredSchema } from "@/features/forms/basic-form-2";
import { BasicConceptForm } from "@/features/forms/basic-concept";

export default async function Page(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;

  const dictionary = await getDictionary(lang);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <BasicConceptForm />
      </main>
    </div>
  );
}
