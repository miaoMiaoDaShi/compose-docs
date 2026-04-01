# LazyColumn / LazyRow 📋

> 摘要：`LazyColumn` 和 `LazyRow` 是 Compose 中处理长列表与横向滚动内容的核心组件。
>
> 适用版本：Jetpack Compose 常见版本，具体以官方 API 为准
>
> 更新时间：2026-04-01
>
> 标签：列表，LazyColumn，LazyRow，性能，CacheWindow

## 核心概念

与一次性渲染全部子节点的 `Column`、`Row` 不同，Lazy 布局只组合当前可见区域附近的内容，因此更适合承载长列表、图片流和卡片流等高数量项场景。

## 关键 API / 机制

- `LazyColumn`：垂直方向惰性列表。
- `LazyRow`：水平方向惰性列表。
- `items()` / `itemsIndexed()`：批量渲染列表数据。
- `key`：提供稳定身份，帮助 Compose 正确跟踪列表项。

## CacheWindow 与 Pausable Composition 预取（Compose December 2025 / 1.10+）

Compose 1.10 引入了 `CacheWindow` API，配合 `PausableComposition`（Kotlin 2.3.20+ 默认启用），大幅提升滚动流畅度。

**工作原理：**

传统 LazyColumn 在滚动时，新项的组合（Composition）在同一帧内完成，导致快速滚动时主线程被阻塞，出现卡顿。`CacheWindow` 在可见范围**之外**预先组合更多内容，这些预组合工作被 `PausableComposition` 分帧执行，不阻塞主线程。

```kotlin
LazyColumn(
    // 预取窗口：额外渲染可见范围上下各 3 个 item
    cacheWindow = CacheWindow(
        beforeCount = 3,
        afterCount = 3
    )
) {
    items(list) { item ->
        ListItem(item)
    }
}
```

**性能影响：**
- 快速滚动时，新项出现更早（因为已经预组合好）
- 主线程帧时间更稳定，减少卡顿
- 内存占用略微上升（多缓存了额外项）
- 低端设备受益最明显

**`Modifier.skipToLookaheadPosition()`：**

在共享元素过渡动画中，快速滚动时 Compose 会执行 Lookahead Pass（预测布局）来计算元素动画目标位置。`skipToLookaheadPosition` Modifier 允许在共享元素动画期间**跳过中间的滚动位置**，直接定位到目标位置：

```kotlin
LazyColumn {
    items(list, key = { it.id }) { item ->
        SharedBounds(
            sharedContentState = rememberSharedContentState(key = "item-${item.id}"),
            modifier = Modifier.skipToLookaheadPosition()
        ) {
            ListItem(item)
        }
    }
}
```

**使用场景：**
- 列表→详情页共享元素动画：滚动到目标 item 后再执行过渡，而不是跟着滚动位置走
- 配合 `CacheWindow` 使用：预取确保跳转到目标位置时内容已就绪

## 示例代码

```kotlin
// 垂直列表
LazyColumn {
    items(itemsList) { item ->
        ListItem(title = item.name)
    }
}

// 水平列表
LazyRow {
    items(imagesList) { image ->
        Image(painter = image)
    }
}

// 带 key 的优化
LazyColumn {
    items(itemsList, key = { it.id }) { item ->
        ListItem(title = item.name)
    }
}

// 带 CacheWindow 的预取优化（Compose 1.10+）
LazyColumn(
    cacheWindow = CacheWindow(beforeCount = 2, afterCount = 4)
) {
    items(list, key = { it.id }) { item ->
        ListItem(item)
    }
}
```

## 常见误区

- 在长列表场景继续使用普通 `Column`：很容易带来性能浪费。
- 不提供稳定 `key`：排序、插入和删除时可能出现错位重组。
- 在列表项里做过重计算：会导致滚动期间卡顿。
- 以为 `CacheWindow` 参数越大越好：`beforeCount`/`afterCount` 过大会增加内存压力，需要权衡

## 最佳实践

- 列表项存在插入、删除或重排时优先提供稳定 `key`。
- 把复杂计算提前到数据层或 `remember` 中完成。
- 结合 `LazyListState` 处理滚动监听、回顶按钮和懒加载触发。
- 复杂列表建议开启 `CacheWindow`，配合 Kotlin 2.3.20+ 获得完整 Pausable Composition 优化
- 共享元素过渡场景使用 `skipToLookaheadPosition` 提升动画流畅度

## 关联主题

- [性能优化指南](./performance-guide.md)
- [derivedStateOf 性能优化](./derived-state.md)
- [布局组件 Box / Row / Column](./box-row-column.md)
- [Kotlin 2.x & Compose 性能优化](./kotlin2.md) — Pausable Composition 详情
- [共用元素过渡动画](./shared-element.md) — skipToLookaheadPosition 配合使用
