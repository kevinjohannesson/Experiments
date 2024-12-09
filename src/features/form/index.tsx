"use client";

import { createStore, StoreApi } from "zustand/vanilla";
import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { Get, PartialDeep, Paths } from "type-fest";
import { ReactNode, useState } from "react";
import { get, set } from "lodash-es";

/* ---------------------------- */
/*       Custom Errors          */
/* ---------------------------- */

/**
 * Custom error thrown when a field value cannot be found in the form state.
 */
class FieldValueNotFoundError extends Error {
  constructor(fieldName: string) {
    super(`Field value for "${fieldName}" was not found in the form state.`);
    this.name = "FieldValueNotFoundError";
    // Maintains proper stack trace for where our error was thrown (only works in V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FieldValueNotFoundError);
    }
  }
}

/* ---------------------------- */
/*       Utility Types          */
/* ---------------------------- */

/**
 * Extracts all possible paths within TFormData using bracket notation.
 * Example: For { user: { name: string } }, it would include 'user' and 'user.name'.
 */
type FieldName<TFormData extends object> = Paths<
  TFormData,
  { bracketNotation: true }
>;

/**
 * Retrieves the type of the value at the specified field path within TFormData.
 * Example: For TFormData = { user: { name: string } }, Get<TFormData, 'user.name'> is string.
 */
type FieldValue<
  TFormData extends object,
  TName extends FieldName<TFormData>
> = Get<TFormData, TName>;

/**
 * Defines the contract for form operations.
 * Currently includes a method to set the value of a specific field.
 */
interface IFormApi<TFormData extends object> {
  /**
   * Sets the value of a specified field.
   *
   * @template TName - The name/path of the field within TFormData.
   * @template TValue - The type of the value corresponding to TName.
   * @param name - The field name/path.
   * @param value - The new value to set for the field.
   */
  setFieldValue: <
    TName extends FieldName<TFormData>,
    TValue extends FieldValue<TFormData, TName>
  >(
    name: TName,
    value: TValue
  ) => void;
}

/* ---------------------------- */
/*        FieldApi Class        */
/* ---------------------------- */

/**
 * Represents interaction-based states of a field.
 */
interface FieldInteractionState {
  /**
   * The field currently has focus.
   */
  hasFocus: boolean;
}

/**
 * Represents the metadata of a field in a form.
 */
interface FieldMetaDataState {
  /**
   * The field was focused at least once and then blurred.
   */
  isTouched: boolean;
  /**
   * The field is currently blurred (no focus).
   */
  isBlurred: boolean;
  /**
   * The field's value has changed from its initial value.
   */
  isDirty: boolean;
}

/**
 * Represents the state of the field.
 */
interface FieldState {
  metadata: FieldMetaDataState;
  interaction: FieldInteractionState;
}

/**
 * Options required to initialize a FieldApi instance.
 */
interface FieldApiOptions<
  TFormData extends object,
  TName extends FieldName<TFormData>,
  TValue extends FieldValue<TFormData, TName>
> {
  /**
   * The name/path of the field this API manages.
   */
  name: TName;
  /**
   * The form API instance to interact with the form state.
   */
  formApi: IFormApi<TFormData>;
}

/**
 * Manages operations related to a specific form field.
 * Provides methods to set and handle changes to the field's value.
 */
class FieldApi<
  TFormData extends object,
  TName extends FieldName<TFormData>,
  TValue extends FieldValue<TFormData, TName>
