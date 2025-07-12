// Path: sanity1/schemas/addon.ts
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'addon',
  title: 'Add-on',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Add-on Name',
      type: 'string',
      description: 'e.g., Additional 1 x 23L Balang',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: (Rule) => Rule.required().positive(),
    }),
    // --- THIS IS THE NEW FIELD ---
    defineField({
        name: 'hasQuantity',
        title: 'Has Quantity',
        type: 'boolean',
        description: 'Turn this ON if the user can select more than one of this add-on (e.g., Table Rental). Leave it OFF for simple toggles (e.g., Cups Upgrade).',
        initialValue: false,
    })
  ],
})