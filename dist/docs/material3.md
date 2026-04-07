# Material 3 自适应布局 📱

> 摘要：Material 3 的自适应布局能力帮助 Compose 页面在手机、平板和大屏上维持一致体验。通过 WindowSizeClass 分类、ListDetailPaneScaffold / ThreePaneScaffold 双栏/三栏布局和 Predictive Back 手势支持，实现真正的多设备自适应。
>
> 适用版本：Material 3 1.1+ / Compose BOM 2024.02.00+
>
> 更新时间：2026-04-02
>
> 标签：Material3，自适应，大屏，WindowSizeClass，三栏布局，预测性返回

## 核心概念

现代 Android 界面不再只面向单一手机尺寸。Material 3 强调根据窗口尺寸动态调整布局层级、面板数量和导航形式，让同一套界面在不同设备上都能保持可读性与操作效率。

## WindowSizeClass 窗口尺寸分类

`WindowSizeClass` 将可用显示区域分为三个宽度类别和三个高度类别：

| 类别 | 断点 | 典型设备 |
|------|------|---------|
| Compact | < 600dp | 手机竖屏 |
| Medium | 600dp ~ 840dp | 手机横屏、小平板 |
| Expanded | > 840dp | 大平板、桌面 |

> **重要**：`WindowSizeClass` 分类的是窗口可用空间，而非物理屏幕尺寸。分屏模式、折叠屏展开状态都会影响实际窗口尺寸。

**响应式 UI 的核心思路：**

```
宽度变化 → 布局结构变化（不是等比缩放）
高度变化 → 内容重组或滚动策略调整
```

## ListDetailPaneScaffold 双栏布局

适合"列表 + 详情"的主从式交互，是平板和大屏手机上最常见的自适应模式。

```kotlin
import androidx.compose.material3.windowsizeclass.WindowSizeClass
import androidx.compose.material3.windowsizeclass.calculateWindowSizeClass
import androidx.compose.material3自适应.ListDetailPaneScaffold

@Composable
fun AdaptiveListDetailScreen(windowSizeClass: WindowSizeClass) {
    ListDetailPaneScaffold(
        paneCoordinator = if (windowSizeClass.widthSizeClass == WindowWidthSizeClass.Compact) {
            ListDetailPaneScaffoldRole.Detail
        } else {
            ListDetailPaneScaffoldRole.Primary
        },
        listPane = {
            ListPaneContent()
        },
        detailPane = {
            DetailPaneContent()
        },
        modifier = Modifier.fillMaxSize()
    )
}
```

**PaneWidthConstraints 限制面板宽度：**

```kotlin
ListDetailPaneScaffold(
    listPane = { ListPane() },
    detailPane = { DetailPane() },
    paneWidthConstraints = PaneWidthConstraints(
        preferredPrimaryPaneWidth = 400.dp,  // 首选宽度
        minPrimaryPaneWidth = 280.dp,          // 最小宽度（拖拽下限）
        maxPrimaryPaneWidth = 600.dp           // 最大宽度（拖拽上限）
    )
)
```

**三栏布局（ThreePaneScaffold, Material3 Adaptive 1.0+）：**

```kotlin
import androidx.compose.material3.adaptive.currentWindowAdaptiveInfo
import androidx.compose.material3.adaptive.layout.ThreePaneScaffold
import androidx.compose.material3.adaptive.layout.ThreePaneScaffoldRole

@Composable
fun ThreeColumnLayout() {
    val adaptiveInfo = currentWindowAdaptiveInfo()

    ThreePaneScaffold(
        scaffoldRoles = listOf(
            ThreePaneScaffoldRole.Primary,    // 主列表（如邮件列表）
            ThreePaneScaffoldRole.Secondary,  // 详情预览（如邮件内容）
            ThreePaneScaffoldRole.Tertiary    // 附加信息（如附件列表）
        ),
        paneOrder = if (adaptiveInfo.windowSizeClass.widthSizeClass == WindowWidthSizeClass.Expanded) {
            // 三栏横向排列（桌面大屏）
            PaneOrder(secondary = PaneScaffoldExpanded)
        } else {
            // 移动端收起次级面板
            PaneOrder()
        }
    ) { roles ->
        roles[ThreePaneScaffoldRole.Primary]?.let { ListPane(it) }
        roles[ThreePaneScaffoldRole.Secondary]?.let { DetailPane(it) }
        roles[ThreePaneScaffoldRole.Tertiary]?.let { ExtraPane(it) }
    }
}
```

## Predictive Back（预测性返回）

Android 13+ 引入了**预测性返回**手势，用户在返回时可以看到目标页面的预览。Compose Navigation 对此有内置支持，同时 `ThreePaneScaffoldPredictiveBackHandler` 为三栏布局提供了专门的预测性返回集成。

