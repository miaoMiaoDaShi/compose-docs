# Shadow Modifiers - 强大的阴影渲染

> 摘要：Compose 1.9 引入的 dropShadow 和 innerShadow 修饰符，提供比传统 elevation 更强大的阴影控制能力，支持自定义颜色、渐变、spread 等。
>
> 适用版本：Compose 1.9+ / Kotlin 1.9+
>
> 更新时间：2026-03-14
>
> 标签：UI 效果，阴影，Compose 1.9

## 核心概念

传统的 `Modifier.shadow()` 仅支持设置阴影的高度（elevation），无法自定义颜色、偏移或扩散范围。Compose 1.9 引入了全新的阴影 API：

- **dropShadow()**：在元素外部渲染阴影，创造悬浮效果
- **innerShadow()**：在元素内部渲染阴影，创造凹陷效果

这些新 API 让你能够创建新拟态（Neumorphism）、新野兽派（Neobrutalism）等现代 UI 风格。

## 关键 API

- `Modifier.dropShadow()`：外部阴影，支持 shape、shadow（radius/spread/offset/color）
- `Modifier.innerShadow()`：内部阴影，参数与 dropShadow 相同
- `Shadow`：封装阴影属性的数据类

## 示例代码

### 基本用法

```kotlin
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun BasicDropShadow() {
    Box(
        modifier = Modifier
            .size(120.dp)
            .shadow(
                elevation = 8.dp,
                shape = RoundedCornerShape(16.dp),
                ambientColor = Color.Black.copy(alpha = 0.3f),
                spotColor = Color.Black.copy(alpha = 0.3f)
            )
            .background(
                color = Color.White,
                shape = RoundedCornerShape(16.dp)
            )
    )
}
```

### 使用新的 dropShadow API

```kotlin
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shadow
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.DpOffset

@Composable
fun ModernDropShadow() {
    Box(
        modifier = Modifier
            .size(150.dp)
            .shadow(
                shape = RoundedCornerShape(20.dp),
                shadow = Shadow(
                    radius = 10.dp,
                    spread = 4.dp,
                    offset = DpOffset(4.dp, 4.dp),
                    color = Color.Black.copy(alpha = 0.4f)
                )
            )
            .background(
                color = Color.White,
                shape = RoundedCornerShape(20.dp)
            )
    )
}
```

### 渐变阴影

```kotlin
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shadow
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun GradientShadow() {
    Box(
        modifier = Modifier
            .size(150.dp)
            .shadow(
                shape = RoundedCornerShape(16.dp),
                shadow = Shadow(
                    radius = 20.dp,
                    color = Color(0xFF6366F1).copy(alpha = 0.6f)
                )
            )
            .background(
                brush = Brush.linearGradient(
                    colors = listOf(Color(0xFF6366F1), Color(0xFF8B5CF6))
                ),
                shape = RoundedCornerShape(16.dp)
            )
    )
}
```

### 内阴影（创造凹陷效果）

```kotlin
import androidx.compose.ui.draw.innerShadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shadow
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.DpOffset

@Composable
fun InnerShadowDemo() {
    Box(
        modifier = Modifier
            .size(150.dp)
            .innerShadow(
                shape = RoundedCornerShape(16.dp),
                shadow = Shadow(
                    radius = 8.dp,
                    offset = DpOffset(2.dp, 2.dp),
                    color = Color.Black.copy(alpha = 0.5f)
                )
            )
            .background(
                color = Color(0xFFE0E0E0),
                shape = RoundedCornerShape(16.dp)
            )
    )
}
```

## 常见误区

- **误区 1**：将 `shadow` 修饰符放在 `background` 之后 → 正确顺序：shadow 在 background 之前
- **误区 2**：innerShadow 和 dropShadow 顺序无关紧要 → 顺序很重要，先渲染的会作为底层
- **误区 3**：渐变阴影必须使用特定的 brush 类型 → 任何 Brush 都可用于 shadow 的 color 参数

## 最佳实践

- 使用较浅的阴影半径和适当的 spread 创造自然效果
- 为阴影颜色添加 alpha 通道，避免过于生硬
- 利用渐变阴影创造品牌特色和视觉层次
- 在深色主题中使用较亮的阴影颜色模拟光源反射
- 新拟态风格注意可访问性对比度要求

## 关联主题

- [Canvas 绘图与自定义图形](./canvas.md)
- [Material 3 自适应布局](./material3.md)
