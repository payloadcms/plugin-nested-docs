import type { Config } from 'payload/config'
import type { ValueWithRelation } from 'payload/dist/fields/config/types'
import type { CollectionConfig } from 'payload/types'

import type { PluginConfig } from '../types'
import isValueWithRelation from './isValueWithRelation'
import retrieveParentCollection from './retrieveParentCollection'

const getParents = async (
  req: any,
  config: Config,
  pluginConfig: PluginConfig,
  collection: CollectionConfig,
  doc: Record<string, unknown>,
  docs: Array<Record<string, unknown>> = [],
): Promise<Array<Record<string, unknown>>> => {
  let retrievedParent
  const parent = doc[pluginConfig?.parentFieldSlug || 'parent'] as string | ValueWithRelation | null
  const retrievedParentCollection =
    retrieveParentCollection(config, pluginConfig, collection, parent) || collection

  if (parent) {
    // If parent target an array of collections, receive parent = {value: id, relationTo: collection}
    if (typeof parent === 'object' && isValueWithRelation(parent)) {
      retrievedParent = await req.payload.findByID({
        req,
        id: parent.value,
        collection: retrievedParentCollection.slug,
        depth: 0,
        disableErrors: true,
      })
    }

    // If not auto-populated, and we have an ID
    if (typeof parent === 'string') {
      retrievedParent = await req.payload.findByID({
        req,
        id: parent,
        collection: retrievedParentCollection.slug,
        depth: 0,
        disableErrors: true,
      })
    }

    // If auto-populated
    if (typeof parent === 'object' && !isValueWithRelation(parent)) {
      retrievedParent = parent
    }

    // Insert collection slug into doc (needed during formatBreadcrumb)
    retrievedParent.collection = retrievedParentCollection.slug

    if (retrievedParent) {
      if (retrievedParent.parent) {
        return getParents(req, config, pluginConfig, retrievedParentCollection, retrievedParent, [
          retrievedParent,
          ...docs,
        ])
      }

      return [retrievedParent, ...docs]
    }
  }

  return docs
}

export default getParents
