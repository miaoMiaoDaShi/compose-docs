# Material 3 Expressive 表情化设计 💅

> 摘要：Material 3 Expressive 是 Google 在 I/O 2025 推出的 Material Design 3 重大更新，引入了 FABMenu、ButtonGroup、SplitButton、LoadingIndicator、Toolbars 等新组件，以及 M3 Motion Theming 运动主题系统，帮助开发者构建更具情感连接和个性表达的 UI。
>
> 适用版本：Material 3 Compose 1.4.0+（稳定），Compose 1.11+（配合 Motion Theming）
>
> 更新时间：2026-04-01
>
> 标签：Material3，组件，动画，M3Express，FABMenu，ButtonGroup，MotionTheming

## 核心概念

Material 3 Expressive（简称 M3 Expressive）是 Material Design 的最新进化阶段，核心目标是让 UI 不只是"能用"，而是"有情感连接"。

**三大设计方向：**
- **Hierarchy（层次）**：更好的视觉层次，让用户一眼找到关键信息
- **Usefulness（实用）**：界面更易用，交互更自然
- **Personal Style（个性）**：支持更多品牌表达空间，通过颜色、形状、运动表达品牌调性

M3 Expressive 在 Compose 中落地为一系列新组件和新的 Motion Theming API，全部基于 Compose Material 3 库，不需要额外依赖。

## 新增组件一览

| 组件 | 说明 | 状态 |
|------|------|------|
| `FABMenu` | 从 FAB 展开多个关联操作的浮动菜单 | 稳定（May 2025） |
| `ButtonGroup` | 分组按钮，支持单选/多选，动画宽度变化 | 稳定（May 2025） |
| `SplitButton` | 主按钮 + 分离式菜单按钮组合 | 稳定（May 2025） |
| `LoadingIndicator` | 统一加载指示器（新样式） | 稳定（May 2025） |
| `Toolbars` | 新增 Toolbar 组件变体 | 稳定（May 2025） |
| Motion Theming | 通过 MaterialTheme 配置过渡动画风格 | Compose 1.11+ |

## FABMenu — 浮动操作菜单

FABMenu 替代了曾经的 Speed Dial（速度拨号）设计，适合从 FAB 展开 2~6 个关联操作。

**使用场景：**
- 地图应用的"当前位置"+"收藏"+"导航"操作组
- 文档应用的新建+"新建文档"/"新建文件夹"/"导入"
- 任何需要将次要操作折叠到主操作按钮下的场景

```kotlin
// 基础 FABMenu 用法
var expanded by remember { mutableStateOf(false) }

FABMenu(
    expanded = expanded,
    onExpandedChange = { expanded = it }
) {
    // FAB 主体按钮
    smallFAB(
        onClick = { /* 主操作 */ }
    ) {
        Icon(Icons.Default.Add, contentDescription = "Add")
    }

    // 展开的子项（支持 2~6 个）
    extendedFAB(
        onClick = { /* 操作1 */ },
        modifier = Modifier.fabAlignment(Alignment.End)
    ) {
        Icon(Icons.Default.Create, contentDescription = null)
        Text("新建文档")
    }

    floatingActionButton(
        onClick = { /* 操作2 */ }
    ) {
        Icon(Icons.Default.Folder, contentDescription = null)
    }

    floatingActionButton(
        onClick = { /* 操作3 */ }
    ) {
        Icon(Icons.Default.Upload, contentDescription = null)
    }
}
```

**展开动画行为：**
- 子 FAB 按顺序依次弹出，带有 spring 物理效果的位移
- 点击外部或再次点击 FAB 自动收起
- 收起时子项反向依次回归

**注意事项：**
- 最多支持 6 个子项
- 子项内容可以是 `smallFAB`、`extendedFAB` 或 `floatingActionButton`
- 使用 `fabAlignment` 控制对齐方式

## ButtonGroup — 分组按钮

ButtonGroup 将多个按钮组合在一起，支持**单选模式**（类似 Segmented Button）和**多选模式**，并且按钮被点击时会有**宽度动画**效果（Expanded Width Animation）。

**单选模式（Radio）:**

```kotlin
val selectedIndex by remember { mutableIntStateOf(0) }

ButtonGroup(
    buttons = listOf("最新", "最热", "关注"),
    selectedIndex = selectedIndex,
    onButtonClick = { index -> selectedIndex = index },
    // 或使用 modifier 控制样式
    modifier = Modifier.buttonGroupSelectable()
)
```

