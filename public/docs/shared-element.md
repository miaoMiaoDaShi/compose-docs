# 共用元素过渡动画 ✨

> 摘要:共享元素过渡让列表页和详情页之间的切换更自然,常用于图片、卡片和头像等元素。
>
> 适用版本:Compose 动画相关常见版本,具体以官方 API 为准
>
> 更新时间:2026-04-05
>
> 标签:动画,共享元素,过渡,导航

## 核心概念

当同一个视觉元素在两个页面中都存在时,共享元素过渡可以把"页面切换"变成"元素形态变化",让用户更容易理解上下文关系。

## 关键 API / 机制

- `SharedBounds`:定义共享元素的过渡边界。
- `rememberSharedContentState()`:维护过渡过程中共享内容的身份。
- `key`:确保列表页和详情页使用同一共享标识。
- `enabled`(Compose 1.10+):条件化启用共享元素过渡。
- `initialVelocity`(Compose 1.10+):为 `SharedBounds` 手势驱动的过渡设置动画初速度。
- `prepareTransitionWithInitialVelocity`(Compose 1.10+):在 `SharedTransitionScope` 内为手势驱动的共享元素过渡传入手势初速度,实现更自然的物理动画衔接。

## 示例代码

```kotlin
SharedBounds(
    sharedContentState = rememberSharedContentState(key = "image-$imageUrl")
) {
    AsyncImage(model = imageUrl, contentDescription = null)
}

SharedBounds(
    sharedContentState = rememberSharedContentState(key = "image-$imageUrl")
) {
    AsyncImage(model = imageUrl, contentDescription = null)
}
```

## 条件化启用(Compose 1.10+)

Compose 1.10 支持基于状态条件化地启用共享元素过渡,适合性能优化和差异化交互:

```kotlin
SharedBounds(
    sharedContentState = rememberSharedContentState(key = "card-$id"),
    // 仅在列表前3项可见时启用,过滤器性能开销
    enabled = remember { derivedStateOf { listState.firstVisibleItemIndex < 3 } },
    modifier = Modifier.sharedElement(
        rememberSharedContentState(key = "card-$id"),
        clipCrossfade = true
    )
) {
    ItemCard(item)
}
```

**使用场景:**
- 低端设备上关闭共享元素以提升帧率
- 根据用户动画偏好设置动态控制
- 屏幕外列表项不浪费过渡动画资源

## 初速度支持(Compose 1.10+)

Compose 1.10 支持为共享元素动画设置初始速度,让手势驱动的过渡更自然:

```kotlin
SharedBounds(
    sharedContentState = rememberSharedContentState(key = "card-$id"),
    // 从手势事件获取初速度
    initialVelocity = velocityFromMotionEvent(event),
    animationSpec = spring(
        dampingRatio = Spring.DampingRatioMediumBouncy,
        stiffness = Spring.StiffnessMedium
    )
) {
    ItemCard(item)
}
```

**典型应用：**
- 拖拽手势驱动的列表→详情过渡：拖拽速度和方向决定动画手感
- 快速滑动触发时，动画跟随手势物理特性自然过渡
- 配合 `predictiveBack` 实现预测性返回

## prepareTransitionWithInitialVelocity（Compose 1.10+）

`prepareTransitionWithInitialVelocity` 是 Compose 1.10 在 `SharedTransitionScope` 中新增的 API，允许在启动共享元素过渡时直接传入手势的初始速度（来自 MotionEvent 或指针事件）。这比在 `SharedBounds` 上设置 `initialVelocity` 更底层，适用于需要精确控制动画物理特性的场景。

**与 `SharedBounds.initialVelocity` 的区别：**

| 维度 | `SharedBounds.initialVelocity` | `prepareTransitionWithInitialVelocity` |
|------|------------------------------|---------------------------------------|
| 作用域 | 单个 `SharedBounds` 组件 | 整个 `SharedTransitionScope` 协调器 |\
| 控制粒度 | 局部 | 全局（所有匹配的元素同步接收初速度） |
| 典型用法 | 个别元素的细微调整 | 手势驱动整体过渡（如拖拽返回列表） |
| API 层级 | 封装好的简化 API | 底层协调 API |

