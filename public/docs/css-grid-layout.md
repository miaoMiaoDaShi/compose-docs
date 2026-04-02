# CSS Grid Layout（新版非惰性网格） 📐

> 摘要：Compose Foundation 引入了一套全新的非惰性二维网格布局 API —— `Grid`，灵感直接来自 CSS Grid，支持行轨道（row tracks）、列轨道（column tracks）、网格线（grid lines）、网格间隙（gap）和跨轨道布局。与 `LazyVerticalGrid` 不同，`Grid` 不会惰性加载内容，适合中等规模的固定内容布局。
>
> 适用版本：Jetpack Compose Foundation 1.11+（实验性）
>
> 更新时间：2026-04-02
>
> 标签：布局，Grid，CSS Grid，非惰性，二维网格

## 摘要

`Grid` 是 Compose Foundation 在 2025 年底/2026 年初引入的全新非惰性二维布局 API，与 CSS Grid 规范高度对齐。与 `LazyVerticalGrid` 的核心区别在于：它不采用惰性加载机制，适合中等规模（数十个以内）的固定网格内容，常见于仪表盘、小型图册和结构化配置界面。

## 核心概念

### 与 LazyGrid 的区别

| 维度 | `Grid`（新） | `LazyVerticalGrid` |
|------|-------------|-------------------|
| 加载方式 | 非惰性，一次性组合 | 惰性，按需组合可见项 |
| 适用规模 | 中等（< 100 项） | 大规模列表 |
| 行轨道 | 支持 `rows` 定义高度 | 仅列定义（`columns`） |
| 跨行/列 | `gridItem(rowSpan, columnSpan)` | `span` 参数 |
| Gap | 原生支持 | 需手动 padding |
| 实验性 | 是（`@ExperimentalGridApi`） | 否（稳定） |

### 网格术语对照

- **Grid Line（网格线）**：构成网格边界的水平线和垂直线。3 行网格有 4 条水平网格线。
- **Grid Track（网格轨道）**：两条相邻网格线之间的区域，分为行轨道和列轨道。
- **Grid Cell（网格单元格）**：行轨道和列轨道的交集，即单个网格区域。
- **Grid Area（网格区域）**：由跨多行/多列组成的区域，通过 `gridItem(rowSpan, columnSpan)` 定义。
- **Grid Gap（网格间隙）**：相邻轨道之间的间距。

## 关键 API

### Grid 作用域主函数

```kotlin
@Composable
fun Grid(
    rows: GridCells,
    columns: GridCells,
    modifier: Modifier = Modifier,
    contentPadding: PaddingValues = PaddingValues(0.dp),
    horizontalArrangement: Arrangement.Horizontal = Arrangement.spacedBy(0.dp),
    verticalArrangement: Arrangement.Vertical = Arrangement.spacedBy(0.dp),
    content: GridScope.() -> Unit
)
```

### GridScope.gridItem — 放置网格项

```kotlin
// GridScope
fun Modifier.gridItem(
    row: Int = GridIndexUnspecified,        // 行轨道索引（从 1 开始）
    column: Int = GridIndexUnspecified,     // 列轨道索引
    rowSpan: Int = 1,                        // 跨行数
    columnSpan: Int = 1,                     // 跨列数
    alignment: Alignment = Alignment.TopStart
): Modifier
```

`row` / `column` 参数接受正数（从起始计算）和负数（从末尾计算，`-1` 为最后一行/列）。

### GridCells 划分方式

```kotlin
// 固定列数
GridCells.Fixed(count: Int)

// 自适应宽度（根据最小宽度自动计算列数）
GridCells.Adaptive(minSize: Dp)

// 等分（指定确切轨道大小）
GridCells.FixedSize(size: Dp)
```

## 示例代码

### 基本等高网格

```kotlin
@OptIn(ExperimentalGridApi::class)
@Composable
fun BasicGridExample() {
    Grid(
        rows = GridCells.Fixed(3),     // 3 行
        columns = GridCells.Fixed(3), // 3 列
        modifier = Modifier.padding(16.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        repeat(9) { index ->
            GridItem(
                modifier = Modifier
                    .size(100.dp)
                    .background(Color.LightGray)
            ) {
                Text(
                    text = "Item ${index + 1}",
                    modifier = Modifier.padding(8.dp)
                )
            }
        }
    }
}
```

### 使用 gridItem 跨行/跨列

```kotlin
@OptIn(ExperimentalGridApi::class)
@Composable
fun SpanningGridExample() {
    Grid(
        rows = GridCells.Fixed(3),
        columns = GridCells.Fixed(3),
        modifier = Modifier.padding(16.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // 占据 2x2 区域的卡片
        gridItem(
            row = 1, column = 1,
            rowSpan = 2, columnSpan = 2
        ) {
            Card(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Cyan)
            ) {
                Text("2x2 Card", modifier = Modifier.padding(8.dp))
            }
        }

        // 普通 1x1 项
        gridItem(row = 1, column = 1) {
            Box(Modifier.size(100.dp).background(Color.LightGray))
        }
    }
}
```

### 自适应网格（响应式）

```kotlin
@OptIn(ExperimentalGridApi::class)
@Composable
fun AdaptiveGridExample() {
    Grid(
        columns = GridCells.Adaptive(minSize = 120.dp), // 每列最小 120dp
        modifier = Modifier.padding(16.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items.forEach { item ->
            gridItem {
                CardItem(item)
            }
        }
    }
}
```

### 使用 Grid Gap

```kotlin
@OptIn(ExperimentalGridApi::class)
@Composable
fun GappedGrid() {
    // horizontalArrangement / verticalArrangement 控制 gap
    Grid(
        rows = GridCells.Fixed(2),
        columns = GridCells.Fixed(2),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // ...
    }
}
```

## GridScope 可用 Modifier

| Modifier | 说明 |
|----------|------|
| `gridItem(row, column, rowSpan, columnSpan, alignment)` | 核心 API，定义网格项位置 |
| `width` / `height` | 控制项的基础尺寸 |
| `align` | 在网格单元格内的对齐方式 |
| `fillMaxSize` | 填满整个网格区域 |

## 常见误区

- 将 `Grid` 用于超大规模列表 —— 应该用 `LazyVerticalGrid`
- 忘记 `Grid` 为非惰性，所有子项在组合阶段全部创建
- 在不需要二维布局的场景强行使用 Grid，增加复杂性
- 未对 `gridItem` 的 `row`/`column` 索引边界做校验

## 最佳实践

- **规模判断**：内容项少于 ~50 个且不需要滚动时，考虑 `Grid`
- **轨道规划**：使用 `GridCells.Adaptive` 做响应式列数自适应
- **跨行布局**：`gridItem(rowSpan, columnSpan)` 实现复杂仪表盘面板
- **配合滚动**：`Grid` 本身不滚动，可以放在 `LazyColumn` 或 `ScrollableColumn` 中实现滚动网格
- **实验性注意**：使用 `@OptIn(ExperimentalGridApi::class)` 注解，并在稳定版发布前注意 API 变化

## 关联主题

- [LazyColumn / LazyRow](./lazy-list.md)
- [Lazy Grid 网格布局](./lazy-grid.md)
- [Material 3 自适应布局](./material3.md)
- [布局组件 Box / Row / Column](./box-row-column.md)
