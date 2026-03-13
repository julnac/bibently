export interface Address {
  type: string;
  name: string;
  street?: string | null;
  city: string;
  country: string;
  postalCode?: string | null;
  rawAddressString?: string | null;
  longitude?: number;
  latitude?: number;
}

export interface Location {
  type: string;
  name: string;
  address: Address;
}

export interface Organization {
  type: string;
  name: string;
  url: string;
  address: Address;
}