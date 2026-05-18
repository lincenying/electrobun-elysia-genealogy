import type { ErrorFunctionParameter } from '@sinclair/typebox/errors'
import { Kind } from '@sinclair/typebox'
import { ValueErrorType } from '@sinclair/typebox/errors'
import { t } from 'elysia'

export function setErrorFunction(error: ErrorFunctionParameter) {
    const formattedPath = error.path === '' ? 'value' : error.path
    switch (error.errorType) {
        case ValueErrorType.ArrayContains:
            return `${formattedPath} 必须包含至少一个匹配值`
        case ValueErrorType.ArrayMaxContains:
            return `${formattedPath} 包含的匹配值不能超过 ${error.schema.maxContains} 个`
        case ValueErrorType.ArrayMinContains:
            return `${formattedPath} 包含的匹配值至少需要 ${error.schema.minContains} 个`
        case ValueErrorType.ArrayMaxItems:
            return `${formattedPath} 的长度必须小于或等于 ${error.schema.maxItems}`
        case ValueErrorType.ArrayMinItems:
            return `${formattedPath} 的长度必须大于或等于 ${error.schema.minItems}`
        case ValueErrorType.ArrayUniqueItems:
            return `${formattedPath} 的元素必须唯一`
        case ValueErrorType.Array:
            return `${formattedPath} 必须是数组`
        case ValueErrorType.AsyncIterator:
            return `${formattedPath} 必须是 AsyncIterator`
        case ValueErrorType.BigIntExclusiveMaximum:
            return `${formattedPath} 的值必须小于 ${error.schema.exclusiveMaximum}`
        case ValueErrorType.BigIntExclusiveMinimum:
            return `${formattedPath} 的值必须大于 ${error.schema.exclusiveMinimum}`
        case ValueErrorType.BigIntMaximum:
            return `${formattedPath} 的值必须小于或等于 ${error.schema.maximum}`
        case ValueErrorType.BigIntMinimum:
            return `${formattedPath} 的值必须大于或等于 ${error.schema.minimum}`
        case ValueErrorType.BigIntMultipleOf:
            return `${formattedPath} 的值必须是 ${error.schema.multipleOf} 的倍数`
        case ValueErrorType.BigInt:
            return `${formattedPath} 必须是 bigint 类型`
        case ValueErrorType.Boolean:
            return `${formattedPath} 必须是布尔值`
        case ValueErrorType.DateExclusiveMinimumTimestamp:
            return `${formattedPath} 日期必须大于 ${error.schema.exclusiveMinimumTimestamp}`
        case ValueErrorType.DateExclusiveMaximumTimestamp:
            return `${formattedPath} 日期必须小于 ${error.schema.exclusiveMaximumTimestamp}`
        case ValueErrorType.DateMinimumTimestamp:
            return `${formattedPath} 日期时间戳必须大于或等于 ${error.schema.minimumTimestamp}`
        case ValueErrorType.DateMaximumTimestamp:
            return `${formattedPath} 日期时间戳必须小于或等于 ${error.schema.maximumTimestamp}`
        case ValueErrorType.DateMultipleOfTimestamp:
            return `${formattedPath} 日期时间戳必须是 ${error.schema.multipleOfTimestamp} 的倍数`
        case ValueErrorType.Date:
            return `${formattedPath} 必须是 Date 对象`
        case ValueErrorType.Function:
            return `${formattedPath} 必须是函数`
        case ValueErrorType.IntegerExclusiveMaximum:
            return `${formattedPath} 必须小于 ${error.schema.exclusiveMaximum}`
        case ValueErrorType.IntegerExclusiveMinimum:
            return `${formattedPath} 必须大于 ${error.schema.exclusiveMinimum}`
        case ValueErrorType.IntegerMaximum:
            return `${formattedPath} 必须小于或等于 ${error.schema.maximum}`
        case ValueErrorType.IntegerMinimum:
            return `${formattedPath} 必须大于或等于 ${error.schema.minimum}`
        case ValueErrorType.IntegerMultipleOf:
            return `${formattedPath} 必须是 ${error.schema.multipleOf} 的倍数`
        case ValueErrorType.Integer:
            return `${formattedPath} 必须是整数`
        case ValueErrorType.IntersectUnevaluatedProperties:
            return `${formattedPath} 属性必须存在`
        case ValueErrorType.Intersect:
            return `${formattedPath} 所有操作数必须匹配`
        case ValueErrorType.Iterator:
            return `${formattedPath} 必须是 Iterator`
        case ValueErrorType.Literal:
            return `${formattedPath} 必须是 ${typeof error.schema.const === 'string' ? `'${error.schema.const}'` : error.schema.const}`
        case ValueErrorType.Never:
            return `${formattedPath} 为 never 类型`
        case ValueErrorType.Not:
            return `${formattedPath} 不能为 ${JSON.stringify(error.schema)}`
        case ValueErrorType.Null:
            return `${formattedPath} 必须是 null`
        case ValueErrorType.NumberExclusiveMaximum:
            return `${formattedPath} 必须小于 ${error.schema.exclusiveMaximum}`
        case ValueErrorType.NumberExclusiveMinimum:
            return `${formattedPath} 必须大于 ${error.schema.exclusiveMinimum}`
        case ValueErrorType.NumberMaximum:
            return `${formattedPath} 必须小于或等于 ${error.schema.maximum}`
        case ValueErrorType.NumberMinimum:
            return `${formattedPath} 必须大于或等于 ${error.schema.minimum}`
        case ValueErrorType.NumberMultipleOf:
            return `${formattedPath} 必须是 ${error.schema.multipleOf} 的倍数`
        case ValueErrorType.Number:
            return `${formattedPath} 必须是数字`
        case ValueErrorType.Object:
            return `${formattedPath} 必须是对象`
        case ValueErrorType.ObjectAdditionalProperties:
            return `${formattedPath} 包含了不允许的属性`
        case ValueErrorType.ObjectMaxProperties:
            return `${formattedPath} 的属性数量不能超过 ${error.schema.maxProperties}`
        case ValueErrorType.ObjectMinProperties:
            return `${formattedPath} 的属性数量至少为 ${error.schema.minProperties}`
        case ValueErrorType.ObjectRequiredProperty:
            return `${formattedPath} 缺少必需的属性`
        case ValueErrorType.Promise:
            return `${formattedPath} 必须是 Promise`
        case ValueErrorType.RegExp:
            return `${formattedPath} 必须匹配正则表达式`
        case ValueErrorType.StringFormatUnknown:
            return `${formattedPath} 使用了未知的格式 '${error.schema.format}'`
        case ValueErrorType.StringFormat:
            return `${formattedPath} 必须匹配 '${error.schema.format}' 格式`
        case ValueErrorType.StringMaxLength:
            return `${formattedPath} 的长度必须小于或等于 ${error.schema.maxLength}`
        case ValueErrorType.StringMinLength:
            return `${formattedPath} 的长度必须大于或等于 ${error.schema.minLength}`
        case ValueErrorType.StringPattern:
            return `${formattedPath} 字符串必须匹配 '${error.schema.pattern}'`
        case ValueErrorType.String:
            return `${formattedPath} 必须是字符串`
        case ValueErrorType.Symbol:
            return `${formattedPath} 必须是 symbol`
        case ValueErrorType.TupleLength:
            return `${formattedPath} 必须有 ${error.schema.maxItems || 0} 个元素`
        case ValueErrorType.Tuple:
            return `${formattedPath} 必须是元组`
        case ValueErrorType.Uint8ArrayMaxByteLength:
            return `${formattedPath} 的字节长度必须小于或等于 ${error.schema.maxByteLength}`
        case ValueErrorType.Uint8ArrayMinByteLength:
            return `${formattedPath} 的字节长度必须大于或等于 ${error.schema.minByteLength}`
        case ValueErrorType.Uint8Array:
            return `${formattedPath} 必须是 Uint8Array`
        case ValueErrorType.Undefined:
            return `${formattedPath} 必须是 undefined`
        case ValueErrorType.Union:
            return `${formattedPath} 必须匹配联合类型中的一个`
        case ValueErrorType.Void:
            return `${formattedPath} 必须是 void`
        case ValueErrorType.Kind:
            return `期望的类型是 '${error.schema[Kind]}'`
        default:
            return '未知错误类型'
    }
}

