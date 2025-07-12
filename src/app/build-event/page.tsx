// Path: src/app/build-event/page.tsx
'use client'

import { useEffect, useState, useMemo } from 'react'
import { client } from '@/lib/sanity-client'
import { useCartStore } from '@/store/cartStore'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from '@/components/ui/button'
import { Minus, Plus, Loader2 } from 'lucide-react'

// --- Type Definitions ---
type Package = {
  _id: string; name: string; price: number; description: string; note: string; flavorLimit: number;
};
type Addon = {
  _id: string; name: string; price: number; hasQuantity: boolean;
};

// --- Helper Components ---
const Section = ({ number, title, children }: { number: number, title: string, children: React.ReactNode }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
            <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold text-lg">{number}</div>
                <h2 className="ml-4 text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h2>
            </div>
            {children}
        </div>
    </div>
);

const AddonController = ({ addon }: { addon: Addon }) => {
  const { addAddon, removeAddon, selectedAddons } = useCartStore();
  const itemInCart = selectedAddons.find(a => a._id === addon._id);
  const quantity = itemInCart ? itemInCart.quantity : 0;

  if (!addon.hasQuantity) {
    return (
      <Checkbox id={addon._id} onCheckedChange={(checked) => checked ? addAddon(addon) : removeAddon(addon._id)} checked={quantity > 0} />
    )
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <Button onClick={() => removeAddon(addon._id)} size="icon" variant="outline" className="rounded-full h-8 w-8 border-gray-300 dark:border-gray-600">
        <Minus size={14} />
      </Button>
      <span className="text-lg font-bold w-8 text-center">{quantity}</span>
      <Button onClick={() => addAddon(addon)} size="icon" variant="outline" className="rounded-full h-8 w-8 border-gray-300 dark:border-gray-600">
        <Plus size={14} />
      </Button>
    </div>
  )
}


