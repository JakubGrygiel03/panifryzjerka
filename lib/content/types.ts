import type { ServiceGroup } from "@/lib/booking/types";

export type OpeningHour = { day: string; hours: string };

export type SalonSettings = {
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  mapsUrl: string;
  noticeEnabled: boolean;
  noticeText: string;
  openingHours: OpeningHour[];
  googleRating: number;
  googleReviewCount: number;
  googleReviewsUrl: string;
};

export type Transformation = {
  id: string;
  title: string;
  category: string;
  tag: string;
  before: string;
  after: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  specialties: string[];
  photo: string | null;
};

export type Review = {
  name: string;
  text: string;
  service: string;
};

export type SalonContent = {
  settings: SalonSettings;
  services: ServiceGroup[];
  transformations: Transformation[];
  team: TeamMember[];
  reviews: Review[];
};
