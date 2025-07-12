// Path: src/store/cartStore.ts
import { create } from 'zustand'

// --- Type Definitions ---
type CartItem = {
  _id: string;
  name: string;
  pricePerBalang: number;
  quantity: number;
};

type Package = {
  _id: string;
  name: string;
  price: number;
  flavorLimit: number;
};

type Addon = {
  _id: string;
  name: string;
  price: number;
  hasQuantity: boolean;
};

type AddonItem = Addon & { quantity: number };

// --- Cart State ---
type CartState = {
  items: CartItem[];
  selectedPackage: Package | null;
  selectedAddons: AddonItem[];
  
  // Flavor actions
  addItem: (drink: Omit<CartItem, 'quantity'>) => void;
  removeItem: (drinkId: string) => void;
  
  // Package action
  selectPackage: (pkg: Package | null) => void;

  // Addon actions
  addAddon: (addon: Addon) => void;
  removeAddon: (addonId: string) => void;
};

export const useCartStore = create<CartState>((set) => ({
  // --- Initial State ---
  items: [],
  selectedPackage: null,
  selectedAddons: [],

  // --- Flavor Actions ---
  addItem: (drink) => set((state) => {
    const existingItem = state.items.find((item) => item._id === drink._id);
    if (existingItem) {
      return { items: state.items.map((item) => item._id === drink._id ? { ...item, quantity: item.quantity + 1 } : item) };
    }
    return { items: [...state.items, { ...drink, quantity: 1 }] };
  }),
  removeItem: (drinkId) => set((state) => {
    const existingItem = state.items.find((item) => item._id === drinkId);
    if (existingItem && existingItem.quantity > 1) {
      return { items: state.items.map((item) => item._id === drinkId ? { ...item, quantity: item.quantity - 1 } : item) };
    }
    return { items: state.items.filter((item) => item._id !== drinkId) };
  }),

  // --- Package Action ---
  selectPackage: (pkg) => set({ selectedPackage: pkg }),

  // --- Addon Actions (Upgraded) ---
  addAddon: (addon) => set((state) => {
    const existingAddon = state.selectedAddons.find(a => a._id === addon._id);
    if (existingAddon) {
      return { selectedAddons: state.selectedAddons.map(a => a._id === addon._id ? { ...a, quantity: a.quantity + 1 } : a) };
    }
    return { selectedAddons: [...state.selectedAddons, { ...addon, quantity: 1 }] };
  }),
  removeAddon: (addonId) => set((state) => {
    const existingAddon = state.selectedAddons.find(a => a._id === addonId);
    if (existingAddon && existingAddon.quantity > 1) {
      return { selectedAddons: state.selectedAddons.map(a => a._id === addonId ? { ...a, quantity: a.quantity - 1 } : a) };
    }
    return { selectedAddons: state.selectedAddons.filter(a => a._id !== addonId) };
  }),
}));
