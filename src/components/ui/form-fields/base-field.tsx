import { ReactNode } from "react";

interface IBaseFieldProps {
  label: string;
  input: () => ReactNode;
}

export function BaseField({ label, input }: IBaseFieldProps) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <label>{label}</label>
        {input()}
      </div>
    </>
  );
}