// 辅助类型：提取 builder 的参数类型
type OptionsOf<F> = F extends (options: infer O) => any ? O : never

// 创建通用验证函数
function createChecker<F extends (options: any) => any>(
    builder: F,
    _defaultPath: string, // 保留参数以匹配原始调用，但实际未使用
): (str: string, property?: OptionsOf<F>) => ReturnType<F> {
    return (str, property) => {
        const options = {
            ...property,
            error(context: any) {
                if (context.errors?.length) {
                    return context.errors.map((e: any) =>
                        setErrorFunction({
                            errorType: e.type,
                            path: str,
                            schema: e.schema,
                            value: e.value,
                            errors: [],
                        }),
                    )
                }
            },
        }
        // 类型断言：我们的 error 回调与验证库期望的 error 类型兼容
        return builder(options as OptionsOf<F>)
    }
}

export const tt = {
    Any: createChecker(t.Any, 'any'),
    Array: createChecker(t.Array, 'array'),
    ArrayBuffer: createChecker(t.ArrayBuffer, 'array-buffer'),
    Boolean: createChecker(t.Boolean, 'boolean'),
    Date: createChecker(t.Date, 'date'),
    Enum: createChecker(t.Enum, 'enum'),
    Form: createChecker(t.Files, 'form'),
    File: createChecker(t.File, 'file'),
    Files: createChecker(t.Files, 'files'),
    Integer: createChecker(t.Integer, 'integer'),
    Never: createChecker(t.Never, 'never'),
    Null: createChecker(t.Null, 'null'),
    Number: createChecker(t.Number, 'number'),
    Numeric: createChecker(t.Number, 'numeric'),
    NumericEnum: createChecker(t.Number, 'numeric-enum'),
    String: createChecker(t.String, 'string'),
    Void: createChecker(t.Void, 'void'),
    Uint8Array: createChecker(t.Uint8Array, 'uint8array'),
    Unknown: createChecker(t.Unknown, 'unknown'),
    Undefined: createChecker(t.Undefined, 'undefined'),
}
