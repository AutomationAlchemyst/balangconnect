// Path: src/components/ui/drink-card.tsx
'use client'

import Image from 'next/image'
import imageUrlBuilder from '@sanity/image-url'
import { client } from '@/lib/sanity-client'
import { Button } from './button'
import { PlusCircle, Minus, Plus } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'

const builder = imageUrlBuilder(client)
function urlFor(source: any) {
  return builder.image(source)
}

const getTagColor = (tagName: string) => {
  const lowerCaseTag = tagName.toLowerCase();
  if (lowerCaseTag.includes('best seller') || lowerCaseTag.includes('most popular')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  if (lowerCaseTag.includes('new')) return 'bg-green-100 text-green-800 border-green-300';
  if (lowerCaseTag.includes('must try')) return 'bg-purple-100 text-purple-800 border-purple-300';
  if (lowerCaseTag.includes('sugar-free')) return 'bg-blue-100 text-blue-800 border-blue-300';
  return 'bg-gray-100 text-gray-800 border-gray-300';
};

type DrinkCardProps = {
  drink: {
    _id: string;
    name: string;
    pricePerBalang: number;
    image: any; 
    category: string;
    tags: string[];
  };
};

export function DrinkCard({ drink }: DrinkCardProps) {
  const { addItem, removeItem, items } = useCartStore();
  const itemInCart = items.find(item => item._id === drink._id);
  const quantity = itemInCart ? itemInCart.quantity : 0;

  const handleAddItem = () => {
    addItem({
      _id: drink._id,
      name: drink.name,
      pricePerBalang: drink.pricePerBalang,
    });
  };

  const handleRemoveItem = () => {
    removeItem(drink._id);
  };

  return (
    <div className="group bg-neutral-light dark:bg-neutral-dark rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="relative h-52 w-full overflow-hidden">
        {drink.image ? (
          <Image src={urlFor(drink.image).width(500).height(400).url()} alt={`Image of ${drink.name}`} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="bg-gray-200 dark:bg-gray-700 h-full w-full flex items-center justify-center"><span className="text-gray-500">No Image</span></div>
        )}
      </div>

      <div className="p-5 flex flex-col justify-between flex-grow">
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">{drink.name}</h3>
            <span className="text-lg font-bold text-brand-gold">${drink.pricePerBalang.toFixed(2)}</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{drink.category}</p>
          <div className="flex flex-wrap gap-2 py-2 min-h-[48px]">
            {drink.tags?.map((tag) => (
              <span key={tag} className={`px-3 py-0.5 text-xs font-medium rounded-full border ${getTagColor(tag)}`}>{tag}</span>
            ))}
          </div>
        </div>

        <div className="mt-4">
          {quantity === 0 ? (
            <Button onClick={handleAddItem} className="w-full bg-brand-teal hover:bg-opacity-85 text-white font-semibold flex items-center justify-center gap-2 transition-colors rounded-full">
              <PlusCircle size={16} /> Add to Selection
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-4">
              <Button onClick={handleRemoveItem} size="icon" variant="outline" className="rounded-full h-10 w-10 border-2 border-gray-300 dark:border-gray-600">
                <Minus size={16} />
              </Button>
              <span className="text-xl font-bold w-8 text-center">{quantity}</span>
              <Button onClick={handleAddItem} size="icon" variant="outline" className="rounded-full h-10 w-10 border-2 border-gray-300 dark:border-gray-600">
                <Plus size={16} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
