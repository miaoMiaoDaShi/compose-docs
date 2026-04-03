# Visibility Tracking 可见性追踪 👁️

> 摘要：Compose 1.8/1.9 引入的 `onFirstVisible` 和 `onVisibilityChanged` Modifier 提供了声明式的可见性追踪能力，无需依赖组合效应（Composition Effect）即可检测组件何时进入或离开视口。
>
> 适用版本：Compose 1.8+（April 2025 Release），`onVisibilityChanged` 在 Compose 1.9 中稳定
>
> 更新时间：2026-04-03
>
> 标签：交互，生命周期，可见性，性能，Compose 1.8，LazyColumn

## 摘要

在 Compose 1.9 之前，追踪一个组件是否可见通常借助 `LaunchedEffect` + `LazyListState` 的滚动监听或 `getBoundingBox()`，这种方式不仅代码冗长，还需要手动管理生命周期。新的可见性 API 将这一切封装为声明式的 Modifier，显著降低了实现成本。

## 核心概念

### 两个核心 Modifier

- **`Modifier.onFirstVisible`**：组件首次进入视口时触发回调（仅触发一次，除非配置 `restartOnRescomposition`）
- **`Modifier.onVisibilityChanged`**：组件可见性每次变化（进入/离开视口）时触发，可配置最小可见时长和最小可见比例

这两个 API 解决了"视频自动播放"、"曝光埋点"、"图片懒加载触发"等常见产品需求。

### 为什么要用 Visibility API？

传统方案的痛点：
- `getClipInWindow()` 或 `getWindowInsets()` 需要手动计算像素坐标
- `LazyColumn` 滚动监听只能知道"滚动发生了"，不能知道"某一项是否在视口内"
- 依赖 `LaunchedEffect` + `derivedStateOf` 的方案容易产生副作用管理问题

## 示例代码

### onFirstVisible：首次进入触发

```kotlin
@Composable
fun VideoFeedItem(video: Video) {
    val player = remember { ExoPlayer.Builder(context).build() }

    VideoPlayer(
        player = player,
        url = video.url,
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(16f / 9f)
            .onFirstVisible {
                // 组件首次进入视口时自动播放
                player.play()
            }
    )
}

// LazyColumn 中使用
@Composable
fun VideoFeed(feedData: List<Video>) {
    LazyColumn {
        items(feedData) { video ->
            VideoFeedItem(video = video)
        }
    }
}
```

### onVisibilityChanged：精确控制可见性触发条件

```kotlin
@Composable
fun AnalyticsTrackedCard(item: ContentItem) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .onVisibilityChanged(
                // 至少可见 500ms 才触发（防止快速划过误触）
                minDurationMs = 500,
                // 至少 50% 可见面积才认为"可见"
                minFractionVisible = 0.5f
            ) { visible ->
                // visible = true  进入视口
                // visible = false 离开视口
                analytics.logExposure(
                    itemId = item.id,
                    visible = visible,
                    fraction = it // 当前可见比例
                )
            }
    ) {
        // ...
    }
}
```

### 配合 LazyColumn 的正确用法

**错误做法（旧的）**：用 `LaunchedEffect` 监听滚动状态判断可见性
```kotlin
// ❌ 不推荐：依赖副作用监听，代码复杂且易出错
LazyColumn {
    items(data) { item ->
        LaunchedEffect(item.id) {
            snapshotFlow { lazyListState.firstVisibleItemIndex }
                .collect { /* 计算可见性 */ }
        }
    }
}
```

**正确做法**：用 Visibility API
```kotlin
// ✅ 推荐：声明式 API，职责清晰
LazyColumn {
    items(data) { item ->
        AnalyticsCard(
            item = item,
            modifier = Modifier.onVisibilityChanged(
                minDurationMs = 300,
                minFractionVisible = 0.3f
            ) { visible ->
                if (visible) trackImpression(item.id)
            }
        )
    }
}
```

