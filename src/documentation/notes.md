Potentieel API voor field component:

```ts
interface Field<T> {
  // state
  value: T;
  // modifier
  required?: boolean | SomeFn | listener?;
  enabled?: boolean | SomeFn;
  readOnly?: boolean | SomeFn;
  visible?: boolean | SomeFn;
  // validation
  validators?: unknown; // zoals tanstack forms
  validatorAdapter?: unknown; // zoals tanstack forms?
}
```

toch ook een soort schema based

basisopzet config

```ts
textinput => textinput component
dateinput => date input component
emailaddress => email address component
... zelf uit te breiden
```
