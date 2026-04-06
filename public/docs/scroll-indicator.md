# Scroll Indicator — 原生滚动指示器 API

> 摘要：Compose 1.11 Foundation 引入了原生的 `Modifier.scrollIndicator` 和 `ScrollIndicatorState` API，为可滚动组件提供标准化的滚动指示器（滚动条）自定义能力。在此之前，开发者需要依赖 Accompanist 等第三方库或自行实现复杂的手绘滚动条逻辑。
>
> 适用版本：Jetpack Compose 1.11.0-beta01+ / `androidx.compose.foundation`
>
> 更新时间：2026-04-06
>
> 标签：布局，滚动，LazyColumn，ScrollIndicatorState，Compose 1.11

## 核心概念

### 背景：为什么需要这个 API？

在此之前，Jetpack Compose **没有**官方的原生滚动条支持。常见解决方案包括：

| 方案 | 缺点 |
|------|------|
| Accompanist `HorizontalPager` 等内置指示器 | 仅限特定组件，非通用方案 |
| 第三方库自定义 `drawWithContent` | 实现复杂，版本维护成本高 |
| 直接忽略 | 用户缺乏滚动位置反馈 |

Compose 1.11 的 `Modifier.scrollIndicator` 和 `ScrollIndicatorState` 将这一能力标准化，直接集成到 Foundation 层，任何可滚动组件（`LazyColumn`、`LazyRow`、`verticalScroll` 等）都可以接入。

## ScrollIndicatorState 接口

`ScrollIndicatorState` 是滚动指示器的状态抽象接口，由可滚动组件实现并提供给绘制端：

```kotlin
// androidx.compose.foundation
interface ScrollIndicatorState {
    /** 当前滚动偏移量（像素） */
    val scrollOffset: Float

    /** 滚动内容的总尺寸（像素） */
    val contentSize: Float

    /** 视口可见区域的尺寸（像素） */
    val viewportSize: Float

    /** 指示器是否应当显示（例如内容超出视口时） */
    val isVisible: Boolean
}
```

**属性说明：**

| 属性 | 说明 |
|------|------|
| `scrollOffset` | 垂直滚动为 Y 偏移，水平滚动为 X 偏移 |
| `contentSize` | 垂直滚动为内容总高度，水平滚动为内容总宽度 |
| `viewportSize` | 垂直滚动为视口高度，水平滚动为视口宽度 |
| `isVisible` | 内容超出视口时才显示指示器，否则隐藏 |

**对 Lazy 布局的特殊处理：**

对于 `LazyColumn`/`LazyRow` 等大量数据项的组件，`ScrollIndicatorState` 的实现可能会使用启发式算法（heuristic）估算 `scrollOffset` 和 `contentSize`，因为精确计算对大量数据项可能产生性能问题。

## Modifier.scrollIndicator 基本用法

### 默认滚动条

Compose 1.11 为 `LazyColumn` 等滚动组件提供了默认滚动指示器支持。启用方式是在滚动组件上附加 `Modifier.scrollIndicator()`：

```kotlin
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.Text
import androidx.compose.foundation.ScrollIndicator

@Composable
fun LazyColumnWithScrollIndicator() {
    val listState = rememberLazyListState()

    LazyColumn(
        state = listState,
        modifier = Modifier.fillMaxSize()
    ) {
        items(100) { index ->
            Text("Item $index")
        }
    }

    // 在 LazyColumn 上附加滚动指示器
    // 注意：具体 API 可能因版本而异，以下为示意
    Box(modifier = Modifier.matchParentSize()) {
        ScrollIndicator(
            state = listState.scrollIndicatorState,
            modifier = Modifier.align(androidx.compose.ui.Alignment.CenterEnd)
        )
    }
}
```

### 自定义滚动条样式

`Modifier.scrollIndicator` 支持自定义滚动条的视觉外观：

```kotlin
import androidx.compose.foundation.ScrollIndicatorStyle
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun CustomScrollIndicator() {
    val listState = rememberLazyListState()

    LazyColumn(
        state = listState,
        modifier = Modifier.fillMaxSize()
    ) {
        items(100) { index ->
            ListItem(
                headlineContent = { Text("Item $index") }
            )
        }
    }

    // 自定义滚动条样式
    Box(modifier = Modifier.matchParentSize()) {
        ScrollIndicator(
            state = listState.scrollIndicatorState,
            modifier = Modifier
                .align(Alignment.CenterEnd)
                .scrollIndicatorStyle(
                    strokeWidth = 4.dp,           // 滚动条厚度
                    cornerRadius = 2.dp,           // 圆角
                    color = Color.Gray.copy(alpha = 0.5f), // 滚动条颜色
                    hoverColor = Color.Gray,       // 悬停颜色
                    trackColor = Color.LightGray.copy(alpha = 0.3f) // 轨道颜色
                )
        )
    }
}
```

