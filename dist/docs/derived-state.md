# derivedStateOf 性能优化 🎯

> 摘要：`derivedStateOf` 适合把高频状态变化压缩成更稳定的派生结果，减少无谓重组。
>
> 适用版本：Jetpack Compose 常见版本，具体以官方 API 为准
>
> 更新时间：2026-03-13
>
> 标签：性能，derivedStateOf，状态，重组

## 核心概念

当某个 UI 结果依赖多个状态，而且这些状态变化频率不同或计算成本较高时，可以通过 `derivedStateOf` 缓存派生结果，只在真正需要时重新计算。

## 关键 API / 机制

- `derivedStateOf { ... }`：创建派生状态。
- `remember(...) { ... }`：控制派生状态对象的生命周期。
- 派生状态：适用于“状态变化很多，但真正影响 UI 的结果变化较少”的场景。

## 示例代码

```kotlin
@Composable
fun TodoList(todos: List<Todo>) {
    val completedTodos by remember(todos) {
        derivedStateOf { todos.filter { it.isCompleted } }
    }

    val isAllCompleted by remember(todos) {
        derivedStateOf {
            todos.isNotEmpty() && todos.all { it.isCompleted }
        }
    }

    LazyColumn {
        items(todos) { todo ->
            TodoItem(todo = todo)
        }
    }
}
```

## 常见误区

- 把所有计算都包进 `derivedStateOf`：会增加心智负担，简单表达式没必要过度优化。
- 忘记和 `remember` 配合：会反复创建派生状态对象。
- 在内部执行真正昂贵的数据处理：性能不一定更好。

## 最佳实践

- 只在派生结果有明确复用价值时使用 `derivedStateOf`。
- 更适合过滤、排序结果、滚动阈值判断等派生 UI 状态。
- 优化前先确认瓶颈，避免提前复杂化代码。

## 关联主题

- [remember / mutableStateOf](./state.md)
- [LazyColumn / LazyRow](./lazy-list.md)
- [性能优化指南](./performance-guide.md)