**多选模式（Checkbox）:**

```kotlin
val checked = remember { mutableStateListOf(0, 2) }

ButtonGroup(
    buttons = listOf("Android", "iOS", "Web", "Desktop"),
    checkedIndices = checked,
    onCheckedChange = { index, isChecked ->
        if (isChecked) checked.add(index) else checked.remove(index)
    },
    selectionMode = ButtonGroupSelectionMode.Multiple
)
```

**动画宽度效果：**
当 ButtonGroup 中某个按钮被选中时，被选中的按钮会**自动扩展宽度**，从视觉上强调当前激活项。这个动画由 `AnimatedWidth` Modifier 实现。

```kotlin
// 如果需要手动控制动画宽度
Button(
    modifier = Modifier.animateContentWidth(animationSpec = spring())
) {
    Text("选中项")
}
```

**使用场景：**
- 筛选栏：最新 / 最热 / 关注
- 视图切换：列表 / 网格 / 日历
- 排序选项：时间 / 评分 / 距离

## SplitButton — 分离按钮

SplitButton 将一个主按钮和一个下拉菜单按钮组合在一起，主按钮执行主要操作，菜单按钮展开更多选项。

```kotlin
var expanded by remember { mutableStateOf(false) }
var selectedOption by remember { mutableStateOf("分享") }

SplitButton(
    onClick = { /* 主操作：使用当前 selectedOption */ },
    menuContent = {
        DropdownMenuItem(
            text = { Text("分享") },
            onClick = {
                selectedOption = "分享"
                expanded = false
            }
        )
        DropdownMenuItem(
            text = { Text("转发") },
            onClick = {
                selectedOption = "转发"
                expanded = false
            }
        )
        DropdownMenuItem(
            text = { Text("收藏") },
            onClick = {
                selectedOption = "收藏"
                expanded = false
            }
        )
    },
    modifier = Modifier.splitButtonMenuAnchor(AnchorType.Primary)
) {
    Icon(Icons.Default.Share, contentDescription = null)
    Text(selectedOption)
    Icon(Icons.Default.ArrowDropDown, contentDescription = null)
}
```

**Menu Anchor 控制：**
- `AnchorType.Primary`：菜单以主按钮为锚点展开
- `AnchorType.Secondary`：菜单以菜单按钮为锚点展开

**使用场景：**
- 分享按钮：主操作"分享到..." + 菜单"更多分享选项"
- 导出按钮：主操作"导出" + 菜单"PDF/Word/纯文本"
- 排序按钮：主操作"排序" + 菜单具体排序规则

## LoadingIndicator — 统一加载指示器

M3 Expressive 推出了统一的 `LoadingIndicator` 组件，替代原来的 `CircularProgressIndicator` 和 `LinearProgressIndicator` 的部分用法，提供更一致的视觉风格。

```kotlin
// 基本用法
LoadingIndicator()

// 自定义样式（Material 3 Expressive 支持更多变体）
LoadingIndicator(
    modifier = Modifier.size(48.dp),
    style = LoadingIndicatorStyle.Circular,
    color = MaterialTheme.colorScheme.primary
)

// 配合 Box 使用（覆盖内容加载状态）
Box(modifier = Modifier.fillMaxSize()) {
    // 内容
    LoadingIndicator(
        modifier = Modifier.align(Alignment.Center),
        style = LoadingIndicatorStyle.Circular
    )
}
```

**注意**：`LoadingIndicator` 仍与 `CircularProgressIndicator`/`LinearProgressIndicator` 并存，前者更适合通用加载场景，后者保留了具体进度值（0.0~1.0）展示功能。

## Toolbars — 新增工具栏变体

M3 Expressive 在原有 Toolbar API 基础上增加了更多工具栏变体，包括：
- **Prominent Toolbar**：标题更突出的高大工具栏
- **Medium Toolbar**：介于普通和 Prominent 之间的高度
- **Bottom Toolbar**：底部工具栏模式

```kotlin
// Medium Toolbar（适合过渡场景）
MediumTopAppBar(
    title = { Text("我的文档") },
    navigationIcon = {
        IconButton(onClick = onBack) {
            Icon(Icons.Default.ArrowBack, contentDescription = "返回")
        }
    },
    colors = TopAppBarDefaults.mediumTopAppBarColors(
        containerColor = MaterialTheme.colorScheme.surface
    )
)

// Bottom Toolbar
BottomAppBar(
    actions = {
        IconButton(onClick = { /* 分享 */ }) {
            Icon(Icons.Default.Share, contentDescription = "分享")
        }
        IconButton(onClick = { /* 更多 */ }) {
            Icon(Icons.Default.MoreVert, contentDescription = "更多")
        }
    },
    floatingActionButton = {
        FloatingActionButton(onClick = { /* 新建 */ }) {
            Icon(Icons.Default.Add, contentDescription = "新建")
        }
    }
)
```