### 配合 verticalScroll / horizontalScroll 使用

非惰性滚动容器同样可以接入滚动指示器：

```kotlin
@Composable
fun ScrollableColumnWithIndicator() {
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
    ) {
        // 大量内容
        repeat(100) { index ->
            Text("Line $index", modifier = Modifier.padding(8.dp))
        }
    }

    // 附加水平滚动指示器
    Box(modifier = Modifier.matchParentSize()) {
        ScrollIndicator(
            state = scrollState.scrollIndicatorState,
            modifier = Modifier.align(Alignment.BottomCenter)
        )
    }
}
```

## ScrollIndicatorState 的派生计算

`ScrollIndicatorState` 的核心价值在于提供了足够的信息来计算滚动条的几何属性。典型实现如下：

```kotlin
// 根据 ScrollIndicatorState 计算滚动条位置和大小
fun ScrollIndicatorState.toScrollbarGeometry(): ScrollbarGeometry {
    // 滚动条占空比 = 视口大小 / 内容总大小
    val scrollbarSizeFraction = (viewportSize / contentSize).coerceIn(0f, 1f)

    // 滚动条长度（确保不会过长或过短）
    val scrollbarLength = viewportSize * scrollbarSizeFraction

    // 滚动条起始位置
    val maxOffset = (contentSize - viewportSize).coerceAtLeast(0f)
    val scrollbarOffsetFraction = if (maxOffset > 0) {
        scrollOffset / maxOffset
    } else {
        0f
    }
    val scrollbarStart = scrollbarOffsetFraction * (viewportSize - scrollbarLength)

    return ScrollbarGeometry(
        length = scrollbarLength,
        offset = scrollbarStart,
        isVisible = isVisible && viewportSize < contentSize
    )
}

data class ScrollbarGeometry(
    val length: Float,
    val offset: Float,
    val isVisible: Boolean
)
```

## 与 Accompanist 的对比

| 维度 | Accompanist | 原生 ScrollIndicator API |
|------|-------------|------------------------|
| 来源 | 第三方库 | Compose Foundation（官方） |
| 维护 | 社区维护，有版本延迟 | Google 官方维护 |
| 稳定性 | 依赖版本可能断更 | API 稳定保障 |
| 集成深度 | 需手动同步状态 | 组件原生支持 |
| 跨平台 | 仅 Android | 可随 Compose Multiplatform 扩展 |

**迁移建议：**

如果项目当前使用 Accompanist 滚动条实现，可以分阶段迁移：

```kotlin
// 旧写法（Accompanist）
import com.google.accompanist.recyclerview.scrollbarremember

@Composable
fun OldScrollbar() {
    LazyColumn(
        state = listState,
        modifier = Modifier.fillMaxSize()
    ) {
        items(100) { index ->
            Text("Item $index")
        }
    }

    // 使用 Accompanist 绘制滚动条（自定义 drawWithContent 实现）
}

// 新写法（Compose 1.11 原生）
@Composable
fun NewScrollbar() {
    LazyColumn(
        state = listState,
        modifier = Modifier.fillMaxSize()
    ) {
        items(100) { index ->
            Text("Item $index")
        }
    }

    // 使用原生 ScrollIndicator API
}
```

## 已知限制

- **Android 平台专属**：截至 Compose 1.11，滚动指示器主要面向 Android 平台（移动端通常不使用滚动条，但在平板/大屏场景有需求）
- **Lazy 布局估算**：对 `LazyColumn`/`LazyRow`，`scrollOffset` 和 `contentSize` 可能使用估算值，非精确像素值
- **实验性 API**：`ScrollIndicatorState` 和 `Modifier.scrollIndicator` 在初始版本可能为 `@ExperimentalFoundationApi`，需要 Opt-In
- **桌面/跨平台**：Desktop/Web 的滚动条支持由 Compose Multiplatform 单独提供，API 可能略有差异

## 最佳实践

1. **按需显示**：`isVisible` 为 `false` 时不要绘制滚动条，避免浪费绘制资源
2. **平板适配**：平板大屏场景下用户更容易使用鼠标滚轮，滚动条指示器体验更好
3. **颜色对比度**：确保滚动条颜色与背景有足够对比度，满足无障碍要求
4. **不要过度使用**：移动端用户习惯通过触摸滚动，滚动条并非核心 UX 元素，优先保证核心交互

## 关联主题

- [LazyColumn / LazyRow](./lazy-list.md)
- [Modifier 修饰符](./modifier.md)
- [布局组件 Box / Row / Column](./box-row-column.md)
- [Compose 1.11 Breaking Changes](./compose-1-11-changes.md)
