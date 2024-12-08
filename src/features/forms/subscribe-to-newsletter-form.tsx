"use client";

import {
  FormProvider,
  useFormContext,
} from "@/components/providers/FormProvider";
import { TextInput, Checkbox, Button, CheckboxProps } from "@mantine/core";
import {
  FieldApi,
  FieldValidators,
  useForm,
  Validator,
} from "@tanstack/react-form";
import { valibotValidator } from "@tanstack/valibot-form-adapter";
import { zodValidator } from "@tanstack/zod-form-adapter";
import * as v from "valibot";

interface BasicSubscribeToNewsletterForm {
  emailAddress: string;
  hasAgreedToTermsOfService: boolean;
}

export default function SubscribeToNewsletterForm() {
  console.log("[SubscribeToNewsletterForm]");

  const onSubmitFormValidationSchema = v.object({
    emailAddress: v.pipe(
      v.string(),
      v.trim(),
      v.nonEmpty("[Form] This field is required.")
    ),
    hasAgreedToTermsOfService: v.pipe(
      v.boolean(),
      v.literal(true, "[Form] You must agree to the Terms of Service")
    ),
  }) satisfies v.GenericSchema<
    Pick<BasicSubscribeToNewsletterForm, "hasAgreedToTermsOfService">
  >;

  const form = useForm({
    defaultValues: {
      emailAddress: "",
      hasAgreedToTermsOfService: false,
    } as BasicSubscribeToNewsletterForm,
    validatorAdapter: valibotValidator(),
    validators: {
      onSubmit: onSubmitFormValidationSchema,
    },
    onSubmit: async ({ value }) => {
      // Handle form submission
      console.log(
        `%cSubmitting data:`,
        `background: lightgreen; color: darkslategray `
      );
      console.log(value);
    },
  });

  const { handleSubmit, Subscribe } = form;

  return (
    <FormProvider form={form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <SubscribeToNewsletterFields />

        <Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? "..." : "Subscribe"}
            </Button>
          )}
        </Subscribe>
      </form>
    </FormProvider>
  );
}

interface SubscribeToNewsletterFormFieldsProps {
  emailAddressFieldProps?: EmailAddressFieldProps;
  termsOfServiceFieldProps?: TermsOfServiceFieldProps;
}

function SubscribeToNewsletterFields({
  emailAddressFieldProps,
  termsOfServiceFieldProps,
}: SubscribeToNewsletterFormFieldsProps) {
  return (
    <>
      <EmailAddressField {...emailAddressFieldProps} />
      <TermsOfServiceField {...termsOfServiceFieldProps} />
    </>
  );
}

interface FieldProps<TName extends string = string> {
  // For tanstack field
  name?: TName;
  validators?: FieldValidators<unknown, TName, undefined, undefined, unknown>;
  validatorAdapter?: Validator<unknown, unknown>;
  mode?: "value" | "array";
  asyncAlways?: boolean;
  children?: (
    fieldApi: FieldApi<
      unknown,
      string,
      Validator<unknown, unknown> | undefined,
      undefined,
      unknown
    >
  ) => React.ReactNode;

  // For mantine input
  label?: React.ReactNode;
}

interface EmailAddressFieldProps extends FieldProps {
  placeholder?: string;
}

function EmailAddressField(props: EmailAddressFieldProps) {
  const { Field } = useFormContext();

  const emailAddressOnChangeFieldValidationSchema = v.pipe(
    v.string(),
    v.email("Invalid email format")
  );

  const {
    name = "emailAddress",
    validators = {
      onChange: emailAddressOnChangeFieldValidationSchema,
    },
    validatorAdapter = zodValidator(),
    asyncAlways,
    mode,

    label = "Email address",
    placeholder = "Enter your email address",
  } = props;

  return (
    <Field
      name={name}
      validators={validators}
      validatorAdapter={validatorAdapter}
      asyncAlways={asyncAlways}
      mode={mode}
    >
      {({ state, handleChange, handleBlur }) => (
        <TextInput
          label={label}
          placeholder={placeholder}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          defaultValue={state.value as string}
          error={state.meta.errors?.[0]}
          required={true}
        />
      )}
    </Field>
  );
}

interface TermsOfServiceFieldProps extends FieldProps {
  labelPosition?: CheckboxProps["labelPosition"];
}

export function TermsOfServiceField(props: TermsOfServiceFieldProps) {
  const { Field } = useFormContext();

  const {
    name = "hasAgreedToTermsOfService",
    validators,
    validatorAdapter,
    asyncAlways,
    mode,

    label = "I agree to the terms of service",
    labelPosition = "right",
  } = props;

  return (
    <Field
      name={name}
      validators={validators}
      validatorAdapter={validatorAdapter}
      asyncAlways={asyncAlways}
      mode={mode}
    >
      {({ state, handleChange, handleBlur }) => (
        <Checkbox
          name={name}
          label={label}
          labelPosition={labelPosition}
          checked={state.value as boolean}
          onChange={(e) => {
            handleChange(e.target.checked);
          }}
          onBlur={handleBlur}
          description="You must agree to the Terms of Service"
          error={state.meta.errors?.[0]}
        />
      )}
    </Field>
  );
}
