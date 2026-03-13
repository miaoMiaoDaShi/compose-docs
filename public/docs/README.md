# 📱 Android Compose 知识点整理

> 最后更新: 2026-03-13 14:00

---

## 🚀 2026年3月13日 14:00 Compose 最新动态

**分类**: 最新资讯 | **标签**: 2026, 最新, 3月

### 🔥 2026 Compose 核心趋势

1. **Pausable Composition** - 滚动性能优化新突破，将重计算分摊到多帧执行
2. **AI 辅助开发** - 从截图生成 Compose UI、自然语言修改 Preview 成为现实
3. **Compose Multiplatform** - 真正的多平台支持能力显著增强
4. **性能持平 Views** - 与传统 Android Views 性能持平，滚动卡顿率 <0.2%

### 🌟 开发者关注重点

- **Kotlin 2.0 Strong Skipping**: 编译器自动优化，减少不必要重组
- **retain API**: 跨配置更改持久化值的新选择
- **LazyLayout CacheWindow**: 预取更多内容，流畅度提升
- **Material 3 演进**: 更多自适应组件，跨设备支持完善

### 📰 热门资源

- [The Future of Jetpack Compose: Features Coming in 2026](https://medium.com/@androidlab/the-future-of-jetpack-compose-features-coming-in-2026-cacc535234a2) - 2026 展望
- [What's new in Jetpack Compose December '25](https://android-developers.googleblog.com/2025/12/whats-new-in-jetpack-compose-december.html) - 官方发布说明
- [Jetpack Compose Roadmap](https://developer.android.com/jetpack/androidx-compose-roadmap) - 官方路线图

---

## 1. @Composable 函数 ⚡

**分类**: 基础 | **标签**: 基础, 入门, 核心

### 概念
Composable 函数是 Jetpack Compose 的核心构建块。任何带有 `@Composable` 注解的函数都可以描述 UI。

### 代码示例

```kotlin
@Composable
fun Greeting(name: String) {
    Text(
        text = "Hello, $name!",
        style = MaterialTheme.typography.h1
    )
}
```

---

## 2. remember / mutableStateOf 🔄

**分类**: 状态 | **标签**: 状态, 重组, 基础

### 概念
`remember` 用于在重组后保留计算结果，`mutableStateOf` 创建可观察的 Compose 状态。

### 代码示例

```kotlin
@Composable
fun Counter() {
    var count by remember { mutableStateOf(0) }
    Button(onClick = { count++ }) {
        Text("Count: $count")
    }
}
```

---

## 3. StateFlow / collectAsState 🌊

**分类**: 状态 | **标签**: 状态, ViewModel, Flow

### 概念
StateFlow 是 Kotlin Flow 的一种，适合在 ViewModel 中管理状态。`collectAsState` 将 Flow 转为 Compose 可观察的状态。

### 代码示例

```kotlin
// ViewModel
class MyViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(UiState())
    val uiState: StateFlow<UiState> = _uiState
}

// Compose
@Composable
fun MyScreen(viewModel: MyViewModel = viewModel()) {
    val state by viewModel.uiState.collectAsState()
    Text("Loading: ${state.loading}")
}
```

---

## 4. 布局组件 Box / Row / Column 📦

**分类**: 布局 | **标签**: 布局, UI, 基础

### 概念
Compose 提供了三个最常用的基础布局组件：Box（叠加）、Row（水平）、Column（垂直）。

### 代码示例

```kotlin
Column {
    Text("第一行")
    Text("第二行")
}

Row {
    Text("左边")
    Text("右边")
}

Box(contentAlignment = Alignment.Center) {
    Text("居中")
}
```

---

## 5. LazyColumn / LazyRow 📋

**分类**: 列表 | **标签**: 列表, 滚动, 性能

### 概念
当需要显示大量数据时，使用 Column/Row 会导致性能问题。`LazyColumn`（垂直列表）和 `LazyRow`（水平列表）只渲染可见区域的元素，大幅提升性能。

### 代码示例

```kotlin
// 垂直列表
LazyColumn {
    items(itemsList) { item ->
        ListItem(title = item.name)
    }
}

// 水平列表
LazyRow {
    items(imagesList) { image ->
        Image(painter = image)
    }
}

// 带 key 的优化
LazyColumn {
    items(itemsList, key = { it.id }) { item ->
        ListItem(title = item.name)
    }
}
```

### 关键点
- 只渲染可见区域内容，性能优异
- `items()` 用于渲染列表项
- 推荐指定 `key` 参数，帮助 Compose 精确跟踪元素
- `LazyListState` 可监听滚动位置

### 常用 API

| API | 说明 |
|-----|------|
| `items(list)` | 渲染列表 |
| `itemsIndexed(list)` | 带索引的渲染 |
| `item { }` | 单个元素 |
| `stickyHeader` | 粘性标题 |

---

## 6. Modifier 修饰符 🔧

**分类**: 修饰符 | **标签**: 修饰符, 样式, 链式调用

### 概念
Modifier 是 Compose 中的修饰符系统，用于调整Composable 的外观和行为。可以链式调用多个修饰符，有序地应用样式。

### 代码示例

```kotlin
Text(
    text = "你好",
    modifier = Modifier
        .padding(16.dp)           // 外边距
        .background(Color.Blue)   // 背景色
        .fillMaxWidth()           // 宽度填满
        .clickable { }            // 点击事件
)
```

### 常用修饰符

| 修饰符 | 说明 |
|--------|------|
| `padding()` | 内边距 |
| `margin()` | 外边距 (通过 padding 实现) |
| `background()` | 背景色 |
| `fillMaxWidth()` | 宽度填满父容器 |
| `fillMaxHeight()` | 高度填满父容器 |
| `size()` | 指定尺寸 |
| `clickable()` | 点击事件 |
| `clip()` | 裁剪形状 |
| `border()` | 边框 |

### 关键点
- 修饰符有顺序要求，顺序影响最终效果
- 每个 Composable 都有一个 modifier 参数
- 可以自定义修饰符扩展功能

---

## 7. Navigation Compose 3.0 🧭

**分类**: 导航 | **标签**: 导航, 路由, 进阶

### 概念
Navigation Compose 3.0 提供了更强大的导航控制，简化了复杂导航流程。支持多航点、深度链接和类型安全的参数传递。

### 代码示例

```kotlin
// 定义导航图
@Composable
fun MyNavHost() {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = "home"
    ) {
        composable("home") {
            HomeScreen(
                onNavigateToDetail = { itemId ->
                    navController.navigate("detail/$itemId")
                }
            )
        }
        composable(
            route = "detail/{itemId}",
            arguments = listOf(
                navArgument("itemId") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val itemId = backStackEntry.arguments?.getString("itemId")
            DetailScreen(itemId = itemId)
        }
    }
}
```

### 3.0 新特性
- **类型安全导航**: 使用 Safe Args 插件自动生成类型安全的导航类
- **导航图嵌套**: 支持模块化导航图
- **动画支持**: 内置共享元素转场动画
- **deeplink**: 更容易处理深度链接

---

## 8. derivedStateOf 性能优化 🎯

**分类**: 性能 | **标签**: 性能, 优化, 重组

### 概念
`derivedStateOf` 用于当某个状态派生自其他状态，但计算成本较高或更新频率不同时。通过限制不必要的重组来优化性能。

### 代码示例

```kotlin
@Composable
fun TodoList(todos: List<Todo>) {
    // 只有当 todos 列表本身变化时才重新计算
    // 而不是每次任意元素变化时都重组
    val completedTodos by remember(todos) {
        derivedStateOf { todos.filter { it.isCompleted } }
    }

    // 用于判断是否显示"完成"标签
    val isAllCompleted by remember(todos) {
        derivedStateOf {
            todos.isNotEmpty() && todos.all { it.isCompleted }
        }
    }

    LazyColumn {
        items(todos) { todo ->
            TodoItem(todo = todo)
        }
    }
}
```

### 使用场景
- 过滤/排序大量数据
- 计算派生状态（总数、平均值等）
- 基于多个状态的条件判断

### 最佳实践
- 避免在 `derivedStateOf` 内部执行昂贵计算
- 只在需要精确控制重组时机时使用
- 过度使用反而会影响可读性

---

## 9. Kotlin 2.0 Strong Skipping & Pausable Composition ⚡🚀

**分类**: 性能 | **标签**: 性能, Kotlin 2.0, 重组

### 概念
Kotlin 2.0 带来的 Strong Skipping 技术显著减少了不必要的重组。Pausable composition 成为 Lazy 布局的默认行为，将滚动卡顿降至 <0.2%。

### 代码示例

```kotlin
// Kotlin 2.0 下，Compose 编译器自动优化
// 以下代码会自动跳过不必要的重组
@Composable
fun OptimizedList(items: List<Item>) {
    LazyColumn {
        items(items, key = { it.id }) { item ->
            // 只有当 item 真正变化时才重组
            ItemCard(item = item)
        }
    }
}
```

### 关键改进
- **Strong Skipping**: 编译器智能跳过不会影响 UI 的重组
- **Pausable Composition**: 允许在帧之间暂停重组，保持 UI 流畅
- **稳定性推断**: 自动推断数据类的稳定性

### 性能指标
- 滚动卡顿率: <0.2%
- 重组次数显著减少
- 与传统 View 系统性能持平

---

## 10. Material 3 自适应布局 📱🔳

**分类**: 布局 | **标签**: Material 3, 自适应, 大屏幕

### 概念
Material 3 强调自适应布局，支持手机、平板、折叠屏和大屏幕设备。提供预测性返回手势和窗格扩展等新特性。

### 代码示例

```kotlin
// 自适应布局 - 窗口尺寸变化时自动调整
@Composable
fun AdaptiveLayout() {
    WindowSizeClass.calculateFromSize(LocalConfiguration.current.screenSizeDp) {
        when (windowSizeClass) {
            WindowSizeClass.Compact -> {
                // 手机布局 - 单栏
                SinglePaneContent()
            }
            WindowSizeClass.Medium -> {
                // 平板/折叠屏 - 双栏
                ListDetailPaneScaffold(
                    list = { ListPane() },
                    detail = { DetailPane() }
                )
            }
            WindowSizeClass.Expanded -> {
                // 大屏幕 - 三栏
                ThreePaneLayout()
            }
        }
    }
}

// 预测性返回手势 (Android 14+)
@Composable
fun PredictiveBackGesture() {
    val animatedProgress by animateFloatAsState(
        targetValue = if (isPressed) 1f else 0f,
        animationSpec = spring(stiffness = Spring.StiffnessLow)
    )
}
```

### 新特性
- **WindowSizeClass**: 根据窗口尺寸自动调整布局
- **ListDetailPaneScaffold**: 双栏布局模板
- **预测性返回**: 返回时预览目标页面
- **动态色彩**: 从壁纸提取颜色生成主题

---

## 11. 现代 UI 能力 - 富文本 & 2D 滚动 📝🔄

**分类**: UI | **标签**: 富文本, 2D滚动, 阴影

### 概念
Compose 原生支持富文本转换、2D 滚动和高级阴影渲染，无需第三方库。

### 代码示例

```kotlin
// 富文本
@Composable
fun RichTextExample() {
    Text(
        buildAnnotatedString {
            append("这是 ")
            withStyle(SpanStyle(fontWeight = FontWeight.Bold)) {
                "粗体"
            }
            append(" 和 ")
            withStyle(SpanStyle(color = Color.Red)) {
                "红色"
            }
            append(" 文字")
        }
    )
}

// 2D 滚动 (LazyVerticalGrid)
@Composable
fun GridView(items: List<Item>) {
    LazyVerticalGrid(
        columns = GridCells.Adaptive(minSize = 128.dp),
        contentPadding = PaddingValues(16.dp)
    ) {
        items(items) { item ->
            GridItem(item = item)
        }
    }
}

// 高级阴影
@Composable
fun AdvancedShadow() {
    Box(
        modifier = Modifier
            .size(100.dp)
            .shadow(
                elevation = 8.dp,
                shape = RoundedCornerShape(16.dp),
                ambientColor = Color.Black.copy(alpha = 0.25f),
                spotColor = Color.Black.copy(alpha = 0.35f)
            )
    )
}
```

---

## 12. Modifier.Node 高性能自定义组件 🧩

**分类**: 性能 | **标签**: 性能, 自定义, Modifier

### 概念
`Modifier.Node` 是 Compose 1.5+ 引入的高性能自定义修饰符方案，比传统的 `Modifier.Element` 更加高效。

### 代码示例

```kotlin
// 定义自定义 Node
class HighPerfModifier(
    var scale: Float = 1f
) : Modifier.Node() {
    override fun onMeasured(size: Size, layoutDirection: LayoutDirection, density: Density): MeasureResult {
        // 高性能测量逻辑
        return layout(size.width.toInt(), size.height.toInt()) {
            // 布局子元素
        }
    }

    override fun onPlaced(placed: Placed) {
        // 只需更新，不需要完整重组
        update(placed.size)
    }
}

// 使用自定义 Node
@Composable
fun HighPerfComponent() {
    Box(
        modifier = Modifier
            .size(100.dp)
            .highPerfModifier(scale = 1.5f)
    )
}

// 创建 Modifier 扩展
fun Modifier.highPerfModifier(scale: Float) = this then HighPerfModifier(scale)
```

### 优势
- 更细粒度的重组控制
- 减少内存分配
- 适合高频更新场景（如动画）

---

## 13. 平台集成 - CameraX / Media3 / 拖放 📷📤

**分类**: 平台 | **标签**: 相机, 媒体, 拖放

### 概念
Compose 与原生平台功能深度集成，CameraX、Media3 和应用间拖放都有原生支持。

### 代码示例

```kotlin
// CameraX 集成
@Composable
fun CameraPreview() {
    AndroidView(
        factory = { context ->
            PreviewView(context).apply {
                implementationMode = PreviewView.ImplementationMode.COMPATIBLE
            }
        },
        modifier = Modifier.fillMaxSize()
    )
}

// 拖放支持
@Composable
fun DropTarget() {
    Box(
        modifier = Modifier
            .droppable { state ->
                // 处理接收到的数据
                when (state) {
                    is DropResult.Success -> handleDrop(state.data)
                }
            }
            .dragAndDropSource {
                startTransfer(
                    dragData = DragData.Bytes("Hello".toByteArray())
                )
            }
    )
}

// Media3 播放器
@Composable
fun VideoPlayer() {
    AndroidView(
        factory = { context ->
            PlayerView(context).apply {
                useController = true
            }
        },
        modifier = Modifier.fillMaxSize()
    )
}
```

---

## 14. 共用元素过渡动画 🎬✨

**分类**: 动画 | **标签**: 动画, 过渡, 进阶

### 概念
共用元素过渡动画（Shared Element Transition）允许在两个页面之间共享的 UI 元素（如图片、卡片）进行平滑过渡，提供类似原生应用的流畅体验。

### 代码示例

```kotlin
// 列表项
@Composable
fun ListItem(imageUrl: String, onClick: () -> Unit) {
    SharedBounds(
        sharedContentState = rememberSharedContentState(key = "image-$imageUrl"),
        clipInOverlayDuringTransition = OverlayClip(RoundedCornerShape(16.dp))
    ) {
        AsyncImage(
            model = imageUrl,
            contentDescription = null,
            modifier = Modifier
                .fillMaxWidth()
                .height(200.dp)
                .clickable(onClick = onClick)
                .clip(RoundedCornerShape(16.dp))
        )
    }
}

// 详情页
@Composable
fun DetailScreen(imageUrl: String) {
    SharedBounds(
        sharedContentState = rememberSharedContentState(key = "image-$imageUrl"),
        clipInOverlayDuringTransition = OverlayClip(RoundedCornerShape(16.dp))
    ) {
        AsyncImage(
            model = imageUrl,
            contentDescription = null,
            modifier = Modifier
                .fillMaxWidth()
                .height(300.dp)
                .clip(RoundedCornerShape(16.dp))
        )
    }
}
```

### 关键 API

| API | 说明 |
|-----|------|
| `SharedBounds` | 共用元素过渡的容器 |
| `rememberSharedContentState` | 创建共享内容状态 |
| `OverlayClip` | 过渡过程中的裁剪样式 |

### 使用场景
- 图片从列表过渡到详情页
- 卡片展开为全屏内容
- 列表项到详情页的平滑过渡

---

## 15. @Preview 高级技巧 & AI 辅助生成 🤖🎨

**分类**: 工具 | **标签**: 工具, 预览, AI, 效率

### 概念
Android Studio 提供了强大的 @Preview 功能，支持多预览模板、AI 辅助生成预览，大大提升开发效率。

### Multipreview 模板
Compose 1.6+ 引入了内置的多预览注解，一个注解即可预览多种场景：

```kotlin
// 预览不同屏幕尺寸
@PreviewScreenSizes
@Composable
fun MyScreen() { /* ... */ }

// 预览不同字体大小
@PreviewFontScales
@Composable
fun MyScreen() { /* ... */ }

// 预览亮色/暗色主题
@PreviewLightDark
@Composable
fun MyScreen() { /* ... */ }

// 预览动态配色
@PreviewDynamicColors
@Composable
fun MyScreen() { /* ... */ }
```

### 自定义多预览注解
可以创建自己的多预览组合：

```kotlin
// 定义组合预览
@Preview(name = "small font", group = "font scales", fontScale = 0.5f)
@Preview(name = "large font", group = "font scales", fontScale = 1.5f)
annotation class FontScalePreviews

// 使用
@FontScalePreviews
@Composable
fun HelloWorldPreview() {
    Text("Hello World")
}
```

### @PreviewParameter 预览参数
传递示例数据进行预览：

```kotlin
// 定义数据提供者
class UserPreviewParameterProvider : PreviewParameterProvider<User> {
    override val values = sequenceOf(
        User("Elise"),
        User("Frank"),
        User("Julia")
    )
}

// 使用
@Preview
@Composable
fun UserProfilePreview(
    @PreviewParameter(UserPreviewParameterProvider::class) user: User
) {
    UserProfile(user)
}
```

### AI 辅助预览生成
右键点击可组合函数 → 选择 **AI > Generate Preview**，AI 会自动分析并生成正确的预览代码！

### 常用 Preview 参数

| 参数 | 说明 |
|------|------|
| `widthDp` / `heightDp` | 预览尺寸 |
| `locale` | 语言区域 |
| `fontScale` | 字体缩放 |
| `showSystemUi` | 显示系统 UI |
| `showBackground` | 显示背景 |
| `uiMode` | 夜间模式等 |

---

## 📋 目录

1. @Composable 函数 ⚡
2. remember / mutableStateOf 🔄
3. StateFlow / collectAsState 🌊
4. 布局组件 Box / Row / Column 📦
5. LazyColumn / LazyRow 📋
6. Modifier 修饰符 🔧
7. Navigation Compose 3.0 🧭
8. derivedStateOf 性能优化 🎯
9. Kotlin 2.0 Strong Skipping & Pausable Composition ⚡🚀
10. Material 3 自适应布局 📱🔳
11. 现代 UI 能力 - 富文本 & 2D 滚动 📝🔄
12. Modifier.Node 高性能自定义组件 🧩
13. 平台集成 - CameraX / Media3 / 拖放 📷📤
14. 共用元素过渡动画 🎬✨
15. @Preview 高级技巧 & AI 辅助生成 🤖🎨
16. 状态管理最佳实践 💾🔄
17. Compose 副作用 API 全攻略 ⚡🔀
18. Compose 性能优化指南 🚀⚡
