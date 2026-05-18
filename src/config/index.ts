/* eslint-disable node/prefer-global/process */
/**
 * 配置管理
 *
 * 使用 convict 进行配置管理，支持环境变量、配置文件和默认值
 * 支持 JSON、YAML、TOML 格式的配置文件
 */

import convict from 'convict'
import * as yaml from 'js-yaml'
import * as toml from 'toml'

import { configSchema } from './schema'

// 添加自定义文件解析器
convict.addParser({ extension: 'toml', parse: toml.parse })
convict.addParser({ extension: ['yml', 'yaml'], parse: yaml.load })

// 创建配置实例
const configInstance = convict(configSchema, {
    env: {
        NODE_ENV: process.env.NODE_ENV,
    },
})

// 获取当前环境
const nodeEnv = configInstance.get('server.nodeEnv')

// 按优先级加载配置文件
const configFiles = [
    `./config/${nodeEnv}.json`,
    `./config/${nodeEnv}.yaml`,
    `./config/${nodeEnv}.yml`,
    `./config/${nodeEnv}.toml`,
    './config/default.json',
    './config/default.yaml',
    './config/default.yml',
    './config/default.toml',
]

// 尝试加载配置文件
let configLoaded = false
for (const configFile of configFiles) {
    try {
        configInstance.loadFile(configFile)
        console.log(`✅ 成功加载配置文件: ${configFile}`)
        configLoaded = true
        break
    }
    catch {
        // 文件不存在或格式错误，继续尝试下一个
        continue
    }
}

if (!configLoaded) {
    console.log('📋 未找到配置文件，使用环境变量和默认值')
}

// 验证配置
try {
    configInstance.validate({ allowed: 'strict' })
}
catch (error) {
    console.error('❌ 配置验证失败:', error)
    process.exit(1)
}

console.log('✅ 配置验证成功')

// 导出类型化的配置对象
export const config = configInstance.getProperties()

// 打印配置加载结果
console.log('📦 配置加载完成：\n', JSON.parse(configInstance.toString()))
