export interface PropertyDetails {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string;
  images?: string[];
  rating?: number;
  reviews?: number;
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
  guests?: number;
  amenities?: string[];
  host?: {
    name: string;
    verified?: boolean;
  };
}

export interface FavoriteListing {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string;
  rating?: number;
}
