import { useForm } from "react-hook-form";

interface FormData {
  firstName: "";
  lastName: "";
  age: 18;
}

export default function Page() {
  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      age: 18,
    },
  });

  const onSubmit = handleSubmit((data) => console.log(data));

  return (
    <form onSubmit={onSubmit}>
      <input {...register("firstName", { required: true, maxLength: 20 })} />
      <input {...register("lastName", { pattern: /^[A-Za-z]+$/i })} />
      <input type="number" {...register("age", { min: 18, max: 99 })} />
      <input type="submit" />
    </form>
  );
}
