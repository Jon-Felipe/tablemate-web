export type RestaurantImageType =
  | 'MAIN'
  | 'FOOD'
  | 'INTERIOR'
  | 'EXTERIOR'
  | 'WINE'
  | 'OTHER';

export type RestaurantInformationType =
  | 'DRESS_CODE'
  | 'CORKAGE'
  | 'PARKING'
  | 'TRANSPORT'
  | 'ACCESSIBILITY'
  | 'PAYMENT'
  | 'OTHER';

export type MenuType =
  | 'BREAKFAST'
  | 'LUNCH'
  | 'DINNER'
  | 'DESSERT'
  | 'DRINKS'
  | 'WINE';

export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  cuisine: string;
  priceLevel: number;

  address: string;
  city: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;

  phoneNumber: string;
  email: string;
  websiteUrl: string;

  createdAt: string;
  updatedAt: string;
}

export interface RestaurantListItem extends Restaurant {
  coverImage: RestaurantImage;
}

export interface RestaurantImage {
  id: string;
  restaurantId: string;
  imageUrl: string;
  altText: string;
  caption?: string;
  type: RestaurantImageType;
  isPrimary: boolean;
  displayOrder: number;
}

export interface RestaurantInformation {
  id: string;
  restaurantId: string;
  type: RestaurantInformationType;
  title: string;
  description: string;
  icon: string;
  displayOrder: number;
}

export interface RestaurantFeature {
  id: string;
  restaurantId: string;
  title: string;
  description: string;
  icon: string;
  displayOrder: number;
}

export interface Award {
  id: string;
  name: string;
  description?: string;
  icon: string;
}

export interface RestaurantAward {
  id: string;
  restaurantId: string;
  awardId: string;
  year?: number;
  awardedAt?: string;
  award?: Award;
}

export interface RestaurantDetails extends Restaurant {
  images: RestaurantImage[];
  information: RestaurantInformation[];
  features: RestaurantFeature[];
  awards: RestaurantAward[];
}

export interface CreateRestaurantInput {
  name: string;
  description: string;
  cuisine: string;
  priceLevel: number;

  address: string;
  city: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;

  phoneNumber: string;
  email: string;
  websiteUrl: string;
}

export type UpdateRestaurantInput = Partial<CreateRestaurantInput>;

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl?: string;
  isAvailable: boolean;
  displayOrder: number;
}

export interface MenuCategory {
  id: string;
  menuId: string;
  name: string;
  displayOrder: number;
  items: MenuItem[];
}

export interface RestaurantMenu {
  id: string;
  restaurantId: string;
  name: string;
  type: MenuType;
  description?: string;
  isActive: boolean;
  categories: MenuCategory[];
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export type RestaurantListResponse = ApiResponse<RestaurantListItem[]>;
export type RestaurantDetailsResponse = ApiResponse<RestaurantDetails>;
export type RestaurantMenuResponse = ApiResponse<RestaurantMenu>;
