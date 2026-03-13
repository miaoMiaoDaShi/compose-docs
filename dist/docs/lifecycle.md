# 可组合项生命周期与重组 🔄

> 摘要：理解组合、重组和退出机制，是写出稳定 Compose UI 的关键基础。
>
> 适用版本：Jetpack Compose 常见版本，具体以官方 API 为准
>
> 更新时间：2026-03-13
>
> 标签：生命周期，重组，key，稳定性

## 核心概念

Composable 不是像传统 View 那样“创建一次长期持有”，而是不断参与组合和重组。理解一个节点何时进入组合、何时被复用、何时退出，对于控制状态位置和避免副作用重复执行非常重要。

## 关键 API / 机制

- 组合进入：节点首次参与界面构建。
- 重组：依赖状态变化时，相关 Composable 会重新执行。
- `key()`：为重复结构中的节点提供稳定身份。
- 稳定性：影响 Compose 是否可以安全跳过某些重组。

## 示例代码

```kotlin
@Composable
fun MoviesScreen(movies: List<Movie>) {
    Column {
        for (movie in movies) {
            key(movie.id) { MovieOverview(movie) }
        }
    }
}
```

## 常见误区

- 把重组理解成“整页重绘”。
- 在循环和条件分支里忽略组合身份，导致状态错位。
- 不理解 key 的作用，只在出现问题后被动补救。

## 最佳实践

- 在列表、分组和动态插入场景中优先保证稳定身份。
- 让状态贴近它真正依赖的组合位置。
- 把生命周期与副作用 API 联合理解，而不是分开记忆。

## 关联主题

- [@Composable 函数](./composable.md)
- [remember / mutableStateOf](./state.md)
- [rememberCoroutineScope & LaunchedEffect](./coroutine-scope.md)
