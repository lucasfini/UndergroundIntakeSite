export interface ContactInfo {
  service: string
  name: string
  position: string
  email: string
}

export interface EventDetails {
  eventName: string
  time: string
  eventDate: string
  logos: File[]
  location: string
  link: string
}

export interface FormData {
  contactInfo: ContactInfo
  eventDetails: EventDetails
  callToAction: string
  content: string
  additionalInfo: string
  selectedPackage?: string
  selectedAddOns: string[]
  files: File[]
}

export interface PackageOption {
  id: string
  name: string
  price: number
  includes: string[]
  turnaround?: string
  color?: string
  note?: string
}

export interface AddOnOption {
  id: string
  name: string
  price: number | string
  description?: string
  category: 'digital' | 'printed' | 'special'
  note?: string
}

export interface PricingData {
  packages: PackageOption[]
  addOns: AddOnOption[]
}
