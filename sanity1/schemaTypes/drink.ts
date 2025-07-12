import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'drink',
  title: 'Drink Flavor',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Drink Name',
      type: 'string',
      description: 'The name of the balang drink (e.g., Lemon Mint Asamboi)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'A unique identifier for the URL, generated from the name.',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'A short, enticing description of the drink.',
    }),
    defineField({
      name: 'pricePerBalang',
      title: 'Price per Balang',
      type: 'number',
      description: 'The price for one balang of this flavor.',
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      description: 'A high-quality photo of the drink.',
      options: {
        hotspot: true, // Allows for better image cropping
      },
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'The main category of the drink.',
      options: {
        list: [
          {title: 'Non-Milk Base', value: 'Non-Milk Base'},
          {title: 'Milk Base', value: 'Milk Base'},
          {title: 'Flower Series', value: 'Flower Series'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      description: 'Add tags like "Best Seller" or "New".',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
      category: 'category',
    },
    prepare(selection) {
      const {title, media, category} = selection
      return {
        title,
        media,
        subtitle: category,
      }
    },
  },
})