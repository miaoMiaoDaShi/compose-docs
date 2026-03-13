# 性能优化指南 💨

> 摘要：这篇文档整理 Compose 中最常见的性能优化抓手，帮助你优先处理真正有效的瓶颈。
>
> 适用版本：Jetpack Compose 常见版本，具体以官方 API 为准
>
> 更新时间：2026-03-13
>
> 标签：性能，重组，Lazy，优化

## 核心概念

Compose 性能优化的核心不是盲目减少代码，而是减少无意义重组、避免高频场景里的重计算，并让滚动、测量和状态读取范围尽量稳定。

## 关键 API / 机制

- `remember`：缓存昂贵计算结果。
- `LazyColumn`：在长列表中减少一次性组合开销。
- `derivedStateOf`：压缩高频状态变化带来的重组影响。
- 基准配置文件与 R8：更多偏构建与发布侧的性能优化手段。

## 示例代码

```kotlin
@Composable
fun MyScreen() {
    val data = remember(key) {
        expensiveCalculation()
    }
}

LazyColumn {
    items(items, key = { it.id }) { item -> }
}

val showButton by remember {
    derivedStateOf { listState.firstVisibleItemIndex > 0 }
}
```

## 常见误区

- 没有定位瓶颈就过早优化：可能增加复杂度却没有收益。
- 把所有状态都往页面根部集中读取：会扩大重组范围。
- 长列表不提供稳定 `key`：滚动体验和状态稳定性都会受影响。

## 最佳实践

- 先用可观察指标定位热点，再决定是否优化。
- 高成本计算尽量移出组合热路径。
- 长列表、动画、高频滚动场景优先关注状态读取范围和列表项稳定性。

## 关联主题

- [LazyColumn / LazyRow](./lazy-list.md)
- [derivedStateOf 性能优化](./derived-state.md)
- [Kotlin 2.0 Strong Skipping & Pausable Composition](./kotlin2.md)
