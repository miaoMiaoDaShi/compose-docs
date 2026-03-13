# Compose 动画 API 进阶 🎬

> 摘要：Compose 动画 API 让状态变化可以自然地过渡到视觉变化，是交互体验的重要增强层。
>
> 适用版本：Jetpack Compose 常见版本，具体以官方 API 为准
>
> 更新时间：2026-03-13
>
> 标签：动画，animateAsState，AnimatedContent，交互

## 核心概念

Compose 动画的核心思想是“状态驱动动画”。当目标值变化时，动画 API 会自动在旧状态和新状态之间插值，不需要手动维护复杂的过渡流程。

## 关键 API / 机制

- `animate*AsState()`：适合单个值的简单状态过渡。
- `tween()`、`spring()`：控制动画节奏和手感。
- `Crossfade` / `AnimatedContent`：适合内容切换型动画。
- `animateContentSize()`：让尺寸变化更自然。

## 示例代码

```kotlin
val alpha by animateFloatAsState(
    targetValue = if (isExpanded) 1f else 0.5f,
    animationSpec = tween(durationMillis = 300)
)

Crossfade(targetState = selectedTab) { tab ->
    Content(tab)
}

Text(
    text = text,
    maxLines = if (expanded) Int.MAX_VALUE else 1,
    modifier = Modifier.animateContentSize()
)
```

## 常见误区

- 所有变化都加动画：界面会变得拖沓甚至混乱。
- 只改视觉效果，不考虑状态切换时序和可理解性。
- 在高频列表项中滥用复杂动画，影响滚动流畅度。

## 最佳实践

- 让动画服务于信息层级和交互反馈，而不是单纯炫技。
- 简单值变化优先使用 `animate*AsState()`。
- 内容切换、列表详情过渡等场景优先选择语义更明确的动画 API。

## 关联主题

- [共用元素过渡动画](./shared-element.md)
- [Modifier.Node 高性能自定义组件](./modifier-node.md)
- [Canvas 绘图与自定义图形](./canvas.md)
