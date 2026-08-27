export type UserRole = "renter" | "owner";

export type ListingCategory =
  | "foil"
  | "jetski"
  | "sea_scooter"
  | "catamaran"
  | "small_boat"
  | "extreme_gear"
  | "other";

export type Profile = {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
};

export type Listing = {
  id: string;
  owner_id: string;
  title: string;
  category: ListingCategory;
  description: string;
  size_m: number;
  location: string;
  hourly_price: number;
  currency: string;
  photos: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

/** A listing joined with the public part of its owner's profile. */
export type ListingWithOwner = Listing & {
  owner: Pick<Profile, "id" | "full_name" | "role"> | null;
};

type ProfileInsert = Pick<Profile, "id"> & Partial<Omit<Profile, "id">>;
type ListingInsert = Omit<Listing, "id" | "created_at" | "updated_at" | "currency" | "photos" | "is_published"> &
  Partial<Pick<Listing, "id" | "currency" | "photos" | "is_published">>;

/** Minimal typing for the tables this milestone touches. */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: Partial<Profile>;
        Relationships: [];
      };
      listings: {
        Row: Listing;
        Insert: ListingInsert;
        Update: Partial<Listing>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      listing_category: ListingCategory;
    };
    CompositeTypes: Record<string, never>;
  };
};