```kotlin
import androidx.compose.material3.adaptive.navigation.ThreePaneScaffoldPredictiveBackHandler

@Composable
fun AdaptiveLayoutWithPredictiveBack() {
    val navigator = rememberListDetailPaneScaffoldNavigator()
    val backHandler = rememberPredictiveBackHandler()

    // 方式一：三栏布局的预测性返回支持
    ThreePaneScaffoldPredictiveBackHandler(
        navigator = navigator,
        backNavigationBehavior = BackNavigationBehavior.CloseAndNavigateToRoot
    )

    // 方式二：自定义预测性返回（可用于非 Scaffold 场景）
    val scope = rememberCoroutineScope()
    PredictiveBackHandler(
        onBack = {
            // 真正的返回操作
            scope.launch {
                navController.popBackStack()
            }
        },
        backAnimation = predictiveBackAnimation(
            fallbackOnBack = { onBackDispatcher.onBack() }
        )
    )
}
```

**在 Navigation Compose 中使用预测性返回：**

```kotlin
NavHost(navController = navController, startDestination = "home") {
    composable("detail/{itemId}") { backStackEntry ->
        val args = backStackEntry.toRoute<DetailRoute>()

        // Navigation Compose 自动支持预测性返回动画
        // 只需正常声明 navigation，不需要额外配置
        DetailScreen(
            itemId = args.itemId,
            onBack = { navController.popBackStack() }
        )
    }
}
```

**Material3 ModalBottomSheet 的预测性返回：**

`ModalBottomSheet` 自动支持预测性返回手势，用户从底部上滑时可以看到目标页面的预览：

```kotlin
var showSheet by remember { mutableStateOf(false) }
val sheetState = rememberModalBottomSheetState()

ModalBottomSheet(
    onDismissRequest = { showSheet = false },
    sheetState = sheetState,
    // 预测性返回自动启用
) {
    SheetContent()
}
```

## 综合示例：基于 WindowSizeClass 的完整自适应布局

```kotlin
@Composable
fun AdaptiveApp(
    windowSizeClass: WindowSizeClass = calculateWindowSizeClass()
) {
    when (windowSizeClass.widthSizeClass) {
        WindowWidthSizeClass.Compact -> {
            // 手机单栏：底部导航 + 全屏内容
            CompactLayout()
        }
        WindowWidthSizeClass.Medium -> {
            // 中等宽度：ListDetailPane 双栏
            MediumLayout()
        }
        WindowWidthSizeClass.Expanded -> {
            // 大屏：三栏布局
            ExpandedLayout()
        }
    }
}

@Composable
private fun CompactLayout() {
    Scaffold(
        bottomBar = { NavigationBar { /* 导航项 */ } }
    ) { padding ->
        ListPaneContent(Modifier.padding(padding))
    }
}

@Composable
private fun MediumLayout() {
    ListDetailPaneScaffold(
        listPane = { ListPane() },
        detailPane = { DetailPane() }
    )
}

@Composable
private fun ExpandedLayout() {
    Row(modifier = Modifier.fillMaxSize()) {
        // 固定侧边导航
        NavigationRail { /* */ }
        // 三栏内容
        LazyColumn(modifier = Modifier.weight(1f)) { /* */ }
        LazyColumn(modifier = Modifier.weight(2f)) { /* */ }
    }
}
```

## 常见误区

- 只做手机单栏布局，然后把大屏强行拉伸：应该改变布局结构而非等比缩放
- 把"响应式"和"自适应"混为一谈，忽略交互结构调整
- 不区分内容密度，直接把所有内容都塞进双栏或三栏
- 假设 WindowSizeClass 永远不变：分屏模式、折叠屏展开/收起、窗口调整都会触发变化

## 最佳实践

- **用 `calculateWindowSizeClass()` 而非手动 `LocalConfiguration`**，确保与 Android 系统窗口管理同步
- **用 `rememberUpdatedState`** 包装 WindowSizeClass 依赖的回调，防止闭包过期
- **Pane 宽度用约束而非固定值**，支持拖拽调整并在大屏和小屏上都合理
- **预测性返回应在所有返回路径上启用**，包括 Navigation、BottomSheet、Dialog
- **用 `LocalWindowSizeClass`** 在子组件中访问尺寸信息，避免层层传递

## 关联主题

- [Navigation Compose 3.0](./navigation.md)
- [Navigation Compose 进阶技巧](./nav-advanced.md)
- [Material 3 Expressive 表情化设计](./m3-expressive.md)
- [性能优化指南](./performance-guide.md)

## 关联主题

- [布局组件 Box / Row / Column](./box-row-column.md)
- [Navigation Compose 3.0](./navigation.md)
- [平台集成总览](./platform.md)
