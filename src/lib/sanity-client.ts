// Path: src/lib/sanity-client.ts

import { createClient } from 'next-sanity'

// These are the environment variables we set up in the .env.local file
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!
const apiVersion = '2023-05-03' // Use a stable API version

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // `false` if you want to ensure fresh data
})
