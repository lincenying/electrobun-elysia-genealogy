import lincy from '@lincy/eslint-config'

const config = lincy({
    vue: false,
    pnpm: false,
    overrides: {
        ignores: ['**/assets', '**/static'],
        node: {
            'node/prefer-global/process': 'off',
        },
    },
})

module.exports = config