## Motion Theming — 运动主题（M3 Expressive 核心）

Motion Theming 是 M3 Expressive 的核心技术升级，允许开发者通过 `MaterialTheme` 统一配置整个应用的动画风格，而不是为每个动画单独配置参数。

### 为什么需要 Motion Theming？

传统做法中，每个 `animateContentSize`、`AnimatedVisibility` 都要单独配置 `animationSpec`，导致：
- 大量重复的动画参数散落在各处
- 主题风格不统一
- 维护困难

Motion Theming 通过 `AnimationDuration`、`AnimationEasing`、`AnimationSpec` 等 tokens，让所有动画遵循同一个主题规范。

### 在 Compose 中使用（Compose 1.11+）

```kotlin
// 1. 定义 Motion Theming 配置
private val M3ExpressiveMotion = MotionTheming(
    duration = MotionDuration(
        emphasis = Duration.emphasized,
        attention = Duration.attention,
        medium = Duration.medium,
        short = Duration.short
    ),
    easing = MotionEasing(
        emphasis = Easing.emphasizedEasing,
        attention = Easing.emphasizedDecelerateEasing,
        standard = Easing.standardEasing
    )
)

// 2. 应用到主题
MaterialTheme(
    motionTheming = M3ExpressiveMotion,
    colorScheme = MaterialTheme.colorScheme,
    typography = MaterialTheme.typography
)

// 3. 动画自动使用主题配置
var expanded by remember { mutableStateOf(false) }

// 这些动画现在会自动使用 MotionTheme 中定义的规格
AnimatedVisibility(
    visible = expanded,
    label = "fab_menu"
) {
    // 展开内容
}
```

### 预置 Motion Theming 风格

Material 3 提供了几种预置风格：

| 风格 | 特点 | 适用场景 |
|------|------|----------|
| `MotionTheming.standard` | 标准过渡速度 | 普通内容切换 |
| `MotionTheming.expressive` | 更长、更夸张的动画 | 强调交互反馈的品牌化 UI |
| `MotionTheming.attention` | 快速短促 | 微交互、点击反馈 |

```kotlin
// 使用 Expressive 风格
MaterialTheme(
    motionTheming = MotionTheming.expressive,
    colorScheme = dynamicColorScheme,
    typography = MaterialTheme.typography
)
```

### 自定义 Motion Duration

```kotlin
private val CustomMotion = MotionTheming(
    duration = MotionDuration(
        short = 100.ms,
        medium = 250.ms,
        emphasis = 400.ms,
        attention = 600.ms
    )
)
```

## 最佳实践

1. **FABMenu 不要滥用**：控制在 2~6 个子项，过多应该考虑用 `NavigationBar` 或 `Drawer`
2. **ButtonGroup 优先单选模式**：多选模式在移动端容易引起误操作
3. **SplitButton 用于高频操作组合**：适合工具栏类场景，不适合表单内
4. **Motion Theming 统一优先**：不要在单独组件上手动覆盖 `animationSpec`，优先用主题配置
5. **渐进使用 Motion Theming**：如果项目不需要整体动画风格改变，不需要强制迁移

## 常见误区

- 把所有操作都塞进 FABMenu → 正确做法：只放最核心的 2~6 个操作
- ButtonGroup 动画导致误触 → 动画宽度变化是可选的，可通过 `ButtonGroupDefaults` 关闭
- Motion Theming 覆盖了重要交互反馈 → Motion Theming 只影响"过渡动画"，不影响 `InteractionSource` 产生的即时反馈（如按压变色）
- M3 Expressive 与旧版 Material 2 不兼容 → 新组件是 Material 3 的一部分，需要迁移到 Material 3 才能使用

## 关联主题

- [Material 3 自适应布局](./material3.md) — WindowSizeClass 与 M3 自适应联动
- [Compose 动画 API 进阶](./animation.md) — AnimatedVisibility 和 Veil Transitions
- [性能优化指南](./performance-guide.md) — 动画性能注意事项
