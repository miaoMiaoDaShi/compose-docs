# 共用元素过渡动画 ✨

> 摘要：共享元素过渡让列表页和详情页之间的切换更自然，常用于图片、卡片和头像等元素。
>
> 适用版本：Compose 动画相关常见版本，具体以官方 API 为准
>
> 更新时间：2026-03-13
>
> 标签：动画，共享元素，过渡，导航

## 核心概念

当同一个视觉元素在两个页面中都存在时，共享元素过渡可以把“页面切换”变成“元素形态变化”，让用户更容易理解上下文关系。

## 关键 API / 机制

- `SharedBounds`：定义共享元素的过渡边界。
- `rememberSharedContentState()`：维护过渡过程中共享内容的身份。
- `key`：确保列表页和详情页使用同一共享标识。
- `enabled`（Compose 1.10+）：条件化启用共享元素过渡。
- `initialVelocity`（Compose 1.10+）：为手势驱动的过渡设置动画初速度。

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

## 条件化启用（Compose 1.10+）

Compose 1.10 支持基于状态条件化地启用共享元素过渡，适合性能优化和差异化交互：

```kotlin
SharedBounds(
    sharedContentState = rememberSharedContentState(key = "card-$id"),
    // 仅在列表前3项可见时启用，过滤器性能开销
    enabled = remember { derivedStateOf { listState.firstVisibleItemIndex < 3 } },
    modifier = Modifier.sharedElement(
        rememberSharedContentState(key = "card-$id"),
        clipCrossfade = true
    )
) {
    ItemCard(item)
}
```

**使用场景：**
- 低端设备上关闭共享元素以提升帧率
- 根据用户动画偏好设置动态控制
- 屏幕外列表项不浪费过渡动画资源

## 初速度支持（Compose 1.10+）

Compose 1.10 支持为共享元素动画设置初始速度，让手势驱动的过渡更自然：

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

## 常见误区

- 两端使用的 key 不一致：会导致过渡无法正确匹配。
- 对过多元素同时启用共享动画：可能增加实现和调试成本。
- 动画很好看，但导航结构和返回路径不清晰：用户体验仍然会割裂。

## 最佳实践

- 让共享元素聚焦少数最关键的视觉锚点。
- 先保证导航和布局结构清晰，再叠加共享动画。
- 对图片、卡片、头像等“身份感强”的元素优先使用。

## 关联主题

- [Navigation Compose 3.0](./navigation.md)
- [Navigation Compose 进阶技巧](./nav-advanced.md)
- [Compose 动画 API 进阶](./animation.md)
