"use client";

import * as React from "react";
import * as _ from "lodash-es";
import { createStore, StoreApi } from "zustand/vanilla";
import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { Get, Paths } from "type-fest";

/* Vanilla / Agnostic components */

/* FieldApi */

type FieldName<TFormData> = Paths<TFormData, { bracketNotation: true }>;

type FieldValue<TFormData, TName extends FieldName<TFormData>> = Get<
  TFormData,
  TName
>;

interface IFormApi<TFormData> {
  setFieldValue: <
    TName extends FieldName<TFormData>,
    TValue extends FieldValue<TFormData, TName>
  >(
    name: TName,
    value: TValue
  ) => void;
}

interface FieldApiOptions<
  TFormData,
  TName extends FieldName<TFormData>,
  TValue extends FieldValue<TFormData, TName>
> {
  name: TName;
  formApi: IFormApi<TFormData>;
}

class FieldApi<
  TFormData,
  TName extends FieldName<TFormData>,
  TValue extends FieldValue<TFormData, TName>
> {
  name: TName;
  formApi: IFormApi<TFormData>;

  constructor(opts: FieldApiOptions<TFormData, TName, TValue>) {
    this.name = opts.name;
    this.formApi = opts.formApi;

    this.setValue = this.setValue.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  setValue(value: TValue) {
    this.formApi.setFieldValue(this.name, value);
  }

  handleChange(value: TValue) {
    this.setValue(value);
  }
}

/* FormApi */

interface FormState<TFormData> {
  /**
   * The current values of the form data.
   */
  values: TFormData;
  /**
   * A boolean indicating if the form has been submitted.
   */
  isSubmitted: boolean;
  /**
   * A boolean indicating if the form is currently being submitted.
   */
  isSubmitting: boolean;
  /**
   * A counter for tracking the number of submission attempts.
   */
  submissionAttempts: number;
}

interface FormApiOptions<
  TFormData,
  TSubmitResult extends unknown | void = void
> {
  /**
   * Default values for the form.
   */
  defaultValues?: TFormData;
  /**
   * Submit callback
   * @param args
   * @returns
   */
  onSubmit?: (args: {
    values: TFormData;
  }) => TSubmitResult | Promise<TSubmitResult>;
}

class FormApi<TFormData> implements IFormApi<TFormData> {
  store: StoreApi<FormState<TFormData>>;
  options: FormApiOptions<TFormData>;

  constructor(opts?: FormApiOptions<TFormData>) {
    console.log("[FormApi]");
    this.options = opts || {};

    this.store = createStore<FormState<TFormData>>(() => ({
      isSubmitted: false,
      isSubmitting: false,
      submissionAttempts: 0,
      values: opts?.defaultValues ?? ({} as never),
    }));

    this.setFieldValue = this.setFieldValue.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /**
   * Handles setting of field value
   */
  setFieldValue<
    TName extends FieldName<TFormData>,
    TValue extends FieldValue<TFormData, TName>
  >(name: TName, value: TValue) {
    this.store.setState((s) => ({
      values: {
        ...s.values,
        [name]: value, // _.isFunction(updater) ? updater() : updater,
      },
    }));
  }

  /**
   * Handles the form submission
   */
  async handleSubmit() {
    console.log("[handleSubmit");
    this.store.setState((s) => ({
      // Submission attempts mark the form as not submitted
      isSubmitted: false,
      // Count submission attempts
      submissionAttempts: s.submissionAttempts + 1,
    }));

    this.store.setState({ isSubmitting: true });

    try {
      // Run the submit code
      await this.options.onSubmit?.({ values: this.store.getState().values });

      // Update the store
      this.store.setState(() => ({ isSubmitted: true }));
    } catch (err) {
      throw err;
    } finally {
      // Clean up
      this.store.setState({ isSubmitting: false });
    }
  }
}

/* React related components */

/* React Field */

type ReactFieldApi<
  TFormData,
  TName extends FieldName<TFormData>,
  TValue extends Get<TFormData, TName>
> = FieldApi<TFormData, TName, TValue>;

function useField<
  TFormData,
  TName extends FieldName<TFormData>,
  TValue extends Get<TFormData, TName>
>(opts: FieldApiOptions<TFormData, TName, TValue>) {
  const [fieldApi] = React.useState<ReactFieldApi<TFormData, TName, TValue>>(
    () => {
      const fieldApi = new FieldApi(opts);

      return fieldApi;
    }
  );
  return fieldApi;
}

interface FieldProps<
  TFormData,
  TName extends FieldName<TFormData>,
  TValue extends Get<TFormData, TName>
> extends FieldApiOptions<TFormData, TName, TValue> {
  formApi: FormApi<TFormData>;
  children?: (
    fieldApi: ReactFieldApi<TFormData, TName, TValue>
  ) => React.ReactNode;
}

type InjectedFieldProps<
  TFormData,
  TName extends FieldName<TFormData>,
  TValue extends Get<TFormData, TName>
> = Omit<FieldProps<TFormData, TName, TValue>, "formApi">;

function Field<
  TFormData,
  TName extends FieldName<TFormData>,
  TValue extends Get<TFormData, TName>
>({ formApi, name, children }: FieldProps<TFormData, TName, TValue>) {
  const fieldApi = useField<TFormData, TName, TValue>({
    name,
    formApi,
  });
  return children?.(fieldApi) ?? null;
}

/* React Subscribe */

interface SubscribeProps<TFormData, TSelectorResult> {
  formApi: FormApi<TFormData>;
  selector: (state: FormState<TFormData>) => TSelectorResult;
  children?: (args: { value: TSelectorResult }) => React.ReactNode;
}

type InjectedSubscribeProps<TFormData, TSelectorResult> = Omit<
  SubscribeProps<TFormData, TSelectorResult>,
  "formApi"
>;

function Subscribe<TFormData, TSelectorResult>({
  formApi,
  selector,
  children,
}: SubscribeProps<TFormData, TSelectorResult>) {
  const value = useStore(formApi.store, useShallow(selector));
  return children?.({ value }) ?? null;
}

/* React Form */

class ReactFormApi<TFormData> extends FormApi<TFormData> {
  constructor(opts: FormApiOptions<TFormData>) {
    super(opts);

    this.Subscribe = this.Subscribe.bind(this);
    this.Field = this.Field.bind(this);
  }

  Subscribe<TSelectorResult>(
    props: InjectedSubscribeProps<TFormData, TSelectorResult>
  ): React.ReactNode {
    return <Subscribe formApi={this} {...props} />;
  }

  Field<
    TFieldName extends FieldName<TFormData>,
    TFieldData extends FieldValue<TFormData, TFieldName>
  >(
    props: InjectedFieldProps<TFormData, TFieldName, TFieldData>
  ): React.ReactNode {
    return <Field formApi={this} {...props} />;
  }
}

function useFormApi<TFormData>(opts: FormApiOptions<TFormData>) {
  const [formApi] = React.useState<ReactFormApi<TFormData>>(
    new ReactFormApi<TFormData>(opts)
  );

  return formApi;
}

/* Testing */

interface Testing__Data__SimpleForm {
  firstName: string;
  lastName: string;
  age: number;
  sex: "male" | "female";
}

type Testing__Type_IFormApi__SimpleForm = IFormApi<Testing__Data__SimpleForm>;

interface FormData__001 {
  firstName: string;
  lastName: string;
}

export function FormComponent__001() {
  console.log("[FormComponent__001]");
  const formApi = useFormApi<FormData__001>({
    defaultValues: {
      firstName: "",
      lastName: "",
    },
    onSubmit: ({ values }) => {
      console.log("[FormComponent__001.onSubmit]");
      console.log({ values });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        formApi.handleSubmit();
      }}
      className="p-8 flex flex-col gap-2"
    >
      <h2>Form state</h2>

      <formApi.Subscribe selector={(s) => s.submissionAttempts}>
        {({ value }) => <pre>submissionAttempts: {value}</pre>}
      </formApi.Subscribe>

      <formApi.Subscribe selector={(s) => [s.isSubmitted] as const}>
        {({ value: [isSubmitted] }) => (
          <pre>isSubmitted: {isSubmitted ? "yes" : "no"}</pre>
        )}
      </formApi.Subscribe>

      <h2 className="mt-8">Fields</h2>

      <formApi.Field name="firstName">
        {(fieldApi) => (
          <div className="border border-solid border-black p-2">
            <h3>Field state</h3>
            <pre>name: {fieldApi.name}</pre>

            <label className="flex flex-col gap-1 mt-4">
              <span>First name</span>
              <input onChange={(e) => fieldApi.handleChange(e.target.value)} />
            </label>
          </div>
        )}
      </formApi.Field>

      <formApi.Field name="lastName">
        {(fieldApi) => (
          <div className="border border-solid border-black p-2">
            <h3>Field state</h3>
            <pre>name: {fieldApi.name}</pre>

            <label className="flex flex-col gap-1 mt-4">
              <span>First name</span>
              <input onChange={(e) => fieldApi.handleChange(e.target.value)} />
            </label>
          </div>
        )}
      </formApi.Field>

      <button type="submit" className="p-2 mt-4 rounded">
        Submit
      </button>
    </form>
  );
}
