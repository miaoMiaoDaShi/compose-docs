# Scrollable2D 与 Draggable2D 双向滚动 📐

> 摘要：Compose 1.9 引入了 `Scrollable2D` 和 `Draggable2D` 修饰符，突破了原有单轴滚动的限制，支持在水平+垂直方向同时滚动，适用于地图、表格、图片查看器等复杂交互场景。
>
> 适用版本：Compose 1.9+（August 2025 Release）
>
> 更新时间：2026-04-03
>
> 标签：布局，滚动，2D 滚动，Compose 1.9，交互

## 摘要

传统 `Modifier.scrollable` 和 `Modifier.draggable` 仅支持单一方向（水平或垂直）。Compose 1.9 新增了 `Scrollable2D` 和 `Draggable2D`，允许容器同时拦截和处理两个轴向上的触摸手势和惯性滑动。这是构建地图、表格、棋盘、图片查看器等双向滚动 UI 的基础能力。

## 核心概念

### 与 1D 修饰符的对比

| 修饰符 | 支持方向 | 典型场景 |
|--------|---------|---------|
| `Modifier.scrollable` | 单轴（horizontal 或 vertical） | 普通列表、水平图片轮播 |
| `Modifier.draggable` | 单轴 | 单轴拖拽滑块 |
| `Modifier.scrollable2D` | **双轴同时** | 地图、图片查看器、表格 |
| `Modifier.draggable2D` | **双轴同时** | 棋盘游戏、画布拖拽 |

**设计理念：** `Scrollable2D` 扩展了 `Scrollable`，继承了其 fling（惯性滑动）能力；`Draggable2D` 扩展了 `Draggable`，适合需要精确控制拖拽位移的场景。

### 工作原理

两个修饰符都接收一个 `Scrollable2DState`（或 `Draggable2DState`），状态负责：
1. 消费手势传来的 XY 增量（delta）
2. 维护当前偏移量
3. 提供 `fling` 能力（仅 `Scrollable2D`）

使用 `rememberScrollable2DState` 创建状态：

```kotlin
val state = rememberScrollable2DState { axisDirection ->
    // axisDirection 包含 x/y 轴的增量
    // 返回消费掉的像素值
    currentOffset += axisDirection.x
    currentOffsetY += axisDirection.y
    // 返回在对应轴上消费了多少像素
    Offset(axisDirection.x, axisDirection.y)
}
```

## 示例代码

### 基础双向滚动容器

```kotlin
@Composable
fun TwoDimensionalScrollableBox() {
    val state = rememberScrollable2DState { delta ->
        // 更新偏移量
        offset = offset.copy(
            x = (offset.x + delta.x).coerceIn(-maxX, maxX),
            y = (offset.y + delta.y).coerceIn(-maxY, maxY)
        )
        delta // 消费全部增量
    }

    Box(
        modifier = Modifier
            .size(300.dp)
            .clip(RectangleShape)
            .scrollable2D(state, directions = Direction.Both)
    ) {
        // 内容会自动根据 offset 渲染在正确位置
        Image(
            painter = painterResource(id = R.drawable.large_map),
            contentDescription = null,
            modifier = Modifier.offset { IntOffset(offset.x.roundToInt(), offset.y.roundToInt()) }
        )
    }
}
```

### 捕获原始手势数据（颜色选择器示例）

```kotlin
@Composable
fun ColorPickerWithCapturedScroll() {
    var offset by remember { mutableStateOf(Offset.Zero) }
    val density = LocalDensity.current

    val state = rememberScrollable2DState { rawDelta ->
        offset = Offset(
            x = offset.x + rawDelta.x,
            y = offset.y + rawDelta.y
        )
        rawDelta // 消费全部增量
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .scrollable2D(state, directions = Direction.Both)
    ) {
        // 动态显示 X, Y 偏移量
        Text("X: ${with(density) { offset.x.toDp().value.roundToInt() }}dp")
        Text("Y: ${with(density) { offset.y.toDp().value.roundToInt() }}dp")

        // 将偏移量应用于选择器 UI
        ColorSelectorContent(offset = offset)
    }
}
```

### 配合 Nested Scroll 使用

```kotlin
@Composable
fun NestedScrollCoordinator() {
    val scrollable2DState = rememberScrollable2DState { delta ->
        // 协调内部滚动与外部嵌套滚动
        innerOffset = (innerOffset + delta).coerceIn(...)
        delta
    }

    val nestedScrollConnection = rememberScrollable2DState {
        // 与父容器的双向嵌套滚动协调
    }

    Box(
        modifier = Modifier
            .nestedScroll(nestedScrollConnection)
            .scrollable2D(scrollable2DState, directions = Direction.Both)
    ) {
        LargeContent()
    }
}
```

### 自定义 Fling 行为

```kotlin
@Composable
fun CustomFlingBehavior() {
    val state = rememberScrollable2DState { delta ->
        offset = (offset + delta).coerceIn(bounds)
        delta
    }

    val flingBehavior = rememberScrollable2DState {
        Scrollable2DState {
            // 自定义 fling 参数
        }
    }

    // 使用自定义 fling 参数
    Box(
        modifier = Modifier.scrollable2D(
            state = state,
            directions = Direction.Both,
            flingBehavior = flingBehavior
        )
    ) {
        // ...
    }
}
```

## 常见误区

- **混淆 `scrollable2D` 和 `draggable2D`**：`scrollable2D` 有惯性滑动（fling），适合地图等需要甩动滚动的场景；`draggable2D` 无惯性，适合精确拖拽（如棋盘游戏）
- **忘记消费增量**：在 state lambda 中必须返回消费掉的像素值，否则滚动行为异常
- **双向与单向混用**：如果只需要单向滚动，继续使用标准 `scrollable`/`draggable`，API 更简洁
- **offset 越界**：始终用 `coerceIn` 限制偏移范围，防止内容滑出容器边界后无法回弹

## 最佳实践

1. **地图类场景**：优先使用 `scrollable2D` + 自定义 `Scrollable2DState` + fling 行为模拟惯性减速
2. **表格场景**：配合 `LazyColumn`/`LazyRow` 的单项滚动 + 外层 `scrollable2D` 做整体平移
3. **画布场景**：`draggable2D` 更适合，因为需要精确跟随手指，无惯性干扰
4. **性能注意**：`scrollable2DState` 的 lambda 在每次手势事件时都会被调用，避免在其中执行重计算
5. **与缩放（pinch-to-zoom）结合**：可叠加 `transformable` Modifier，同时支持拖拽和缩放

## 关联主题

- [LazyColumn / LazyRow](./lazy-list.md) — 列表滚动
- [Canvas 绘图](./canvas.md) — 自定义图形绘制
- [Box / Row / Column](./box-row-column.md) — 基础布局
