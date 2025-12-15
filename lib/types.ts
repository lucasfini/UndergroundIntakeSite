export interface ContactInfo {
  service: string
  name: string
  position: string
  email: string
}

export interface EventDetails {
  eventName: string
  startTime: string
  endTime: string
  eventDate: string
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

export interface PackageIncludeItem {
  type?: 'header'
  content?: string  // For headers
  size?: string     // For regular items
  item?: string     // For regular items
  quantity?: string // For regular items
  note?: string     // Optional note for items
}

export interface PackageOption {
  id: string
  name: string
  price: number
  includes: (PackageIncludeItem | string)[]
  turnaround?: string
  color?: string
  image?: string
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
