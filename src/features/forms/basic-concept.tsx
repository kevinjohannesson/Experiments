"use client";

import { Alert, Button, Group, Stack, Text, TextInput } from "@mantine/core";
import { FieldApi, formOptions, useForm } from "@tanstack/react-form";

interface Hobby {
  name: string;
  description: string;
}

interface Person {
  firstName: string;
  lastName: string;
  hobbies: Hobby[];
}

const formOpts = formOptions<Person>({
  defaultValues: {
    firstName: "",
    lastName: "",
    hobbies: [],
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FieldInfo({ field }: { field: FieldApi<any, any, any, any> }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <em>{field.state.meta.errors.join(",")}</em>
      ) : null}
      {field.state.meta.isValidating ? "Validating..." : null}
    </>
  );
}

export function BasicConceptForm() {
  const form = useForm({
    ...formOpts,
    validators: {
      onChange: ({ value: { firstName } }) =>
        !firstName
          ? { form: "A first name is required", fields: {} }
          : firstName.length < 3
          ? { form: "First name must be at least 3 characters", fields: {} }
          : undefined,
      onChangeAsyncDebounceMs: 500,
      onChangeAsync: async ({ value: { firstName } }) => {
        console.log("running");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return (
          firstName.includes("error") && {
            form: 'No "error" allowed in first name',
            fields: {},
          }
        );
      },
    },
    // defaultValues: {
    //   firstName: "",
    // },
    // validators: {
    //   onChange: () => "error",
    //   onChangeAsync: async ({ value: { firstName },signal }) => {
    //     console.log("running");
    //     await new Promise((resolve) => setTimeout(resolve, 1000));
    //     return (
    //       firstName.includes("error") && {
    //         form: 'No "error" allowed in first name',
    //         fields: {},
    //       }
    //     );
    //   },
    // },
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <Stack>
        <form.Field
          name="firstName"
          validators={{
            onChange: ({ value }) => {
              if (value.length < 2) return "smaller than 2";
              if (value.length < 5) return "smaller than 5";
            },
          }}
        >
          {(field) => (
            <>
              <TextInput
                label="First name"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldInfo field={field} />
            </>
          )}
        </form.Field>

        <form.Field name="lastName">
          {(field) => (
            <>
              <TextInput
                label="Last name"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldInfo field={field} />
            </>
          )}
        </form.Field>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Group>
              <Button type="submit" disabled={!canSubmit}>
                {isSubmitting ? "..." : "Submit"}
              </Button>
              <Button
                type="reset"
                onClick={() => form.reset()}
                variant="subtle"
              >
                Reset
              </Button>
            </Group>
          )}
        </form.Subscribe>

        <form.Subscribe selector={(state) => [state.errors]}>
          {([errors]) =>
            errors.length ? (
              <Alert color="red" title="Validation errors">
                {errors.map((error, index) => (
                  <Text key={`${error} #${index}`}>{error}</Text>
                ))}
              </Alert>
            ) : null
          }
        </form.Subscribe>
      </Stack>
    </form>
  );
}
