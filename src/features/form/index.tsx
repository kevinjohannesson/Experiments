"use client";

import * as React from "react";
import { createStore, StoreApi } from "zustand/vanilla";
import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";

/* Vanilla / Agnostic */

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
   * A boolean indicating if the form is currently in the process of being
   * submitted after `handleSubmit` is called.
   */
  isSubmitting: boolean;
  /**
   * A counter for tracking the number of submission attempts.
   */
  submissionAttempts: number;
}

interface FormOptions<TFormData, TSubmitResult extends unknown | void = void> {
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

export class FormApi<TFormData> {
  store: StoreApi<FormState<TFormData>>;
  options: FormOptions<TFormData>;

  constructor(opts?: FormOptions<TFormData>) {
    console.log("[FormApi]");
    this.options = opts || {};

    this.store = createStore<FormState<TFormData>>(() => ({
      isSubmitted: false,
      isSubmitting: false,
      submissionAttempts: 0,
      values: opts?.defaultValues ?? ({} as never),
    }));
  }

  /**
   * Handles the form submission
   */
  handleSubmit = async () => {
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
  };
}

class FieldApi {
  constructor() {}
}

/* React */

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

interface FieldProps<TFormData> {
  formApi: FormApi<TFormData>;
  children?: () => React.ReactNode;
}

type InjectedFieldProps<TFormData> = Omit<FieldProps<TFormData>, "formApi">;

function Field<TFormData>({ formApi, children }: FieldProps<TFormData>) {
  return children?.() ?? null;
}

interface ReactFormApi<TFormData> extends FormApi<TFormData> {
  Subscribe: <TSelectorResult>(
    props: InjectedSubscribeProps<TFormData, TSelectorResult>
  ) => React.ReactNode;
  Field: (props: InjectedFieldProps<TFormData>) => React.ReactNode;
}

export function useForm<TFormData>(opts?: FormOptions<TFormData>) {
  const [formApi] = React.useState<ReactFormApi<TFormData>>(() => {
    const formApi = new FormApi<TFormData>(opts);
    const api: ReactFormApi<TFormData> = {
      ...formApi,
      Subscribe: (props) => <Subscribe formApi={formApi} {...props} />,
      Field: (props) => <Field formApi={formApi} {...props} />,
    };

    return api;
  });

  return formApi;
}

/* Testing */

interface FormData__001 {
  firstName: string;
  lastName: string;
}

export function FormComponent__001() {
  console.log("[FormComponent__001]");
  const formApi = useForm<FormData__001>({
    defaultValues: {
      firstName: "",
      lastName: "",
    },
    onSubmit: () => {
      console.log("[FormComponent__001.onSubmit]");
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
      <h2>State</h2>

      <formApi.Subscribe selector={(s) => s.submissionAttempts}>
        {({ value }) => <span>submissionAttempts: {value}</span>}
      </formApi.Subscribe>

      <formApi.Subscribe selector={(s) => [s.isSubmitted] as const}>
        {({ value: [isSubmitted] }) => (
          <span>isSubmitted: {isSubmitted ? "yes" : "no"}</span>
        )}
      </formApi.Subscribe>

      <button type="submit" className="p-2 rounded">
        Submit
      </button>
    </form>
  );
}
