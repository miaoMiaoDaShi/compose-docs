# remember / mutableStateOf 🔄

> 摘要：`remember` 和 `mutableStateOf` 是 Compose 中最基础的本地状态管理组合。
>
> 适用版本：Jetpack Compose 常见版本，具体以官方 API 为准
>
> 更新时间：2026-03-13
>
> 标签：状态，remember，mutableStateOf，重组

## 核心概念

`remember` 用于在当前组合位置缓存值，避免每次重组都重新创建；`mutableStateOf` 用于创建可观察状态，一旦值变化，读取它的 Composable 会自动进入重组。

## 关键 API / 机制

- `remember { ... }`：在同一组合位置缓存对象或计算结果。
- `mutableStateOf(value)`：创建可观察的 `State<T>`。
- `by` 委托：简化 `.value` 的读写。
- 状态提升：当状态需要跨多个组件共享时，应提升到更高层管理。

## 示例代码

```kotlin
@Composable
fun Counter() {
    var count by remember { mutableStateOf(0) }

    Button(onClick = { count++ }) {
        Text("Count: $count")
    }
}
```

## 常见误区

- 把 `remember` 当作持久化方案：它只能跨重组保留值，不能跨配置变更或进程重建。
- 在列表或条件分支中滥用本地状态：组合位置变化时，状态可能错位或丢失。
- 把大量共享状态都放在组件内部：会让复用和测试变得困难。

## 最佳实践

- 组件内部短生命周期状态优先使用 `remember`。
- 需要跨配置变化时改用 `rememberSaveable` 或 ViewModel。
- 尽量让状态和 UI 读取范围保持接近，减少无谓重组。

## 关联主题

- [StateFlow / collectAsState](./stateflow.md)
- [derivedStateOf 性能优化](./derived-state.md)
- [可组合项生命周期与重组](./lifecycle.md)
