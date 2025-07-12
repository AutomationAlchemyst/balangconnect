import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'package',
  title: 'Event Package',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Package Name',
      type: 'string',
      description: 'e.g., Package Option 1',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: 'flavorLimit',
      title: 'Flavor Limit',
      type: 'number',
      description: 'How many balang flavors are included in this package?',
      validation: (Rule) => Rule.required().integer().positive(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'A short description of the package (e.g., Suitable for 30-80 pax...).',
    }),
    defineField({
      name: 'note',
      title: 'Note',
      type: 'string',
      description: 'Any extra notes about what the package includes.',
    }),
  ],
})