**基本用法：**

```kotlin
SharedTransitionScope {
    // velocityX / velocityY 来自手势 MotionEvent
    // contentOffset 为手势结束时元素相对屏幕的偏移量
    prepareTransitionWithInitialVelocity(
        sharedContentState = rememberSharedContentState(key = "card-$id"),
        initialVelocity = Velocity(velocityX, velocityY),
        contentOffset = Offset(contentX, contentY)
    )

    // 配合 Predictive Back 使用
    PredictiveBackHandler { progress: Float ->
        // progress 从 0 到 1，反映手势完成度
        onBackInvokedWithProgress(
            onProgress = { progress },
            onFinished = { /* 导航返回 */ }
        )
    }

    Card(
        modifier = Modifier
            .sharedElement(
                sharedContentState = rememberSharedContentState(key = "card-$id"),
                clipCrossfade = true
            )
    ) {
        ItemContent()
    }
}
```

**完整手势驱动过渡示例（拖拽列表→详情）：**

```kotlin
@OptIn(ExperimentalSharedTransitionApi::class)
@Composable
fun SharedElementListDetail(
    listState: LazyListState,
    detailItem: Item?,
    onNavigateToDetail: (Item, Offset) -> Unit,
    onBack: () -> Unit
) {
    SharedTransitionScope {
        Box(modifier = Modifier.fillMaxSize()) {
            if (detailItem == null) {
                // 列表页
                LazyColumn(state = listState) {
                    items(list, key = { it.id }) { item ->
                        DraggableItem(
                            onDragEnd = { offset, velocity ->
                                onNavigateToDetail(item, offset)
                            }
                        ) {
                            Card(
                                modifier = Modifier
                                    .sharedElement(
                                        sharedContentState = rememberSharedContentState(key = "item-${item.id}"),
                                        clipCrossfade = true
                                    )
                                    .skipToLookaheadPosition()
                            ) {
                                ListItemContent(item)
                            }
                        }
                    }
                }
            } else {
                // 详情页
                LaunchedEffect(detailItem) {
                    // 手势返回时传入当前滚动偏移作为初速度
                    val velocity = listState.measureVelocity()
                    prepareTransitionWithInitialVelocity(
                        sharedContentState = rememberSharedContentState(key = "item-${detailItem.id}"),
                        initialVelocity = velocity
                    )
                }

                Card(
                    modifier = Modifier
                        .sharedElement(
                            sharedContentState = rememberSharedContentState(key = "item-${detailItem.id}"),
                            clipCrossfade = true
                        )
                ) {
                    DetailContent(detailItem)
                }
            }
        }
    }
}

// 辅助函数：从 LazyListState 测量当前滚动速度
@Composable
private fun LazyListState.measureVelocity(): Velocity {
    var velocity by remember { mutableStateOf(Velocity.Zero) }
    LaunchedEffect(firstVisibleItemIndex, firstVisibleItemScrollOffset) {
        // 实际实现中需要记录两次 scroll offset 的时间差来计算速度
        velocity = Velocity.Zero
    }
    return velocity
}
```

**最佳实践：**
- `prepareTransitionWithInitialVelocity` 适合在导航返回/前进的协调层使用，而非单个元素
- 配合 `PredictiveBack` 时，在 `PredictiveBackHandler` 中获取手势进度并传给协调器
- 初速度方向应与手势拖拽方向一致，Compose 会自动映射到目标元素的运动方向
- 列表页和详情页两侧的 `SharedTransitionScope` 应使用相同的初速度配置

## 常见误区

- 两端使用的 key 不一致:会导致过渡无法正确匹配。
- 对过多元素同时启用共享动画:可能增加实现和调试成本。
- 动画很好看,但导航结构和返回路径不清晰:用户体验仍然会割裂。

## 最佳实践

- 让共享元素聚焦少数最关键的视觉锚点。
- 先保证导航和布局结构清晰,再叠加共享动画。
- 对图片、卡片、头像等"身份感强"的元素优先使用。

## 关联主题

- [Navigation Compose 3.0](./navigation.md)
- [Navigation Compose 进阶技巧](./nav-advanced.md)
- [Compose 动画 API 进阶](./animation.md)
