import type { RelationshipField } from 'payload/dist/fields/config/types'

const createParentField = (
  // Pass a single collection or an array of collections
  // If no createParentField found in collectionConfig, the default collection is used
  relationTo: string | string[],
  overrides?: Partial<
    RelationshipField & {
      hasMany: false
    }
  >,
): RelationshipField => ({
  name: 'parent',
  relationTo,
  type: 'relationship',
  maxDepth: 1,
  filterOptions: ({ id }) => ({
    id: { not_equals: id },
    'breadcrumbs.doc': { not_in: [id] },
  }),
  admin: {
    position: 'sidebar',
    ...(overrides?.admin || {}),
  },
  ...(overrides || {}),
})

export default createParentField
