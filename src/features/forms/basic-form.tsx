// "use client";

// // import { AgeField } from "@/components/ui/form-fields/age-field";
// // import { NameField } from "@/components/ui/form-fields/name-field";
// import { z } from "zod";
// import { useForm, Controller, SubmitHandler } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";

// const schema = z.object({
//   name: z.string().min(2, "not enough"),
//   age: z.number().positive().max(125),
// });

// type Schema = z.infer<typeof schema>;

// export function BasicForm() {
//   const {
//     register,
//     handleSubmit,
//     control,
//     formState: { errors },
//   } = useForm<Schema>({
//     resolver: zodResolver(schema),
//   });

//   const onSubmit = (data: Schema) => {
//     console.log(data);
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
//       <div className="flex flex-col gap-1">
//         <label>Name</label>
//         <input {...register("name")} />
//         <p className="font-bold text-red-500">{errors.name?.message}</p>
//       </div>

//       <div className="flex flex-col gap-1">
//         <label>Age</label>
//         <input {...register("age", { valueAsNumber: true })} type="number" />
//         <p className="font-bold text-red-500">{errors.age?.message}</p>
//       </div>

//       <input type="submit" />
//     </form>
//   );
// }

// import { AgeField } from "@/components/ui/form-fields/age-field";
// import { NameField } from "@/components/ui/form-fields/name-field";
// "use client";

// import { z } from "zod";
// import { Button, Checkbox, Group, TextInput } from "@mantine/core";
// import { useForm } from "@mantine/form";
// import { zodResolver } from "mantine-form-zod-resolver";

// const schema = z.object({
//   email: z
//     .string({ required_error: "this is required" })
//     .trim()
//     .email({ message: "Invalid email" })
//     .min(1, "this field is required"),
//   termsOfService: z.boolean(),
// });

// type Schema = z.infer<typeof schema>;

// function isRequiredField<T extends z.ZodObject<any>>(schema: T, key: string) {
//   return !schema._def.shape()[key].isOptional();
// }

// export function BasicForm() {
//   const form = useForm<Schema>({
//     mode: "uncontrolled",
//     initialValues: {
//       email: "",
//       termsOfService: false,
//     },
//     validate: zodResolver(schema),
//   });

//   return (
//     <form onSubmit={form.onSubmit((values) => console.log(values))}>
//       <TextInput
//         withAsterisk={isRequiredField(schema)}
//         label="Email"
//         placeholder="your@email.com"
//         key={form.key("email")}
//         {...form.getInputProps("email")}
//       />

//       <Checkbox
//         mt="md"
//         label="I agree to sell my privacy"
//         key={form.key("termsOfService")}
//         {...form.getInputProps("termsOfService", { type: "checkbox" })}
//       />

//       <Group justify="flex-end" mt="md">
//         <Button type="submit">Submit</Button>
//       </Group>
//     </form>
//   );
// }
"use client";

import { Button, Checkbox, Group, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { valibotResolver } from "mantine-form-valibot-resolver";
import * as v from "valibot";
import { Schema } from "type-fest";

const BasicSchema = v.object({
  email: v.pipe(v.string(), v.nonEmpty()),
  termsOfService: v.pipe(v.boolean(), v.notValue(false)),
  profile: v.object({
    username: v.pipe(v.string(), v.nonEmpty()),
    bio: v.optional(v.string()),
  }),
});

export type BasicSchemaOutput = v.InferOutput<typeof BasicSchema>;

type RequiredField = {
  role_id: string[];
  required: boolean;
};

type RequiredSchema<TItem extends object> = Schema<TItem, RequiredField[]>;

type BasicSchema__Required = RequiredSchema<BasicSchemaOutput>;

export function BasicForm() {
  const form = useForm<BasicSchemaOutput>({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      termsOfService: false,
    },
    validate: valibotResolver(BasicSchema),
  });

  return (
    <form onSubmit={form.onSubmit((values) => console.log(values))}>
      <TextInput
        label="Email"
        placeholder="your@email.com"
        key={form.key("email")}
        {...form.getInputProps("email")}
      />

      <Checkbox
        mt="md"
        label="I agree to sell my privacy"
        key={form.key("termsOfService")}
        {...form.getInputProps("termsOfService", { type: "checkbox" })}
      />

      <Group justify="flex-end" mt="md">
        <Button type="submit">Submit</Button>
      </Group>
    </form>
  );
}
