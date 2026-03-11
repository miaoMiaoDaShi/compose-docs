# Compose 动画 API 进阶 🎬

## animate*AsState

```kotlin
val alpha by animateFloatAsState(
    targetValue = if (isExpanded) 1f else 0.5f,
    animationSpec = tween(durationMillis = 300)
)
```

## 动画规格

- `tween()` - 线性动画
- `spring()` - 弹簧动画（推荐）
- `infiniteRepeatable()` - 无限动画

## Crossfade / AnimatedContent

```kotlin
Crossfade(targetState = selectedTab) { tab ->
    Content(tab)
}
```

## animateContentSize

```kotlin
Text(
    text = text,
    maxLines = if (expanded) Int.MAX_VALUE else 1,
    modifier = Modifier.animateContentSize()
)
```