export default function BuildEventPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false); // For loading state
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const { items: selectedFlavors, selectedPackage, selectPackage, selectedAddons } = useCartStore();
  const totalFlavorCount = selectedFlavors.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const packagesQuery = `*[_type == "package"] | order(price asc)`;
        const addonsQuery = `*[_type == "addon"] | order(price asc){..., "hasQuantity": coalesce(hasQuantity, false)}`;
        const [fetchedPackages, fetchedAddons] = await Promise.all([ client.fetch(packagesQuery), client.fetch(addonsQuery) ]);
        setPackages(fetchedPackages);
        setAddons(fetchedAddons);
      } catch (error) {
        console.error("Failed to fetch event data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const { extraBalangsCount, extraBalangAddon, extraBalangsCost } = useMemo(() => {
    if (!selectedPackage || totalFlavorCount <= selectedPackage.flavorLimit) return { extraBalangsCount: 0, extraBalangAddon: null, extraBalangsCost: 0 };
    const extraCount = totalFlavorCount - selectedPackage.flavorLimit;
    const balangAddon = addons.find(a => a.name === 'Additional 1 x 23L Balang');
    if (!balangAddon) return { extraBalangsCount: 0, extraBalangAddon: null, extraBalangsCost: 0 };
    return { extraBalangsCount: extraCount, extraBalangAddon: balangAddon, extraBalangsCost: extraCount * balangAddon.price };
  }, [selectedPackage, totalFlavorCount, addons]);

  const finalTotalCost = useMemo(() => {
    const packageCost = selectedPackage?.price || 0;
    const manualAddonsCost = selectedAddons.reduce((total, addon) => total + (addon.price * addon.quantity), 0);
    return packageCost + manualAddonsCost + extraBalangsCost;
  }, [selectedPackage, selectedAddons, extraBalangsCost]);

  const handlePackageSelect = (packageId: string) => {
    const pkg = packages.find(p => p._id === packageId);
    selectPackage(pkg || null);
  };

  // --- THE BOOKING LOGIC FUNCTION ---
  const handleProceedToBook = async () => {
    setIsBooking(true);
    setBookingStatus('idle');

    // Prepare the data to be saved
    const orderDetails = {
      package: selectedPackage ? { name: selectedPackage.name, price: selectedPackage.price } : null,
      flavors: selectedFlavors.map(f => ({ name: f.name, quantity: f.quantity })),
      addons: selectedAddons.map(a => ({ name: a.name, price: a.price, quantity: a.quantity })),
      autoAddedExtraBalangs: extraBalangsCount > 0 && extraBalangAddon ? { name: extraBalangAddon.name, quantity: extraBalangsCount, cost: extraBalangsCost } : null,
      totalCost: finalTotalCost,
    };

    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderDetails),
      });

      const result = await response.json();

      if (result.success) {
        setBookingStatus('success');
        // Optionally, you can clear the cart here
        // useCartStore.getState().clearCart(); // You would need to add a clearCart action to your store
      } else {
        throw new Error(result.error || 'Failed to create order.');
      }
    } catch (error) {
      console.error("Booking failed:", error);
      setBookingStatus('error');
    } finally {
      setIsBooking(false);
    }
  };

  const isBookingReady = selectedPackage ? totalFlavorCount >= selectedPackage.flavorLimit : false;

  if (isLoading) return <p className="text-center text-lg p-8">Loading Event Builder...</p>
  
  if (bookingStatus === 'success') {
    return (
        <div className="container mx-auto p-8 text-center">
            <h1 className="text-4xl font-bold text-green-600">Booking Received!</h1>
            <p className="text-lg mt-4">Thank you for your order. We've sent a confirmation to your email and will be in touch shortly.</p>
        </div>
    )
  }

  return (
    <main className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white">Build Your Custom Event Package</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">Create your perfect event! Choose from our tasty balang drinks and fun add-ons.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Section number={1} title="Base Package">
              <RadioGroup value={selectedPackage?._id} onValueChange={handlePackageSelect}>
                  <div className="space-y-4">
                    {packages.map(pkg => (
                      <Label key={pkg._id} htmlFor={pkg._id} className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all has-[:checked]:border-teal-500 has-[:checked]:ring-2 has-[:checked]:ring-teal-500">
                        <RadioGroupItem value={pkg._id} id={pkg._id} className="mt-1"/>
                        <div className="ml-4">
                          <h3 className="font-bold text-lg text-gray-800 dark:text-white">{pkg.name} - ${pkg.price.toFixed(2)}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{pkg.description}</p>
                          <p className="text-xs mt-2 text-gray-500 dark:text-gray-500">{pkg.note}</p>
                        </div>
                      </Label>
                    ))}
                  </div>
                </RadioGroup>
            </Section>
            <Section number={2} title="Your Selected Flavors">
              {selectedPackage && (
                  <div className={`p-4 rounded-md mb-4 border-l-4 ${extraBalangsCount > 0 ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-200' : 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-800 dark:text-blue-200'}`}>
                    <p>Your package includes <strong>{selectedPackage.flavorLimit}</strong> balang(s). You have selected <strong>{totalFlavorCount}</strong>.</p>
                    {extraBalangsCount > 0 && <p className="font-semibold mt-1">Your {extraBalangsCount} extra balang(s) have been automatically added as an add-on.</p>}
                    {totalFlavorCount < selectedPackage.flavorLimit && <p className="font-semibold mt-1">Please ensure you have selected enough flavors.</p>}
                  </div>
                )}
                {selectedFlavors.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedFlavors.map((item) => (
                      <li key={item._id} className="text-lg py-1 flex justify-between bg-gray-100 dark:bg-gray-700/50 p-3 rounded-md">
                        <span>{item.name}</span>
                        <span className="font-bold">x {item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">You haven't selected any flavors yet. Go back to the menu to add some!</p>
                )}
            </Section>
            <Section number={3} title="Select Add-ons">
              <div className="space-y-3">
                {addons.map(addon => (
                  <div key={addon._id} className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <Label htmlFor={addon._id} className="font-semibold text-gray-800 dark:text-white">{addon.name}</Label>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-teal-600 dark:text-teal-400">(+${addon.price.toFixed(2)})</span>
                      <AddonController addon={addon} />
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Event Summary</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-200">Package</h4>
                    {selectedPackage ? <div className="flex justify-between text-sm mt-1"><span>{selectedPackage.name}</span><span>${selectedPackage.price.toFixed(2)}</span></div> : <p className="text-sm text-gray-400 italic">No package selected.</p>}
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-200">Add-ons</h4>
                    {selectedAddons.length > 0 && selectedAddons.map(addon => (
                        <div key={addon._id} className="flex justify-between text-sm mt-1"><span>{addon.name} x{addon.quantity}</span><span>${(addon.price * addon.quantity).toFixed(2)}</span></div>
                    ))}
                    {extraBalangsCount > 0 && extraBalangAddon && (
                        <div className="flex justify-between text-sm mt-1"><span>{extraBalangAddon.name} (Auto)</span><span>x{extraBalangsCount} (+${extraBalangsCost.toFixed(2)})</span></div>
                    )}
                    {selectedAddons.length === 0 && extraBalangsCount === 0 && <p className="text-sm text-gray-400 italic">No add-ons selected.</p>}
                  </div>
                  {extraBalangsCount > 0 && (
                    <div className="text-xs text-center p-2 bg-yellow-100 text-yellow-800 rounded-md">
                      ** Flavors for extra balangs can be specified in the notes at checkout. **
                    </div>
                  )}
                  <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <div className="flex justify-between items-baseline"><span className="text-lg font-bold">Total:</span><span className="text-2xl font-extrabold text-teal-600">${finalTotalCost.toFixed(2)}</span></div>
                  </div>
                </div>
                <Button 
                    onClick={handleProceedToBook}
                    disabled={!isBookingReady || isBooking}
                    className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition-all disabled:bg-gray-400"
                >
                  {isBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Proceed to Book'}
                </Button>
                {bookingStatus === 'error' && <p className="text-red-500 text-sm text-center mt-4">Something went wrong. Please try again.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
