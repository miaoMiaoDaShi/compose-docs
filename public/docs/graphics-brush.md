# Brush 与 Graphics API - 渐变与图形填充 🎨

> 摘要：介绍 Compose 中 Brush 和 GraphicsLayer 的用法，实现渐变背景、图形填充和图层变换效果。
>
> 适用版本：Jetpack Compose 1.5+，GraphicsLayer 需要 Compose 1.7+
>
> 更新时间：2026-03-25
>
> 标签：绘制，Graphics，Brush，渐变，图形

## 核心概念

Compose 的 `Brush` API 让你创建各类填充效果：纯色、线性渐变、径向渐变、扫描渐变。与 `Modifier.background()`、`Modifier.border()` 和 Canvas 的 `drawRect`、`drawCircle` 等搭配使用，可实现丰富的视觉效果。

`GraphicsLayer`（Compose 1.7+）则提供图层级变换能力（缩放、旋转、阴影），用于自定义组件的视觉表现。

## Brush 类型

### 纯色 Brush

```kotlin
// 等同于直接设置颜色，但可用于需要 Brush 参数的地方
SolidColor(color = Color.Red)
```

### 线性渐变（LinearGradient）

```kotlin
// 默认从左到右渐变
Modifier.background(
    brush = Brush.linearGradient(
        colors = listOf(Color.Red, Color.Yellow, Color.Green)
    )
)

// 自定义方向（起点和终点）
Modifier.background(
    brush = Brush.linearGradient(
        colors = listOf(Color.Blue, Color.Cyan),
        start = Offset(0f, 0f),
        end = Offset(Float.POSITIVE_INFINITY, Float.POSITIVE_INFINITY)
    )
)
```

### 径向渐变（RadialGradient）

```kotlin
Modifier.background(
    brush = Brush.radialGradient(
        colors = listOf(Color.Yellow, Color.Red),
        center = Offset(200f, 200f),
        radius = 300f
    )
)
```

### 扫描渐变（SweepGradient）

```kotlin
Modifier.background(
    brush = Brush.sweepGradient(
        colors = listOf(Color.Green, Color.Blue, Color.Red, Color.Green)
    )
)
```

### 水平/垂直渐变

```kotlin
// 水平渐变（从左到右）
Modifier.background(
    brush = Brush.horizontalGradient(colors = listOf(Color.Red, Color.Blue))
)

// 垂直渐变（从上到下）
Modifier.background(
    brush = Brush.verticalGradient(colors = listOf(Color.Red, Color.Blue))
)
```

## GraphicsLayer 图层变换

`Modifier.graphicsLayer` 封装了丰富的图层属性，适合做自定义组件的视觉增强：

```kotlin
Modifier.graphicsLayer {
    // 缩放（围绕中心）
    scaleX = 1.2f
    scaleY = 1.2f
    
    // 旋转（默认围绕左上角，可配合 translationX/Y 调整中心）
    rotationZ = 45f
    
    // 透明度
    alpha = 0.9f
    
    // 阴影（等同于 elevation 但更灵活）
    shadowElevation = 8f
    
    // 变换
    translationX = 10f
    translationY = 20f
}
```

### 与硬件加速配合

`graphicsLayer` 会启用 `RenderEffect`（在支持硬件加速的设备上），适合做图片轮播、卡片翻转等交互动画。

## 常见误区

- **渐变用于 Text**：渐变只能用于可绘制区域（background、border、Canvas），不能直接用于文字。文字渐变需要通过 `drawBehind` 在 Canvas 上自己绘制文字。
- **Brush vs Color 参数**：很多 API 同时接受 `Color` 和 `Brush`。`Color` 等同于 `SolidColor(color)`。
- **性能问题**：复杂渐变或频繁重绘的 GraphicsLayer 可能影响性能，避免在滚动区域使用。

## 最佳实践

- 渐变优先使用系统提供的快捷方法（`horizontalGradient`、`verticalGradient`），性能优于手动指定 start/end。
- 阴影效果优先使用 `graphicsLayer` 而非 `Modifier.shadow`（后者会触发重排）。
- 需要动画的图层变换（缩放、旋转）优先使用 `animateFloatAsState` 配合 `graphicsLayer` 属性。

## 关联主题

- [Canvas 绘图与自定义图形](./canvas.md) - 更底层的自定义绘制
- [Shadow Modifiers](./shadow-modifiers.md) - 阴影的另一种实现方式
