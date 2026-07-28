interface ContactInfo {
  name: string;
  phone: string;
}

declare global {
  interface ContactProperty {
    getProperties(): Promise<readonly string[]>;
  }

  interface ContactAddress {
    city?: string;
    country?: string;
    dependentLocality?: string;
    phone?: string;
    postalCode?: string;
    region?: string;
    sortingCode?: string;
    addressLine?: string[];
  }

  interface Contact {
    name: readonly string[];
    tel: readonly string[];
    email: readonly string[];
    icon?: Blob;
    address?: readonly ContactAddress[];
  }

  interface ContactsManager {
    getProperties(): Promise<readonly string[]>;
    select(
      properties: readonly string[],
      options?: { multiple?: boolean }
    ): Promise<readonly Contact[]>;
  }

  interface Navigator {
    contacts?: ContactsManager;
  }
}

export function isContactPickerSupported(): boolean {
  return "contacts" in navigator && "ContactsManager" in window;
}

export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

export async function pickContact(): Promise<ContactInfo | null> {
  if (!isContactPickerSupported()) {
    throw new Error(
      "Contact Picker API is not supported on this device. Please use a mobile browser (Chrome/Edge on Android)."
    );
  }

  try {
    const properties = await navigator.contacts!.getProperties();
    const requestedProps: string[] = [];

    if (properties.includes("name")) requestedProps.push("name");
    if (properties.includes("tel")) requestedProps.push("tel");

    if (requestedProps.length === 0) {
      throw new Error("No contact properties available");
    }

    const contacts = await navigator.contacts!.select(requestedProps, {
      multiple: false,
    });

    if (!contacts || contacts.length === 0) {
      return null;
    }

    const contact = contacts[0];
    const name = contact.name?.[0] ?? "";
    const rawPhone = contact.tel?.[0] ?? "";
    const phone = cleanPhoneNumber(rawPhone);

    return { name, phone };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return null;
    }
    throw err;
  }
}
