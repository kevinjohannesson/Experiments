/* eslint-disable react/no-children-prop */
"use client";

// import { AgeField } from "@/components/ui/form-fields/age-field";
// import { NameField } from "@/components/ui/form-fields/name-field";
import { z } from "zod";
import { FieldApi, useForm, Validator } from "@tanstack/react-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Progress, TextInput, Tooltip } from "@mantine/core";
import { LoadingOverlay, Button, Group, Box } from "@mantine/core";
import { Schema } from "type-fest";

function FieldInfo({ field }: { field: FieldApi<any, any, any, any> }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <em>{field.state.meta.errors.join(", ")}</em>
      ) : null}
      {field.state.meta.isValidating ? "Validating..." : null}
    </>
  );
}
function hasFieldError(field: FieldApi<any, any, any, any>) {
  return field.state.meta.isTouched && field.state.meta.errors.length;
}

function getFieldError(field: FieldApi<any, any, any, any>) {
  return hasFieldError(field) ? field.state.meta.errors.join(", ") : null;
}

const REGISTERED_USERNAMES = ["seapork", "ricecow", "olafdog"];

interface IFormSchema {
  username: string;
  firstName: string;
  lastName: string;
}

export type RequiredSchema = Schema<IFormSchema, boolean>;
export type EnabledSchema = Schema<IFormSchema, boolean>;
export type VisibilitySchema = Schema<IFormSchema, boolean>;

const defaultRequiredSchema: RequiredSchema = {
  username: true,
  firstName: true,
  lastName: false,
};

export function BasicForm({
  requiredFields,
}: {
  requiredFields?: Partial<RequiredSchema>;
}) {
  const form = useForm<IFormSchema>({
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
    },
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value);
    },
  });

  return (
    <>
      <p>form with onchange valiation and onchange async validation</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-2"
      >
        <div>
          {/* A type-safe field component*/}
          <form.Field
            name="username"
            validators={{
              onChange: ({ value, fieldApi }) =>
                requiredFields?.username && !value?.trim()
                  ? "A username is required"
                  : value.trim().length < 3
                  ? "Username name must be at least 3 characters"
                  : undefined,
              onChangeAsyncDebounceMs: 500,
              onChangeAsync: async ({ value }) => {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                return (
                  REGISTERED_USERNAMES.includes(value.trim()) &&
                  `Username '${value.trim()}' is already taken!`
                );
              },
            }}
            children={(field) => {
              // Avoid hasty abstractions. Render props are great!
              return (
                <>
                  <TextInput
                    withAsterisk={requiredFields?.username}
                    label="Username"
                    description="It must be unique!"
                    placeholder="Your preferred username"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      form.setFieldValue("lastName", "boogy");
                    }}
                    error={getFieldError(field)}
                    readOnly={false}
                    disabled={false}
                    rightSection={
                      field.state.meta.isValidating && (
                        <Tooltip label="Verifying">
                          <Loader size={16} />
                        </Tooltip>
                      )
                    }
                  />
                </>
              );
            }}
          />
        </div>

        <div>
          <form.Field
            name="firstName"
            validators={{
              onChange: ({ value }) =>
                requiredFields?.firstName && !value?.trim()
                  ? "A first name is required"
                  : undefined,
            }}
            children={(field) => (
              <>
                <TextInput
                  withAsterisk={requiredFields?.firstName}
                  label="First name:"
                  description="The first of your names"
                  placeholder="Your first name"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={getFieldError(field)}
                />
              </>
            )}
          />
        </div>

        <div>
          <form.Field
            name="lastName"
            validators={{
              onChange: ({ value }) =>
                requiredFields.lastName && !value?.trim()
                  ? "A last name is required"
                  : undefined,
            }}
            children={(field) => (
              <>
                <TextInput
                  withAsterisk={requiredFields.lastName}
                  label="Last Name:"
                  description="The last of your names"
                  placeholder="Your last name"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={getFieldError(field)}
                />
              </>
            )}
          />
        </div>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit} loading={isSubmitting}>
              {"Submit"}
            </Button>
          )}
        />
      </form>
    </>
  );
}
