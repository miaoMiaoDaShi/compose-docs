# 性能优化指南 💨

> 摘要：这篇文档整理 Compose 中最常见的性能优化抓手，帮助你优先处理真正有效的瓶颈。
>
> 适用版本：Jetpack Compose 常见版本，具体以官方 API 为准
>
> 更新时间：2026-04-02
>
> 标签：性能，重组，Lazy，优化

## 核心概念

Compose 性能优化的核心不是盲目减少代码，而是减少无意义重组、避免高频场景里的重计算，并让滚动、测量和状态读取范围尽量稳定。

## 关键 API / 机制

- `remember`：缓存昂贵计算结果。
- `LazyColumn`：在长列表中减少一次性组合开销。
- `derivedStateOf`：压缩高频状态变化带来的重组影响。
- 基准配置文件与 R8：更多偏构建与发布侧的性能优化手段。
- `Modifier.onPlaced` / `Modifier.onVisibilityChanged`：Compose 1.10 起有额外编译优化，减少不必要重组触发（LazyColumn 滚动时回调性能提升约 15%）。
- `Modifier.visible()`（Compose 1.11+）：隐藏元素但保留布局空间，跳过绘制阶段。

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

// onPlaced 回调（Compose 1.10+ 有编译优化）
var boxPosition by remember { mutableStateOf(IntOffset.Zero) }
Box(
    modifier = Modifier
        .onPlaced { coordinates ->
            boxPosition = coordinates.positionInParent().let { IntOffset(it.x.toInt(), it.y.toInt()) }
        }
)

// visible() 跳过绘制但保留布局空间（Compose 1.11+）
var debugOverlay by remember { mutableStateOf(false) }
Box(
    modifier = Modifier.visible(!debugOverlay)  // 不参与绘制，布局空间保留
) {
    Text("This element is hidden but takes up space")
}
```

## Modifier.onPlaced / onVisibilityChanged 优化（Compose 1.10+）

Compose 1.10 对 `Modifier.onPlaced` 和 `Modifier.onVisibilityChanged` 的实现做了额外编译优化，在 `LazyColumn` 滚动场景下回调性能提升约 15%。向后兼容，无需代码变更，但新项目默认受益。

**使用场景：**
- 需要在布局完成后获取精确位置的元素（如自定义动画锚点）
- 拖拽源/投放目标的坐标计算
- 依赖窗口位置的自定义 Tooltip

**注意：** 不要在普通静态 UI 中滥用这两个 Modifier，它们主要面向需要精确位置反馈的高频交互场景。优先考虑状态提升和 `derivedStateOf` 等更轻量的方案。

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
