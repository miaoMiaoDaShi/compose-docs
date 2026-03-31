# Modifier.visible() - 可见性控制

> 摘要：Compose 1.11 引入的 `Modifier.visible()` API，用于控制 UI 元素的可见性。与传统的 `if-else` 条件渲染或 `alpha(0f)` 不同，`Modifier.visible()` 在隐藏元素的同时保留其布局空间（不触发重组），适合需要维持布局结构但暂时隐藏内容的场景。
>
> 适用版本：Compose 1.11.0-alpha01+ / Kotlin 1.9+
>
> 更新时间：2026-03-31
>
> 标签：布局，Modifier，Compose 1.11，可见性

## 核心概念

### 为什么需要 Modifier.visible()？

传统的隐藏 UI 方式有几种，各有缺点：

| 方式 | 布局空间 | 重组 | 绘制 |
|------|---------|------|------|
| `if (show) { Content() }` | 变化 | 是 | 无 |
| `Modifier.alpha(0f)` | 保留 | 否 | 仍执行 |
| `Modifier.visible(false)` | **保留** | **否** | **跳过** |

`Modifier.visible(false)` 的核心优势：
- **跳过绘制阶段**：Compose 跳过该元素的绘制，不浪费 GPU 资源
- **保留布局空间**：父布局不知道元素被隐藏，布局结构不变
- **不触发重组**：不会引起 Compose 树的重计算

### 与 alpha(0f) 的区别

`alpha(0f)` 虽然视觉上不可见，但：
- 绘制命令仍然发送到 GPU（只是透明度为 0）
- 点击区域仍然存在（可能拦截点击事件）
- 动画系统仍然运行

`Modifier.visible(false)` 则是：
- 完全跳过该元素的 `draw{}` 内容
- 点击事件穿透（不会拦截）
- 性能更好

## 示例代码

### 基本用法

```kotlin
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.Switch
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding

@Composable
fun VisibleModifierDemo() {
    var isHeaderVisible by remember { mutableStateOf(true) }

    Column(modifier = Modifier.fillMaxSize()) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
        ) {
            Text("Show Header")
            Switch(
                checked = isHeaderVisible,
                onCheckedChange = { isHeaderVisible = it },
                modifier = Modifier.padding(start = 8.dp)
            )
        }

        // 隐藏时：布局空间保留，但不绘制
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Red)
                .visible(isHeaderVisible)  // true = 显示，false = 隐藏
        ) {
            Text(
                text = "Header Content",
                color = Color.White
            )
        }
    }
}
```

### 配合 Spacer 的对比

```kotlin
@Composable
fun SpacerVsVisible() {
    var showPlaceholder by remember { mutableStateOf(false) }

    Column {
        // 方式1：Spacer 占位（需要手动管理尺寸）
        if (showPlaceholder) {
            Spacer(modifier = Modifier.height(100.dp))
        }

        // 方式2：Modifier.visible()（自动保留空间）
        Box(
            modifier = Modifier
                .height(100.dp)
                .visible(showPlaceholder)
                .background(Color.Blue)
        ) {
            Text("Content")
        }
    }
}
```

### 动画配合

```kotlin
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically

@Composable
fun AnimatedVisibleContent(
    isVisible: Boolean,
    content: @Composable () -> Unit
) {
    // 注意：AnimatedVisibility 是动画过渡
    // Modifier.visible() 是即时切换，不带动画
    // 两者可以结合使用
    Box(modifier = Modifier.visible(isVisible)) {
        content()
    }
}
```

### 常见使用场景

```kotlin
// 场景1：维持布局稳定性的占位隐藏
@Composable
fun StablePlaceholderDemo() {
    Column {
        // 隐藏时 Box 仍然占据 200dp 高度
        Box(
            modifier = Modifier
                .height(200.dp)
                .visible(false)  // 布局空间保留
                .background(Color.LightGray)
        ) {
            Text("Placeholder")
        }
        Text("Below content - position stable")
    }
}

// 场景2：权限控制下的内容展示
@Composable
fun PermissionBasedVisibility(
    hasPermission: Boolean,
    sensitiveContent: @Composable () -> Unit
) {
    Box(
        modifier = Modifier.visible(hasPermission)
    ) {
        sensitiveContent()
    }
}

// 场景3：调试模式下的覆盖层
@Composable
fun DebugOverlay(
    isDebugMode: Boolean,
    overlayContent: @Composable () -> Unit
) {
    Box(modifier = Modifier.visible(isDebugMode)) {
        overlayContent()
    }
}
```

## 常见误区

- **误用 `Modifier.visible()` 做动画**：visible 是即时切换，要动画效果请用 `AnimatedVisibility`
- **以为隐藏就不占空间**：`visible(false)` 保留布局空间，如果不需要空间保留，用 `if` 条件渲染
- **与 `alpha(0f)` 混用**：两者都可以隐藏，但行为不同，根据场景选择
- **在 `LazyColumn` 中滥用**：频繁切换可见性可能导致性能问题，考虑使用 `key` 和重组优化

## 最佳实践

1. **根据是否需要保留空间选择方案**：
   - 需要保留空间 → `Modifier.visible(false)`
   - 不需要保留空间 → `if (condition) { Content() }`

2. **调试时验证绘制是否跳过**：使用 Android Studio Layout Inspector，确认隐藏元素不在绘制列表中

3. **点击事件穿透**：隐藏元素默认不拦截点击事件，这是预期行为

4. **结合 `derivedStateOf` 使用**：当可见性由复杂状态计算时，用派生状态避免不必要的重组

## 关联主题

- [Visibility Tracking - 可见性跟踪](./visibility-tracking.md)
- [布局组件 Box / Row / Column](./box-row-column.md)
- [Modifier 修饰符](./modifier.md)