### 曝光埋点完整示例

```kotlin
@Composable
fun ImpressionTrackedList(items: List<FeedItem>) {
    LazyColumn(
        state = rememberLazyListState()
    ) {
        items(
            items = items,
            key = { it.id }
        ) { item ->
            ImpressionCard(
                item = item,
                modifier = Modifier.onVisibilityChanged(
                    minDurationMs = 1000,     // 停留超过 1 秒
                    minFractionVisible = 0.8f // 80% 可见
                ) { visible ->
                    if (visible) {
                        logger.logImpression(item.id, "feed_list")
                    }
                }
            )
        }
    }
}
```

### 视频自动播放/暂停

```kotlin
@Composable
fun AutoPlayVideoItem(video: Video) {
    val player = rememberExoPlayer()

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(16 / 9)
            .onVisibilityChanged(
                minDurationMs = 200,
                minFractionVisible = 0.5f
            ) { visible ->
                if (visible) {
                    player.play()
                } else {
                    player.pause()
                }
            }
    ) {
        VideoPlayerComposable(player = player)
    }
}
```

## 关键参数详解

| 参数 | 类型 | 说明 |
|------|------|------|
| `minDurationMs` | Long | 组件可见至少多少毫秒才触发回调。默认 0（立即触发） |
| `minFractionVisible` | Float | 组件被遮挡前至少需要多少比例可见。范围 0.0~1.0，默认 0.0 |
| `restartOnRecomposition` | Boolean | 重组后是否重新触发 `onFirstVisible`。默认 `false` |

**`minFractionVisible` 场景说明：**
- `0.0f`：任何像素可见即触发（默认）
- `0.5f`：一半以上可见才触发
- `1.0f`：完全可见才触发

## 常见误区

- **误用 `LaunchedEffect` 监听滚动来计算可见性**：这正是 Visibility API 要解决的问题，滚动监听方案代码复杂且不准确
- **`minDurationMs` 设得太小**：低于 100ms 的值容易在快速滚动时误触发曝光
- **在回调中执行重操作**：`onVisibilityChanged` 回调运行在绘制线程，避免做耗时操作
- **`onFirstVisible` 和 `onVisibilityChanged` 混用目的不清**：明确需求是一次性触发（曝光埋点首次）还是每次变化都触发（视频播放/暂停）
- **忘记设置 `key`**：在 LazyColumn 中漏设 `key` 可能导致项被错误复用，触发错误的可见性回调

## 最佳实践

1. **曝光埋点场景**：使用 `onVisibilityChanged` + `minDurationMs = 500~1000` + `minFractionVisible = 0.5~0.8`
2. **视频自动播放**：使用 `onVisibilityChanged` + `minDurationMs = 200` + `minFractionVisible = 0.5`，在 `visible=true` 时 play，`false` 时 pause
3. **图片懒加载**：在 `onFirstVisible` 回调中加载高清图片，避免提前占用带宽
4. **数据预取**：结合 `LazyColumn` 的 `cacheWindow`，在目标 item 即将可见时提前加载数据
5. **与 Analytics SDK 集成**：将 `onVisibilityChanged` 封装为通用 `Modifier`，统一管理埋点逻辑

## 与 CacheWindow 的关系

Visibility API 和 `CacheWindow`（LazyColumn 预取窗口）是互补关系：

- **CacheWindow**：在组合阶段提前渲染更多 item，减少滚动时的卡顿
- **Visibility API**：在渲染完成后告诉你"这一项现在可见"，用于业务逻辑（播放/埋点/加载）

两者配合：预取让内容更快就绪，Visibility API 在内容就绪后触发业务动作。

## 关联主题

- [LazyColumn / LazyRow](./lazy-list.md) — 列表与 CacheWindow
- [状态与副作用](./state.md) — LaunchedEffect 替代方案
- [生命周期](./lifecycle.md) — Composition 生命周期
- [性能优化指南](./performance-guide.md)
