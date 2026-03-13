# @Composable 函数 ⚡

> 摘要：理解 `@Composable` 是进入 Jetpack Compose 声明式 UI 编程模型的第一步。
>
> 适用版本：Jetpack Compose 常见版本，具体以官方 API 为准
>
> 更新时间：2026-03-13
>
> 标签：基础，入门，Composable，重组

## 核心概念

Composable 函数是 Compose UI 的基本构建单元。带有 `@Composable` 注解的函数不会直接绘制视图，而是描述界面应该是什么样子，随后由 Compose Runtime 决定如何组合、更新和重组界面。

## 关键 API / 机制

- `@Composable`：声明一个函数可以参与 Compose 的组合过程。
- 重组（Recomposition）：当依赖状态变化时，Compose 会重新执行相关 Composable。
- 组合（Composition）：Compose 根据函数树构建界面描述。

## 示例代码

```kotlin
@Composable
fun Greeting(name: String) {
    Text(
        text = "Hello, $name!",
        style = MaterialTheme.typography.h1
    )
}
```

## 常见误区

- 误以为 Composable 函数就是传统 View：实际上它更像是 UI 描述函数，而不是持有界面实例的对象。
- 误以为所有 Composable 都会完整重绘：Compose 会根据状态读取范围尽量缩小重组影响面。
- 把业务副作用直接塞进 Composable 主体：副作用应优先交给 `LaunchedEffect` 等机制处理。

## 最佳实践

- 保持 Composable 函数小而清晰，聚焦单一职责。
- 把状态向上提升，避免在深层组件里混杂太多业务逻辑。
- 使用参数驱动 UI，而不是在函数内部硬编码界面行为。

## 关联主题

- [remember / mutableStateOf](./state.md)
- [可组合项生命周期与重组](./lifecycle.md)
- [rememberCoroutineScope & LaunchedEffect](./coroutine-scope.md)
