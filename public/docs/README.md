# Compose 文档索引
> 最后更新: 2026-04-04 12:00
## 使用说明
这个目录现在只承担索引与维护入口，不再直接承载所有知识点正文。
- `README.md` 负责分类导航、最近更新和维护入口。
- 每个知识点尽量落在单独的 `.md` 文件中，便于持续追加和去重。
- 后续自动化整理请优先参考维护资源中的规范与提示词模板。
## 分类导航
### 基础入门
- [@Composable 函数](./composable.md) - Compose 声明式 UI 的入口与最小构建单元。
- [remember / mutableStateOf](./state.md) - 组件内状态保存与触发重组的基础机制。
- [布局组件 Box / Row / Column](./box-row-column.md) - 三个最常用基础布局的使用方式与对齐参数。
- [Modifier 修饰符](./modifier.md) - 控制外观、布局与交互行为的链式修饰系统。
- [Material Ripple 波纹效果](./material-ripple.md) - Compose Material 1.11 新增独立 ripple 库，支持非 Material 应用轻量使用波纹交互。
### 状态与副作用
- [StateFlow / collectAsState](./stateflow.md) - ViewModel 状态流与 Compose 状态桥接方式。
- [可组合项生命周期与重组](./lifecycle.md) - 理解组合、重组与销毁过程中的身份和更新规则。
- [rememberCoroutineScope & LaunchedEffect](./coroutine-scope.md) - 在 Compose 中安全启动协程与处理副作用。
- [derivedStateOf 性能优化](./derived-state.md) - 用派生状态减少不必要的 UI 更新。
- [Retain API 状态保留](./retain-api.md) - Compose 运行时新 API，填补 remember 与 rememberSaveable 之间的能力空白。
- [Pull-to-Refresh 拉至刷新](./pull-to-refresh.md) - Material3 官方 PullToRefreshBox API，基于嵌套滚动实现下拉刷新。
### 布局
- [Material 3 自适应布局](./material3.md) - WindowSizeClass 分类、ListDetailPaneScaffold / ThreePaneScaffold 双栏/三栏布局与 Predictive Back 预测性返回手势完整指南。
- [Material 3 Expressive 表情化设计](./m3-expressive.md) - I/O 2025 新组件（FABMenu、ButtonGroup、SplitButton、LoadingIndicator、Toolbars）及 M3 Motion Theming 运动主题系统。
### 绘制
- [Shadow Modifiers - 阴影渲染](./shadow-modifiers.md) - Compose 1.9 引入的 dropShadow 和 innerShadow 高级阴影效果。
- [Canvas 绘图与自定义图形](./canvas.md) - 使用 Canvas API 绘制基础图形与自定义视觉效果。
- [Brush 与 Graphics API](./graphics-brush.md) - 渐变填充、纯色 Brush 与 GraphicsLayer 图层变换。
- [Scrollable2D 与 Draggable2D 双向滚动](./scrollable-2d.md) - Compose 1.9 引入的双轴滚动 API，支持水平+垂直方向同时滚动，适用于地图、表格和图片查看器。
### 文本
- [Autofill 原生支持](./autofill.md) - Compose 1.8 原生 autofill API，实现表单自动填充功能。
- [富文本与 AnnotatedString](./rich-text.md) - 局部文字样式、高亮和混合排版的常见做法。
- [TextFieldState 与输入输出转换](./text-field-state.md) - Material 3 1.4 全新的状态化 TextField API：`TextFieldState` 替代 `value`/`onValueChange`，`InputTransformation` 拦截输入，`OutputTransformation` 改变视觉呈现。
### 列表
- [Visibility Tracking 可见性跟踪](./visibility-tracking.md) - Compose 1.8 引入的可见性监听 API，用于分析和懒加载。
- [Modifier.visible() 可见性控制](./visibility-control.md) - Compose 1.11 引入的可见性控制 API，隐藏元素时保留布局空间并跳过绘制阶段。
- [CSS Grid Layout（非惰性网格）](./css-grid-layout.md) - Compose Foundation 全新 CSS Grid 风格非惰性二维布局 API，支持行/列轨道、网格线、跨行跨列和 Gap，适用于中等规模固定网格内容（GridCells API + GridScope.gridItem）。
- [LazyColumn / LazyRow](./lazy-list.md) - 大列表渲染、键值优化与滚动状态控制。
- [Lazy Grid 网格布局](./lazy-grid.md) - 多列卡片流、图库和网格滚动的基础能力。
### 导航与动画
- [Navigation Compose 3.0](./navigation.md) - 基础导航图、参数传递、路由组织与 Predictive Back 手势集成（Navigation 3 + Material3 Adaptive）。
- [Navigation 3 NavDisplay 与声明式返回栈](./nav-display-n3.md) - Navigation 3 新 API：`rememberNavBackStack` + `NavDisplay` + `entry()` DSL，返回栈即 `SnapshotStateList` 的声明式导航范式，Scenes API 原生多窗格布局支持，以及从 Nav2 到 Nav3 的完整迁移路径。
- [Predictive Back Gesture 与 Compose 集成](./predictive-back.md) - Android 13+ Predictive Back 手势与 Compose 完整集成指南：PredictiveBackHandler 手动进度访问、Navigation Compose 2.8+ 内置支持、SharedElement 联动、M3 组件内置动画支持及从 onBackPressed 的迁移路径。
- [Compose 动画 API 进阶](./animation.md) - 常用动画状态 API 与过渡组合方式，含 Veil Transitions（幕布过渡）详解。
- [共用元素过渡动画](./shared-element.md) - 列表到详情页的共享元素动画能力，含条件化启用与初速度支持（Compose 1.10+）。
### 性能优化
- [性能优化指南](./performance-guide.md) - 构建配置、重组控制与 Lazy 布局优化建议。
- [Kotlin 2.x & Compose 性能优化](./kotlin2.md) - Kotlin 2.x 系列（2.0/2.2/2.3）Strong Skipping、Pausable Composition、Stability Configuration File 与 Compose December 2025 性能改进详解。
- [Modifier.Node 高性能自定义组件](./modifier-node.md) - 高性能自定义修饰符的底层机制与适用场景。
- [Compose 1.11 Breaking Changes](./compose-1-11-changes.md) - Compose 1.11 版本 DrawLayer API 重命名（outlineShape→shape）、文本首行/末行 padding 移除、SwipeToReveal slot API 变更、Modifier.visible() 新增、LookaheadAnimationVisualDebugging、Shared Context for ComposeView 等完整变更详解与迁移指南，含 Modifier.onFirstVisible 弃用通知。
- [Compose December 2025 (1.10) Release 技术解读](./compose-1-10-highlights.md) - Compose 1.10 重大版本技术详解：滚动性能与 Views 持平、Pausable Composition 默认启用、Veil Transitions 幕布过渡动画、Shared Element 条件化启用与初速度支持、Modifier.onFirstVisible 弃用、StandardTestDispatcher 默认化及 Material 3 1.4 新增组件。
### 平台与工程
- [Compose Multiplatform 跨平台开发](./compose-multiplatform.md) - 用同一套 Kotlin 代码覆盖 Android / iOS / Desktop / Web 四端的跨平台开发指南。
- [RemoteCompose 服务器驱动 UI](./remote-compose.md) - AndroidX 新范式：将 Compose UI 序列化传输到客户端原生渲染，支持动态内容、热修复和 A/B 测试。
- [Accompanist 工具库集](./accompanist.md) - 权限请求、系统 UI 控制、Drawable 渲染等官方未覆盖能力的补充工具库。
- [CameraX 与 Compose](./camerax-compose.md) - 在 Compose 页面中接入相机预览与生命周期管理。
- [Media3 播放器集成](./media3-compose.md) - 在 Compose 中承载播放器并管理播放状态。
- [Compose 拖放交互](./drag-and-drop.md) - 组织拖拽来源、投放目标与结果反馈。
- [Compose 测试最佳实践](./testing.md) - UI 测试、节点匹配与交互校验的基础套路。
- [Jetpack Compose XR 空间计算](./compose-xr.md) - Android XR SDK 声明式 UI 框架，用 Compose API 构建 SpatialPanel、Orbiter 等空间计算界面。
## 最近更新
- 2026-04-04：本周例行维护 — 新增 [Predictive Back Gesture 与 Compose 集成](./predictive-back.md)，详解 Android 13+ Predictive Back 手势与 Compose 的完整集成：**PredictiveBackHandler** 手动进度访问（非 Navigation 场景）、Navigation Compose 2.8+ 内置支持与 `popEnterTransition/popExitTransition` 联动、与 SharedBounds 共享元素动画的 Predictive Back 联动（从详情页手势返回列表页的连贯动画）、Material 3 组件内置 Predictive Back 支持（ModalBottomSheet、Dialog 等）以及从 `onBackPressed` 的完整迁移路径。同步大幅更新 [Compose 1.11 Breaking Changes](./compose-1-11-changes.md)，新增 **Modifier.visible()** 章节（Compose 1.11 新增 API，跳过绘制但保留布局空间的可见性控制，含性能优势、与 Predictive Back 动画结合示例），并重新编号后续章节（4→5→6）；README 分类索引同步新增 predictive-back.md 入口。
- 2026-04-04：本周例行维护 — 新增 [TextFieldState 与输入输出转换](./text-field-state.md)，详解 Material 3 1.4 / Compose Foundation 1.8 全新的状态化 TextField API：`TextFieldState` 对象替代 `value`/`onValueChange` 回调对，`InputTransformation` 拦截输入（如自动加单位、字符过滤），`OutputTransformation` 改变视觉呈现（如千分位格式化、密码遮蔽），ViewModel 持有状态实现关注点分离。同步更新 README 分类索引和关联主题。
- 2026-04-04：本周例行维护确认 — **Compose 最新稳定版仍为 1.10.6**（Compose BOM 2026.03.01），**Beta 版为 1.11.0-beta02**（2026-03-25）。Compose 1.11 正式稳定版尚待发布；Retain API 已完成 AOSP 审查随 1.11.0-beta01 稳定。所有既有文档知识点已覆盖本次扫描的新增内容，无需额外新增或修改。
- 2026-04-04：新增 [Navigation 3 NavDisplay 与声明式返回栈](./nav-display-n3.md)，详解 Navigation 3 引入的全新声明式导航范式：**`rememberNavBackStack`** + **`NavDisplay`** + **`entry()` DSL**。返回栈本身即 `SnapshotStateList<NavDestination>`，`backStack.add()` / `backStack.removeLastOrNull()` 替代命令式 `navController.navigate()`；Scenes API（`rememberSceneSetupNavEntryDecorator()`）原生支持 ListDetailPaneScaffold 多窗格布局；包含从 Nav2 到 Nav3 的完整迁移路径代码对照。
- 2026-04-03：新增 [Material Ripple 波纹效果](./material-ripple.md)，介绍 Compose Material 1.11 新增独立 `material-ripple` artifact，将波纹效果从 Material 主库剥离，支持非 Material 设计体系的应用独立使用 `ripple()` API 和 `RippleConfiguration` 全局配置，包含迁移指南、最佳实践和与 Indication 的关系说明。
- 2026-04-03：新增 [Scrollable2D 与 Draggable2D 双向滚动](./scrollable-2d.md)，详解 Compose 1.9（August 2025）引入的双轴滚动 API：`Scrollable2D`（支持 fling 惯性滑动，适合地图/图片查看器）和 `Draggable2D`（精确拖拽，适合棋盘/画布），包含与传统单轴修饰符对比、`rememberScrollable2DState` 创建方式、嵌套滚动协调和最佳实践。
- 2026-04-03：新增 [Visibility Tracking 可见性追踪](./visibility-tracking.md)，详解 Compose 1.8/1.9 的 `onFirstVisible` 和 `onVisibilityChanged` API：与旧方案（LaunchedEffect + scroll 监听）对比、曝光埋点/视频自动播放完整示例、`minDurationMs`/`minFractionVisible` 参数详解、与 CacheWindow 的互补关系说明。
- 2026-04-02：大幅更新 [Navigation Compose 进阶技巧](./nav-advanced.md)，重写完整内容：新增 **NavKey 接口机制**（编译期类型安全的核心原理、NavKey vs @Serializable 的关系、NavKeyValueParser 内部流程图）、**visibleBackStack API**（与 currentBackStackEntry 的区别、BottomBar 显示判断场景）、**跨目的地共享 ViewModel**（viewModel(parent.viewModelStoreOwner) 用法、promoteWithoutSaving）和**导航图模块化拆分**（按业务域分 NavGraph、子图独立测试）。同时更新 [Compose Multiplatform 跨平台开发](./compose-multiplatform.md)，新增 **官方模板归档事件**（compose-multiplatform-template 仓库 2026 年 3 月正式归档），说明归档原因、对项目的影响和推荐替代方案（KMPShip / Kotlin Multiplatform Wizard / 手动初始化）。
- 2026-04-02：大幅更新 [Material 3 自适应布局](./material3.md)，重写完整内容：新增 **WindowSizeClass 分类详解**（Compact/Medium/Expanded 三档）、**ListDetailPaneScaffold 完整示例**（含 PaneWidthConstraints 面板宽度约束）、**ThreePaneScaffold 三栏布局**（Material3 Adaptive 1.0+）、**Predictive Back 预测性返回手势**集成（ThreePaneScaffoldPredictiveBackHandler、ModalBottomSheet 自动支持、Navigation Compose 内置集成）、综合 **AdaptiveApp 完整代码示例**，分类标签和关联主题同步更新。
- 2026-04-02：更新 [Kotlin 2.x & Compose 性能优化](./kotlin2.md)，新增 **Stability Configuration File** 章节（Compose Compiler 1.5.5+），介绍编译期配置文件声明类稳定性的机制、与 @Stable/@Immutable 注解的对比、包级通配符用法、Stability Analyzer 验证工具和最佳实践；位置插入于 "Compose December 2025 Release 要点" 之前；README 描述同步更新。
- 2026-04-02：新增 [CSS Grid Layout（非惰性网格）](./css-grid-layout.md)，介绍 Compose Foundation 全新 CSS Grid 风格非惰性二维布局 API（`Grid` 主函数 + `GridScope.gridItem`），涵盖行/列轨道（`GridCells.Fixed/Adaptive`）、网格线（Grid Line）、网格间隙（Gap）、跨行跨列（`rowSpan`/`columnSpan`）和 `GridIndexUnspecified` 自动放置机制；补充与 `LazyVerticalGrid` 的核心区别和最佳实践。
- 2026-04-02：更新 [Retain API 状态保留](./retain-api.md)，标记 `retain` API 已随 **Compose 1.11.0-beta01 / BOM 2026.03.01** 正式稳定（runtime-retain artifact 完成 AOSP 审查），不再是"开发中"状态；同步更新 [性能优化指南](./performance-guide.md)，新增 **Modifier.onPlaced / onVisibilityChanged** 编译优化说明（Compose 1.10+ LazyColumn 滚动性能提升约 15%）、**Modifier.visible()** 用法示例（Compose 1.11+ 跳过绘制但保留布局空间）。
- 2026-04-02：更新 [Compose Multiplatform 跨平台开发](./compose-multiplatform.md)，新增三个 Compose Multiplatform 1.11.0-beta01 重要变更：**iOS Dialog/Popup 视图层级变更**（容器视图移至 SwiftUI Host 上方系统转场视图）、**Web 滚动性能大幅改进**（触控处理重构，滚动体验与原生平台持平）、**Shader API 重构**（从 Skia typealias 迁移至 Compose 封装类）及 Skiko M144 更新，同步记录 **Apple x86_64 目标正式移除**。
- 2026-04-01：新增 [Material 3 Expressive 表情化设计](./m3-expressive.md)，详解 I/O 2025 M3 Expressive 新组件：FABMenu（浮动操作菜单）、ButtonGroup（分组按钮，含单选/多选及动画宽度）、SplitButton（主按钮+菜单分离组合）、LoadingIndicator（统一加载指示器）、Toolbars（新增变体）以及 M3 Motion Theming 运动主题系统（Compose 1.11+），含各组件代码示例、最佳实践与避坑指南；同步大幅更新 [LazyColumn / LazyRow](./lazy-list.md)，新增 **CacheWindow** API（Compose 1.10 预取窗口）配合 Pausable Composition 分帧优化说明，以及 **`Modifier.skipToLookaheadPosition()`** 在共享元素过渡中的跳转用法。
- 2026-04-01：更新 [Compose 1.11 Breaking Changes](./compose-1-11-changes.md)，新增 **LookaheadAnimationVisualDebugging** 动画调试组件（Compose 1.11-alpha03+）章节，介绍该可视化调试 API 如何显示预测动画的 Approach Pass、Layout Pass 边界和 Offset/DpDelta，适用于 Veil Transitions 等复杂动画的精确调优；同步新增 **Shared Context for ComposeView** 章节，说明 `setContentWithSharedContext` API 的使用场景、收益和注意事项，适用于 Fragment 多 ComposeView、ViewPager2 等场景的内存优化。
- 2026-04-01：更新 [Kotlin 2.x & Compose 性能优化](./kotlin2.md)，新增 **Kotlin 2.3.20（2026 年 3 月）** 重要变更：`PausableComposition` 特性标志已在 Kotlin 2.3.20 中默认启用（无需 Gradle 配置），详细介绍分帧组合对 LazyColumn 预取机制的性能影响、源码级工作原理和低端设备优化收益。
- 2026-04-01：更新 [Compose Multiplatform 跨平台开发](./compose-multiplatform.md)，新增 **Common @Preview 统一预览注解**章节（Compose Multiplatform 1.10.0），介绍如何在 `commonMain` 中使用单一 `@Preview` 注解同时支持 Android / iOS / Desktop / Web 四端预览，解决历史遗留的多平台预览注解混乱问题。
- 2026-04-01：新增 [Pull-to-Refresh 拉至刷新](./pull-to-refresh.md) 文档，介绍 Material3 官方 `PullToRefreshBox` API、`PullToRefreshState` 状态管理、自定义指示器写法，以及与已废弃的 Accompanist `SwipeRefresh` 的区别对比。
- 2026-03-31：新增 [Jetpack Compose XR 空间计算](./compose-xr.md) 文档，介绍 Android XR SDK 声明式 UI 框架，涵盖 SpatialPanel 空间面板、SpatialRow/SpatialColumn 空间布局、Orbiter 跟随锚点、SpatialExternalSurface 立体渲染表面等核心 API，以及三星 XR / 联想 XR 等骁龙 XR3 设备支持。
- 2026-03-31：新增 [Modifier.visible() 可见性控制](./visibility-control.md) 文档，介绍 Compose 1.11 新增的 `Modifier.visible()` API，与 `alpha(0f)` 和条件渲染的区别，以及 skip drawing / 保留布局空间的使用场景。
- 2026-03-31：收录 Compose 1.11 Beta 新动态 — `Modifier.visible()` API（隐藏元素保留布局空间且跳过绘制）、`LookaheadAnimationVisualDebugging` 动画调试组件、AndroidX `xr.compose` 1.0.0-alpha12 for Spatial Computing。
- 2026-04-01：新增 [Compose December 2025 (1.10) Release 技术解读](./compose-1-10-highlights.md)，详解滚动性能与 Views 持平、Pausable Composition 默认启用、Veil Transitions 幕布过渡（AnimatedVisibility/AnimatedContent）、Shared Element 条件化启用与初速度支持（Compose 1.10+）、StandardTestDispatcher 默认化等重大更新。同步更新 [动画 API 进阶](./animation.md)、[共用元素过渡](./shared-element.md)、[测试最佳实践](./testing.md) 和 [Compose 1.11 Breaking Changes](./compose-1-11-changes.md)（新增 Modifier.onFirstVisible 弃用通知）。
- 2026-03-31：新增 [Compose 1.11 Breaking Changes](./compose-1-11-changes.md) 文档，详细记录 DrawLayer API 重命名（`outlineShape` → `shape`、`clipToOutline` → `clip`、`clipToBounds` 移除）、文本首行/末行 padding 移除、SwipeToReveal 改为 Slot-based API 等 Breaking Changes，并提供迁移检查清单。
- 2026-03-31：大幅更新 [Compose Multiplatform 跨平台开发](./compose-multiplatform.md)，新增 Hot Reload 1.0.0 正式版章节（内置插件、默认启用、Desktop 端支持）和 Navigation 3 非 Android 平台支持章节（iOS/Desktop/Web 统一 API、类型安全路由、跨平台深层链接）。
- 2026-03-31：大幅更新 [Navigation Compose 3.0](./navigation.md)，新增 Navigation 3 类型安全路由 DSL（配合 Kotlin 序列化）、NavHost 跨平台支持情况表、iOS/Web 深层链接配置示例。
- 2026-03-31：收录 Android Studio Otter 3 Feature Drop（2026 年 1 月）Compose Preview AI 辅助生成资讯 — Gemini 深度集成到 Compose Preview 面板，支持从设计稿到高质量实现的 AI 辅助开发；新增 Compose Preview 渲染失败时 Gemini 自动调试能力，以及 Figma 远程 MCP 服务器连接支持。
- 2026-03-31：收录 Compose Multiplatform 1.10.0 正式发布资讯 — 统一 @Preview 注解（所有平台共用）、Navigation 3 全平台支持、Hot Reload 1.0.0 正式版内置，默认启用无需配置。
- 2026-03-31：收录 Jetpack Compose 1.11.0-beta02 版本动态 — 最新稳定版为 1.10.6，beta 为 1.11.0-beta02（2026-03-25 更新），compose.material3 最新稳定 1.4.0，alpha 为 1.5.0-alpha16。
- 2026-03-30：新增 [RemoteCompose 服务器驱动 UI](./remote-compose.md) 文档，介绍 AndroidX 新推出的 RemoteCompose 框架，将 Compose UI 序列化为二进制格式传输到客户端原生渲染，无需 WebView 或 JSON 映射，适合动态内容更新、A/B 测试和热修复场景。
- 2026-03-30：更新 [Compose Multiplatform 跨平台开发](./compose-multiplatform.md)，新增「Native iOS Text Input」章节，介绍 Compose Multiplatform 1.11.0 引入的原生 iOS 文本输入模式，解决 iOS 端文本输入体验问题，支持 iOS 原生输入法、翻译/查询上下文菜单和听写功能。
- 2026-03-29：新增 [Retain API 状态保留](./retain-api.md) 文档，介绍 Compose 运行时新引入的 `retain` API，用于在配置变更和临时 UI 销毁时保留状态，填补 `remember` 与 `rememberSaveable` 之间的能力空白。
- 2026-03-28：新增 [Compose Multiplatform 跨平台开发](./compose-multiplatform.md) 文档，介绍 KMP Compose 对 Android / iOS / Desktop / Web 四端的支持，包括 iOS 性能优化、Wasm 支持和生产环境稳定性说明；同步新增 [Accompanist 工具库集](./accompanist.md)，覆盖权限请求、系统 UI 控制、Drawable 渲染和自适应布局等常用模块。
- 2026-03-25：新增 [Brush 与 Graphics API](./graphics-brush.md) 文档，覆盖渐变填充（线性/径向/扫描）、纯色 Brush 及 GraphicsLayer 图层变换，适合配合 Canvas 或 Modifier.background 使用。
- 2026-03-17：收录 Android 官方博客资讯 - TikTok 通过 Jetpack Compose 减少 58% 代码量，显著提升新功能开发效率；JioHotstar 利用 WindowSizeClass 和 Compose 自适应布局优化折叠屏与平板用户体验。
- 2026-03-14：新增 Shadow Modifiers（dropShadow/innerShadow）、Autofill 原生支持、Visibility Tracking 三个知识点文档，涵盖 Compose 1.8/1.9 新特性。
- 2026-03-13：将 `README.md` 重构为索引页，阅读器改为按索引加载单篇文档。
- 2026-03-13：补充文档整理规范、单篇模板和定时任务提示词模板。
- 2026-03-13：将混合主题文档进一步拆分为富文本、Lazy Grid、CameraX、Media3 和拖放等原子文档。
- 2026-03-13：将「布局与界面」拆分为「布局 / 绘制 / 文本 / 列表」四个子分类。
## 维护规则摘要
1. `README.md` 只写索引、分类、最近更新和维护入口，不写大段知识点正文。
2. 一个文档只讲一个主题，主题过大时拆分成多个原子文档。
3. 新增知识点前必须先检查是否已有近似主题，优先补充已有文档。
4. 标题面向阅读者，文件名使用英文 `kebab-case`，避免中文文件名漂移。
5. 单篇文档优先遵循统一模板，至少包含摘要、核心概念、示例代码和最佳实践。
6. 只有当分类、链接或更新时间发生变化时才更新 `README.md`。
## 维护资源
- [文档整理规范](./_meta/authoring-guide.md) - 统一目录职责、单篇模板、命名规范和更新边界。
- [单篇文档模板](./_meta/doc-template.md) - 新建知识点文档时可直接复制使用。
- [定时任务提示词模板](./_meta/scheduler-prompt.md) - 可直接放入自动任务执行增量整理。
