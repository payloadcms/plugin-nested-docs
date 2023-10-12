import path from 'path'
import { buildConfig } from 'payload/config'

// import nestedPages from '../../dist';
import nestedPages from '../../src' // eslint-disable-line import/no-relative-packages
import { Pages } from './collections/Pages'
import { Users } from './collections/Users'
import { slateEditor } from '@payloadcms/richtext-slate'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { webpackBundler } from '@payloadcms/bundler-webpack'

export default buildConfig({
  serverURL: 'http://localhost:3000',
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
  }),
  editor: slateEditor({}),
  admin: {
    bundler: webpackBundler(),
    user: Users.slug,
    webpack: config => {
      const newConfig = {
        ...config,
        resolve: {
          ...config.resolve,
          alias: {
            ...config.resolve.alias,
            react: path.join(__dirname, '../node_modules/react'),
            'react-dom': path.join(__dirname, '../node_modules/react-dom'),
            payload: path.join(__dirname, '../node_modules/payload'),
          },
        },
      }

      return newConfig
    },
  },
  collections: [Users, Pages],
  localization: {
    locales: ['en', 'es', 'de'],
    defaultLocale: 'en',
    fallback: true,
  },
  plugins: [
    nestedPages({
      collections: ['pages'],
      generateLabel: (_, doc) => doc.title as string,
      generateURL: docs => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
    }),
  ],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
})