> {
  /**
   * The name/path of the field.
   */
  name: TName;
  /**
   * Reference to the form API for interacting with the form state.
   */
  formApi: IFormApi<TFormData>;
  /**
   * Zustand store instance managing the field state.
   */
  store: StoreApi<FieldState>;

  /**
   * Initializes a new instance of FieldApi.
   *
   * @param opts - Configuration options for the field API.
   */
  constructor(opts: FieldApiOptions<TFormData, TName, TValue>) {
    this.name = opts.name;
    this.formApi = opts.formApi;

    // Initialize Zustand store with default field state
    this.store = createStore<FieldState>(() => ({
      interaction: {
        hasFocus: false,
      },
      metadata: {
        isTouched: false,
        isBlurred: false,
        isDirty: false,
      },
    }));

    // Subscribe to state changes for common actions
    this.store.subscribe((state) => {
      console.log("State changed:", state);
    });

    // Bind methods to preserve `this` context when passed as callbacks
    this.setValue = this.setValue.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  /**
   * Sets the value of the field by delegating to the form API.
   *
   * @param value - The new value to set for the field.
   */
  setValue(value: TValue) {
    this.formApi.setFieldValue(this.name, value);
  }

  /**
   * Handles changes to the field's value, typically from user input.
   *
   * @param value - The new value input by the user.
   */
  handleChange(value: TValue) {
    this.setValue(value);
  }

  /**
   * Handles the focus event for the field, typically from user input.
   */
  handleFocus = () => {
    this.store.setState((s) => ({
      interaction: {
        ...s.interaction,
        hasFocus: true,
      },
    }));
  };

  /**
   * Handles the blur event for the field, typically from user input.
   */
  handleBlur = () => {
    const {
      metadata: { isTouched, isBlurred },
    } = this.store.getState();

    this.store.setState((s) => ({
      interaction: {
        ...s.interaction,
        isTouched: true,
        hasFocus: false,
        isBlurred: true,
      },
    }));

    // if (!prevTouched) {
    //   this.setMeta((prev) => ({ ...prev, isTouched: true }))
    //   this.validate('change')
    // }
    // if (!this.state.meta.isBlurred) {
    //   this.setMeta((prev) => ({ ...prev, isBlurred: true }))
    // }
    // this.validate('blur')

    // this.options.listeners?.onBlur?.({
    //   value: this.state.value,
    //   fieldApi: this,
    // })
  };
}

/* ---------------------------- */
/*          FormApi Class       */
/* ---------------------------- */

/**
 * Represents the state of the form, including field values and submission status.
 */
interface FormState<TFormData extends object> {
  /**
   * The current values of the form fields.
   */
  values: TFormData;
  /**
   * Indicates whether the form has been successfully submitted.
   */
  isSubmitted: boolean;
  /**
   * Indicates whether the form is in the process of being submitted.
   */
  isSubmitting: boolean;
  /**
   * Counts the number of times the form has been submitted.
   */
  submissionAttempts: number;
}

/**
 * Configuration options for initializing the FormApi.
 */
interface FormApiOptions<
  TFormData extends object,
  TSubmitResult extends unknown | void = void
> {
  /**
   * The default values for the form fields.
   */
  defaultValues?: PartialDeep<TFormData>;
  /**
   * Callback function to handle form submission.
   *
   * @param args - Contains the current form values.
   * @returns The result of the submission, which can be a promise.
   */
  onSubmit?: (args: {
    values: TFormData;
  }) => TSubmitResult | Promise<TSubmitResult>;
}

/**
 * Manages the overall form state and handles form-level operations like submission.
 * Implements the IFormApi interface to ensure type-safe interactions.
 */
class FormApi<TFormData extends object> implements IFormApi<TFormData> {
  /**
   * Zustand store instance managing the form state.
   */
  store: StoreApi<FormState<TFormData>>;
  /**
   * Configuration options provided during initialization.
   */
  options: FormApiOptions<TFormData>;

  /**
   * Initializes a new instance of FormApi.
   *
   * @param opts - Configuration options for the form API.
   */
  constructor(opts?: FormApiOptions<TFormData>) {
    console.log("[FormApi]");
    this.options = opts || {};

    // Initialize Zustand store with default form state
    this.store = createStore<FormState<TFormData>>(() => ({
      isSubmitted: false,
      isSubmitting: false,
      submissionAttempts: 0,
      values: (opts?.defaultValues ?? {}) as TFormData,
    }));

    // Bind methods to preserve `this` context when passed as callbacks
    this.setFieldValue = this.setFieldValue.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /**
   * Retrieves the current value of a specified field from the form state.
   *
   * @template TName - The name/path of the field to retrieve.
   * @param name - The field name/path.
   * @param opts - The options for value retrieval.
   * @param opts.strict - Throws error when value is not found.
   * @returns The current value of the specified field.
   */
  getFieldValue<TName extends FieldName<TFormData>>(
    name: TName,
    opts?: { strict: boolean }
  ) {
    const value = get(this.store.getState().values, name);
    if (!value && opts?.strict) {
      throw new FieldValueNotFoundError(name);
    }

    return value as FieldValue<TFormData, TName>;
  }

  /**
   * Sets the value of a specified field within the form state.
   *
   * @template TName - The name/path of the field to update.
   * @template TValue - The type of the value to set.
   * @param name - The field name/path.
   * @param value - The new value for the field.
   */
  setFieldValue<
    TName extends FieldName<TFormData>,
    TValue extends FieldValue<TFormData, TName>
  >(name: TName, value: TValue) {
    this.store.setState((s) => ({
      values: set(s.values, name, value),
    }));
  }

  /**
   * Handles the form submission process, updating submission states and invoking the onSubmit callback.
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
      // Invoke the onSubmit callback with the current form values
      await this.options.onSubmit?.({ values: this.store.getState().values });

      // Update the form state to indicate successful submission
      this.store.setState(() => ({ isSubmitted: true }));
    } catch (err) {
      // Handle submission errors as needed
      console.error("Form submission error:", err);
      throw err; // Re-throw the error after logging
    } finally {
      // Reset the submitting state regardless of submission outcome
      this.store.setState({ isSubmitting: false });
    }
  }
}

/* ---------------------------- */
/*       React Integration      */
/* ---------------------------- */

/* ---------------------------- */
/*         React Field          */
/* ---------------------------- */

/**
 * Extends the FieldApi class to include React-specific components.
 * This allows for seamless integration of form state management with React components.
 */
class ReactFieldApi<
  TFormData extends object,
  TName extends FieldName<TFormData>,
  TValue extends Get<TFormData, TName>
> extends FieldApi<TFormData, TName, TValue> {
  /**
   * Initializes a new instance of ReactFormApi and binds methods to preserve `this` context.
   *
   * @param opts - Configuration options for the form API.
   */
  constructor(opts: FieldApiOptions<TFormData, TName, TValue>) {
    super(opts);
  }
}

/**
 * Custom hook to initialize and manage a FieldApi instance.
 *
 * @template TFormData - The shape of the form data.
 * @template TName - The name/path of the field.
 * @template TValue - The type of the field's value.
 * @param opts - Configuration options for the field API.
 * @returns The initialized FieldApi instance.
 */
function useField<
  TFormData extends object,
  TName extends FieldName<TFormData>,
  TValue extends Get<TFormData, TName>
>(opts: FieldApiOptions<TFormData, TName, TValue>) {
  // Initialize FieldApi once per component instance
  const [api] = useState<ReactFieldApi<TFormData, TName, TValue>>(
    new ReactFieldApi(opts)
  );
  return api;
}

/**
 * Props for the Field component.
 */
interface FieldProps<
  TFormData extends object,
  TName extends FieldName<TFormData>,
  TValue extends Get<TFormData, TName>
> extends FieldApiOptions<TFormData, TName, TValue> {
  /**
   * The form API instance to interact with the form state.
   */
  formApi: FormApi<TFormData>;
  /**
   * Render prop to render the field's UI, receiving the FieldApi instance.
   */
  children?: (fieldApi: ReactFieldApi<TFormData, TName, TValue>) => ReactNode;
}

/**
 * Simplifies the usage of the Field component by omitting the formApi prop.
 */
type InjectedFieldProps<
  TFormData extends object,
  TName extends FieldName<TFormData>,
  TValue extends Get<TFormData, TName>
> = Omit<FieldProps<TFormData, TName, TValue>, "formApi">;

/**
 * React component representing a form field.
 * Utilizes the render props pattern to provide FieldApi functionalities.
 *
 * @template TFormData - The shape of the form data.
 * @template TName - The name/path of the field.
 * @template TValue - The type of the field's value.
 * @param props - Props including field name, form API, and render prop.
 * @returns The rendered field UI or null if no children are provided.
 */
function Field<
  TFormData extends object,
  TName extends FieldName<TFormData>,
  TValue extends Get<TFormData, TName>
>({ formApi, name, children }: FieldProps<TFormData, TName, TValue>) {
  // Initialize FieldApi using the custom hook
  const fieldApi = useField<TFormData, TName, TValue>({
    name,
    formApi,
  });
  // Render the field's UI using the provided render prop
  return children?.(fieldApi) ?? null;
}

/* ---------------------------- */
/*        React Subscribe       */
/* ---------------------------- */

/**
 * Props for the Subscribe component.
 */
interface SubscribeProps<TFormData extends object, TSelectorResult> {
  /**
   * The form API instance to interact with the form state.
   */
  formApi: FormApi<TFormData>;
  /**
   * Selector function to extract a specific part of the form state.
   */
  selector: (state: FormState<TFormData>) => TSelectorResult;
  /**
   * Render prop to render based on the selected form state.
   */
  children?: (args: { value: TSelectorResult }) => ReactNode;
}

/**
 * Simplifies the usage of the Subscribe component by omitting the formApi prop.
 */
type InjectedSubscribeProps<TFormData extends object, TSelectorResult> = Omit<
  SubscribeProps<TFormData, TSelectorResult>,
  "formApi"
>;

/**
 * React component that subscribes to specific parts of the form state.
 * Utilizes the render props pattern for flexibility.
 *
 * @template TFormData - The shape of the form data.
 * @template TSelectorResult - The type of the selected state slice.
 * @param props - Props including form API, selector function, and render prop.
 * @returns The rendered content based on the selected state or null if no children are provided.
 */
function Subscribe<TFormData extends object, TSelectorResult>({
  formApi,
  selector,
  children,
}: SubscribeProps<TFormData, TSelectorResult>) {
  // Subscribe to the selected part of the form state using Zustand's useStore hook
  const value = useStore(formApi.store, useShallow(selector));
  // Render the content based on the selected state
  return children?.({ value }) ?? null;
}

/* ---------------------------- */
/*        ReactFormApi Class    */
/* ---------------------------- */

/**
 * Extends the FormApi class to include React-specific components like Subscribe and Field.
 * This allows for seamless integration of form state management with React components.
 */
class ReactFormApi<TFormData extends object> extends FormApi<TFormData> {
  /**
   * Initializes a new instance of ReactFormApi and binds methods to preserve `this` context.
   *
   * @param opts - Configuration options for the form API.
   */
  constructor(opts?: FormApiOptions<TFormData>) {
    super(opts);

    // Bind methods to ensure correct `this` context when used as React components
    this.Subscribe = this.Subscribe.bind(this);
    this.Field = this.Field.bind(this);
  }

  /**
   * React component for subscribing to form state changes.
   *
   * @template TSelectorResult - The type of the selected state slice.
   * @param props - Injected props excluding formApi.
   * @returns The rendered Subscribe component.
   */
  Subscribe<TSelectorResult>(
    props: InjectedSubscribeProps<TFormData, TSelectorResult>
  ): ReactNode {
    return <Subscribe formApi={this} {...props} />;
  }

  /**
   * React component representing a form field.
   *
   * @template TName - The name/path of the field.
   * @template TValue - The type of the field's value.
   * @param props - Injected props excluding formApi.
   * @returns The rendered Field component.
   */
  Field<
    TName extends FieldName<TFormData>,
    TValue extends FieldValue<TFormData, TName>
  >(props: InjectedFieldProps<TFormData, TName, TValue>): ReactNode {
    return <Field formApi={this} {...props} />;
  }
}

/* ---------------------------- */
/*        useFormApi Hook       */
/* ---------------------------- */

/**
 * Custom hook to initialize and manage a ReactFormApi instance.
 * Ensures that the same formApi instance persists across component re-renders.
 *
 * @template TFormData - The shape of the form data.
 * @param opts - Configuration options for the form API.
 * @returns The initialized ReactFormApi instance.
 */
function useFormApi<TFormData extends object>(opts: FormApiOptions<TFormData>) {
  const [api] = useState<ReactFormApi<TFormData>>(
    new ReactFormApi<TFormData>(opts)
  );

  return api;
}

/* ---------------------------- */
/*   Testing/Usage Examples     */
/* ---------------------------- */

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

type BooleanFieldPaths<T extends object> = {
  [K in FieldName<T>]: FieldValue<T, K> extends boolean ? K : never;
}[FieldName<T>];

function FieldMetaDataBooleanEntry<
  TFormData extends object,
  TName extends FieldName<TFormData>,
  TValue extends FieldValue<TFormData, TName>
>({
  fieldApi,
  path,
}: {
  fieldApi: ReactFieldApi<TFormData, TName, TValue>;
  path: BooleanFieldPaths<FieldState>;
}) {
  console.log("[FieldMetaDataEntry");
  const state = useStore(
    fieldApi.store,
    useShallow((s) => get(s, path))
  );
  return (
    <pre>
      {path}: {state ? "yes" : "no"}
    </pre>
  );
}

function FieldMetaData<
  TFormData extends object,
  TName extends FieldName<TFormData>,
  TValue extends FieldValue<TFormData, TName>
>({ fieldApi }: { fieldApi: ReactFieldApi<TFormData, TName, TValue> }) {
  console.log("[FieldMetaData");
  return (
    <div>
      <h3>Field meta</h3>
      <FieldMetaDataBooleanEntry
        fieldApi={fieldApi}
        path="metadata.isTouched"
      />
      <FieldMetaDataBooleanEntry
        fieldApi={fieldApi}
        path="metadata.isBlurred"
      />
      <FieldMetaDataBooleanEntry
        fieldApi={fieldApi}
        path="interaction.hasFocus"
      />
    </div>
  );
}

function TextField<
  TFormData extends object,
  TName extends FieldName<TFormData>,
  TValue extends FieldValue<TFormData, TName>
>({
  formApi,
  name,
  label,
}: {
  formApi: ReactFormApi<TFormData>;
  name: TName;
  label: string;
}) {
  return (
    <formApi.Field name={name}>
      {(fieldApi) => (
        <div className="border border-solid border-black p-2 flex flex-col gap-4">
          <div>
            <h3>Field state</h3>
            <div className="border border-solid border-black p-2">
              <pre>name: {fieldApi.name}</pre>
            </div>
          </div>

          <div>
            <h3>Field input</h3>
            <label className="flex gap-4 border border-solid border-black p-2">
              <span>{label}</span>
              <input
                onChange={(e) =>
                  fieldApi.handleChange(e.target.value as TValue)
                }
                onBlur={fieldApi.handleBlur}
                onFocus={fieldApi.handleFocus}
              />
            </label>
          </div>
          <div className="border border-solid border-black p-2">
            <FieldMetaData fieldApi={fieldApi} />
          </div>
        </div>
      )}
    </formApi.Field>
  );
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

  // const value = formApi.getFieldValue("firstName");

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

      <TextField formApi={formApi} name={"firstName"} label="First name" />

      <TextField formApi={formApi} name={"lastName"} label="Last name" />

      <button type="submit" className="p-2 mt-4 rounded">
        Submit
      </button>
    </form>
  );
}

interface FormData__002 {
  user: {
    firstName: string;
    lastName: string;
    age: number;
    address: {
      street: string;
      number: number;
      city: string;
    };
  };
  email: string;
  isAdmin: boolean;
}

export function FormComponent__002() {
  console.log("[FormComponent__002]");
  const formApi = useFormApi<FormData__002>({
    defaultValues: {},
    onSubmit: ({ values }) => {
      console.log("[FormComponent__002.onSubmit]");
      console.log({ values });
    },
  });

  // const value = formApi.getFieldValue("user.firstName");

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

      <formApi.Field name="user.firstName">
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

      <formApi.Field name="user.lastName">
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
