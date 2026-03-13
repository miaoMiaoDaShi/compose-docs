# Modifier 修饰符 🔧

> 摘要：`Modifier` 是 Compose 中统一描述布局、绘制、交互和语义的核心机制。
>
> 适用版本：Jetpack Compose 常见版本，具体以官方 API 为准
>
> 更新时间：2026-03-13
>
> 标签：Modifier，布局，交互，样式

## 核心概念

在 Compose 中，组件本身负责描述“是什么”，`Modifier` 负责描述“如何呈现、如何布局、如何交互”。多个修饰符可以链式拼接，而且顺序会影响最终结果。

## 关键 API / 机制

- `padding()`：为元素提供内边距。
- `background()`：设置背景绘制。
- `fillMaxWidth()` / `size()`：控制尺寸与占位方式。
- `clickable()`：为元素添加点击交互。

## 示例代码

```kotlin
Text(
    text = "你好",
    modifier = Modifier
        .padding(16.dp)
        .background(Color.Blue)
        .fillMaxWidth()
        .clickable { }
)
```

## 常见误区

- 误以为修饰符顺序无关：先 `padding` 再 `background` 与先 `background` 再 `padding` 效果不同。
- 把不存在的 `margin()` 当作原生 API：Compose 一般通过外层布局或 `padding()` 模拟外间距。
- 在组件内部硬编码修饰符，不给调用方传入 `modifier` 参数：会削弱复用性。

## 最佳实践

- 自定义组件时优先暴露 `modifier: Modifier = Modifier` 参数。
- 把交互、布局、绘制顺序写清楚，避免链式调用失控。
- 常见可复用修饰逻辑可以提炼成扩展函数。

## 关联主题

- [布局组件 Box / Row / Column](./box-row-column.md)
- [Modifier.Node 高性能自定义组件](./modifier-node.md)
- [Material 3 自适应布局](./material3.md)
