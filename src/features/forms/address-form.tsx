// type SupportedCountry = "The Netherlands";


interface AddressFormFields {
  country: string;
}

type PostalCode = string;

interface AddressFormFields__TheNetherlands extends AddressFormFields {
  street: string;
  number: string;
  numberAddition: string;
  postalCode: PostalCode;
}

interface AddressForm<TFormData> {
  data: 
}

