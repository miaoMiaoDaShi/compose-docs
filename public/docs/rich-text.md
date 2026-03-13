# 富文本与 AnnotatedString 📝

> 摘要：这篇文档聚焦 Compose 中的富文本能力，适合处理局部高亮、混合样式与可读性增强场景。
>
> 适用版本：Jetpack Compose 常见版本，具体以官方 API 为准
>
> 更新时间：2026-03-13
>
> 标签：文本，富文本，AnnotatedString，排版

## 核心概念

Compose 不只支持普通文本，也支持对同一段文字中的不同片段施加不同样式。富文本常用于标题强调、局部高亮、关键词标记和带语义层次的说明文字。

## 关键 API / 机制

- `buildAnnotatedString`：构建带局部样式的文本内容。
- `SpanStyle`：定义文本片段样式。
- `withStyle { ... }`：为某一段文本应用局部样式。
- `AnnotatedString`：Compose 中的富文本内容模型。

## 示例代码

```kotlin
Text(
    buildAnnotatedString {
        append("这是 ")
        withStyle(SpanStyle(fontWeight = FontWeight.Bold)) { append("粗体") }
        append(" 和 ")
        withStyle(SpanStyle(color = Color.Red)) { append("红色") }
    }
)
```

## 常见误区

- 为简单文本也引入复杂富文本构建，增加维护成本。
- 把所有样式变化都写在一个巨大字符串构建块里，导致可读性变差。
- 只关心视觉效果，不处理文本语义和无障碍。

## 最佳实践

- 富文本优先用在真正需要局部强调和语义区分的地方。
- 样式片段较多时，拆出辅助函数或构建器提升可维护性。
- 同时关注排版、性能和可读性，而不是只追求视觉复杂度。

## 关联主题

- [Canvas 绘图与自定义图形](./canvas.md)
- [Lazy Grid 网格布局](./lazy-grid.md)
- [Material 3 自适应布局](./material3.md)
