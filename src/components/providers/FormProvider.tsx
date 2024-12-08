import { ReactFormExtendedApi, Validator } from "@tanstack/react-form";
import * as _ from "lodash-es";
import React from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TFormData = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TFormValidator = any;

const FormContext = React.createContext(
  {} as ReactFormExtendedApi<TFormData, TFormValidator | undefined>
);

export function useFormContext<
  TFormData,
  TFormValidator extends Validator<TFormData, unknown> | undefined = undefined
>() {
  const context = React.useContext(FormContext);
  if (_.isEmpty(context)) {
    throw new Error("useFormContext must be used within a FormProvider");
  }

  return context as ReactFormExtendedApi<TFormData, TFormValidator>;
}

export interface FormProviderProps<
  TFormData,
  TFormValidator extends Validator<TFormData, unknown> | undefined = undefined
> {
  form: ReactFormExtendedApi<TFormData, TFormValidator>;
  children?: React.ReactNode;
}

export function FormProvider<
  TFormData,
  TFormValidator extends Validator<TFormData, unknown> | undefined = undefined
>({ form, children }: FormProviderProps<TFormData, TFormValidator>) {
  return <FormContext.Provider value={form}>{children}</FormContext.Provider>;
}
