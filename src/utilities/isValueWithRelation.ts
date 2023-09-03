import type { ValueWithRelation } from 'payload/dist/fields/config/types'

const isValueWithRelation = (
  parentField: string | ValueWithRelation | null,
): parentField is ValueWithRelation => {
  return typeof parentField === 'object' && typeof parentField?.relationTo === 'string'
}

export default isValueWithRelation
