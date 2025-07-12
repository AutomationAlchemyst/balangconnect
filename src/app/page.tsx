// Path: src/app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { client } from '@/lib/sanity-client'
import { DrinkCard } from '@/components/ui/drink-card'
import { useCartStore } from '@/store/cartStore'
import { ShoppingCart } from 'lucide-react'

type Drink = {
  _id: string;
  name: string;
  pricePerBalang: number;
  image: any;
  category: string;
  tags: string[];
};

function CartButton() {
    const totalItems = useCartStore((state) => 
        state.items.reduce((total, item) => total + item.quantity, 0)
    );

    if (totalItems === 0) return null;

    return (
        <div className="fixed bottom-8 right-8 z-50">
            <Link href="/build-event">
                <button className="bg-brand-teal text-white rounded-full h-16 w-16 flex items-center justify-center shadow-lg hover:bg-opacity-90 transition-all">
                    <ShoppingCart size={24} />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center border-2 border-white">
                        {totalItems}
                    </span>
                </button>
            </Link>
        </div>
    )
}

function groupDrinksByCategory(drinks: Drink[]) {
  return drinks.reduce((acc, drink) => {
    const category = drink.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(drink);
    return acc;
  }, {} as Record<string, Drink[]>);
}

export default function HomePage() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const query = `*[_type == "drink"] | order(name asc){
      _id,
      name,
      pricePerBalang,
      image,
      category,
      tags
    }`;

    async function getDrinks() {
      try {
        const fetchedDrinks: Drink[] = await client.fetch(query);
        setDrinks(fetchedDrinks);
      } catch (error) {
        console.error("Failed to fetch drinks:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    getDrinks();
  }, []);

  const groupedDrinks = groupDrinksByCategory(drinks);

  return (
    <>
      <main className="bg-gradient-to-b from-neutral-light to-gray-200 dark:from-neutral-dark dark:to-gray-900 min-h-screen text-text-light dark:text-text-dark">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="text-center mb-16">
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">Our Delicious Balang Flavors</h1>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
                  Select your favorite flavors below. Once you're ready, proceed to build your event package.
              </p>
          </div>
          
          {isLoading ? (
            <p className="text-center text-lg">Loading menu...</p>
          ) : (
            <div className="space-y-16">
              {Object.entries(groupedDrinks).map(([category, drinksInCategory]) => (
                <section key={category}>
                  <h2 className="text-3xl font-bold mb-6 border-b-2 border-brand-gold pb-3">
                    {category}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {drinksInCategory.map((drink) => (
                      <DrinkCard key={drink._id} drink={drink} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
      <CartButton />
    </>
  );
}
