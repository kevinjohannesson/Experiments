"use client";

import * as React from "react";
import * as v from "valibot";
import * as _ from "lodash-es";
import {
  Alert,
  Button,
  Checkbox,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  ReactFormExtendedApi,
  useForm,
  ValidationError,
  Validator,
} from "@tanstack/react-form";

import {
  defaultFormTransformer,
  prefixSchemaToErrors,
  valibotValidator,
} from "@tanstack/valibot-form-adapter";

interface BasicSubscribeToNewsletterForm {
  emailAddress: string;
  hasAgreedToTermsOfService: boolean;
}

const emailAddressOnChangeFieldValidationSchema = v.pipe(
  v.string(),
  v.email("Invalid email format")
);

const onChangeFormValidationSchema = v.object({
  emailAddress: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty("[Form] This field is required.")
  ),
}) satisfies v.GenericSchema<
  Pick<BasicSubscribeToNewsletterForm, "emailAddress">
>;

const onSubmitFormValidationSchema = v.object({
  emailAddress: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty("[Form] This field is required."),
    v.check((arg) => arg !== "a@a.aaaa", "wtf")
  ),
  hasAgreedToTermsOfService: v.pipe(
    v.boolean(),
    v.literal(true, "[Form] You must agree to the Terms of Service")
  ),
}) satisfies v.GenericSchema<
  Pick<BasicSubscribeToNewsletterForm, "hasAgreedToTermsOfService">
>;

function defaultIssuesTransformer(issues: v.GenericIssue[]) {
  return issues.map((issue) => issue.message).join(", ");
}

export default function BasicSubscribeToNewsletterForm() {
  console.log("BasicSubscribeToNewsletterForm");
  const form = useForm({
    defaultValues: {
      emailAddress: "",
      hasAgreedToTermsOfService: false,
    } as BasicSubscribeToNewsletterForm,
    validatorAdapter: valibotValidator(),
    validators: {
      onChange: onChangeFormValidationSchema,
      onSubmit: (args) => {
        if (args.value.emailAddress === "a@a.aaa")
          return {
            form: "[Form] Form level validation error.",
            fields: {},
          };

        return valibotValidator()().validate(
          {
            value: args.value,
            validationSource: "form",
          },
          onSubmitFormValidationSchema
        );
        // const result = v.safeParse(onSubmitFormValidationSchema, args.value);
        // if (!_.isEmpty(result.issues)) {
        //   const transformer = defaultFormTransformer(defaultIssuesTransformer);

        //   return transformer(result.issues!);
        // }
      },
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

  const { Field, handleSubmit, Subscribe } = form;

  return (
    <FormProvider form={form}>
      <Paper shadow="sm" p="xl">
        <Stack component="article" gap="lg">
          <Paper shadow="xs" p="md">
            <Stack component={"section"}>
              <Title order={2}>Subscribe to the newsletter</Title>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <Stack>
                  <Field
                    name={"emailAddress"}
                    // validatorAdapter={valibotValidator()}
                    validators={{
                      onChange: emailAddressOnChangeFieldValidationSchema,
                      onSubmit: (args) => {
                        if (args.value === "a@a.aa")
                          return "[Field] Some validation error.";

                        return v
                          .safeParse(
                            emailAddressOnChangeFieldValidationSchema,
                            args.value
                          )
                          .issues?.map((i) => {
                            console.log(i);
                            return i.message;
                          })
                          .join();

                        console.log({ foo });
                      },
                    }}
                  >
                    {({ state, handleChange, handleBlur }) => (
                      <TextInput
                        label="Email address"
                        // type="email"
                        placeholder="Enter your email address"
                        onChange={(e) => handleChange(e.target.value)}
                        onBlur={handleBlur}
                        defaultValue={state.value}
                        error={state.meta.errors?.[0]}
                        required={true}
                      />
                    )}
                  </Field>

                  <Field name={"hasAgreedToTermsOfService"}>
                    {({ state, handleChange, handleBlur }) => (
                      <Checkbox
                        label="I agree to the terms of service"
                        labelPosition="right"
                        checked={state.value}
                        onChange={(e) => {
                          handleChange(e.target.checked);
                        }}
                        onBlur={handleBlur}
                        description="You must agree to the Terms of Service"
                        error={state.meta.errors?.[0]}
                      />
                    )}
                  </Field>

                  <Subscribe
                    selector={(s) => [s.canSubmit, s.isSubmitting] as const}
                  >
                    {([canSubmit, isSubmitting]) => (
                      <Button type="submit" mt="sm" disabled={!canSubmit}>
                        {isSubmitting ? "..." : "Subscribe"}
                      </Button>
                    )}
                  </Subscribe>

                  <ValidationSummary
                    classNameMap={{
                      Alert: "mt-8",
                    }}
                  />
                </Stack>
              </form>
            </Stack>
          </Paper>
        </Stack>
      </Paper>
    </FormProvider>
  );
}

export const useFormErrors = () => {
  const { Subscribe } = useFormContext();
  return function renderProps(
    callback: (errors: ValidationError[]) => React.ReactNode | null
  ) {
    return (
      <Subscribe selector={(s) => s.errors}>
        {(errors) => callback(errors)}
      </Subscribe>
    );
  };
};

export const useFieldErrors = () => {
  const { Subscribe } = useFormContext();
  return function renderProps(
    callback: (errors: ValidationError[]) => React.ReactNode | null
  ) {
    return (
      <Subscribe selector={(s) => s.fieldMeta}>
        {(fieldMeta) => {
          const errors = Object.keys(fieldMeta).flatMap(
            (key) => fieldMeta[key as keyof typeof fieldMeta].errors
          );
          return callback(errors);
        }}
      </Subscribe>
    );
  };
};

function ValidationSummary({
  classNameMap,
}: {
  classNameMap?: { Alert?: string; Text?: string };
}) {
  const subscribeErrors = useFormErrors();

  return subscribeErrors((errors) => {
    console.log({ errors });
    const title = "ValidationSummary";

    if (errors.length)
      return (
        <Alert color="red" title={title} className={classNameMap?.Alert}>
          {errors.map(
            (error, i) =>
              error && (
                <Text key={`${error}${i}`} className={classNameMap?.Text}>
                  {error}
                </Text>
              )
          )}
        </Alert>
      );

    return null;
  });
}
