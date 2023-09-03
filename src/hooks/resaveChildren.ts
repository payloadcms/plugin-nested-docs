import type { Config } from 'payload/config'
import type { CollectionAfterChangeHook, CollectionConfig } from 'payload/types'

import type { PluginConfig } from '../types'
import populateBreadcrumbs from '../utilities/populateBreadcrumbs'

const resaveChildren =
  (
    config: Config,
    pluginConfig: PluginConfig,
    collection: CollectionConfig,
  ): CollectionAfterChangeHook =>
  ({ req: { payload, locale }, req, doc }) => {
    const resaveChildrenAsync = async (): Promise<void> => {
      // Fetch within all collections present in pluginConfig.collections
      // to find all documents with the current doc as parent
      const promises = pluginConfig.collections?.map(collectionItem => {
        const collectionConfig = config?.collections?.find(item => item.slug === collectionItem)
        const collectionParentField = collectionConfig?.fields?.find(
          field => field.type === 'relationship' && field.name === 'parent',
        )
        // Retrieve collection parent field type
        const parentFilter =
          collectionParentField?.type === 'relationship' &&
          typeof collectionParentField?.relationTo === 'string'
            ? 'parent'
            : 'parent.value'

        return payload.find({
          collection: collectionItem,
          where: {
            [parentFilter]: {
              equals: doc.id,
            },
          },
          depth: 0,
          locale,
        })
      })

      const children = await (await Promise.all(promises)).map(results => results.docs).flat()

      try {
        children.forEach((child: any) => {
          const updateAsDraft =
            typeof collection.versions === 'object' &&
            collection.versions.drafts &&
            child._status !== 'published'

          payload.update({
            id: child.id,
            collection: collection.slug,
            draft: updateAsDraft,
            data: {
              ...child,
              breadcrumbs: populateBreadcrumbs(req, config, pluginConfig, collection, child),
            },
            depth: 0,
            locale,
          })
        })
      } catch (err: unknown) {
        payload.logger.error(
          `Nested Docs plugin has had an error while re-saving a child document.`,
        )
        payload.logger.error(err)
      }
    }

    // Non-blocking
    resaveChildrenAsync()

    return undefined
  }

export default resaveChildren
