import type { Config } from 'payload/config'
import type { ValueWithRelation } from 'payload/dist/fields/config/types'
import type { CollectionConfig } from 'payload/types'

import type { PluginConfig } from '../types'
import isValueWithRelation from './isValueWithRelation'

// Return the collection config of selected parent instead of default collection (previous behavior)
const retrieveParentCollection = (
  config: Config,
  pluginConfig: PluginConfig,
  collection: CollectionConfig,
  parent: string | ValueWithRelation | null,
): CollectionConfig | undefined => {
  let parentCollection

  // Parent target an array of collections
  if (typeof parent === 'object' && isValueWithRelation(parent)) {
    parentCollection =
      config.collections?.find(item => item.slug === parent.relationTo) || collection
  }

  // Parent target a single collection
  if (typeof parent === 'string') {
    // retrieve parent field in collection config
    const parentField = collection.fields.find(
      field =>
        field?.type === 'relationship' &&
        field?.name === (pluginConfig.parentFieldSlug || 'parent'),
    )

    // use collection related within createParentField
    if (parentField?.type === 'relationship' && typeof parentField?.relationTo === 'string') {
      parentCollection = config.collections?.find(item => item.slug === parentField?.relationTo)
    }
  }

  return parentCollection
}

export default retrieveParentCollection
