# 📱 Android Compose 知识点整理

> 最后更新: 2026-03-13 16:00

---

## 🚀 Compose 最新动态

**分类**: 最新资讯 | **标签**: 2026, 最新

### 🔥 2026 Compose 核心趋势

1. **Pausable Composition** - 滚动性能优化，将重计算分摊到多帧执行
2. **AI 辅助开发** - 从截图生成 Compose UI，自然语言修改 Preview
3. **Compose Multiplatform** - 多平台支持能力显著增强
4. **性能持平 Views** - 滚动卡顿率 <0.2%

### 🌟 开发者关注重点

- **Kotlin 2.0 Strong Skipping**: 编译器自动优化，减少不必要重组
- **retain API**: 跨配置更改持久化值
- **LazyLayout CacheWindow**: 预取更多内容
- **Material 3 演进**: 更多自适应组件

### 📰 热门资源

- [The Future of Jetpack Compose: Features Coming in 2026](https://medium.com/@androidlab/the-future-of-jetpack-compose-features-coming-in-2026-cacc535234a2)
- [What's new in Jetpack Compose December '25](https://android-developers.googleblog.com/2025/12/whats-new-in-jetpack-compose-december.html)
- [Jetpack Compose Roadmap](https://developer.android.com/jetpack/androidx-compose-roadmap)

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
`LazyColumn`（垂直列表）和 `LazyRow`（水平列表）只渲染可见区域的元素，大幅提升性能。

### 代码示例

```kotlin
LazyColumn {
    items(itemsList) { item ->
        ListItem(title = item.name)
    }
}

LazyRow {
    items(imagesList) { image ->
        Image(painter = image)
    }
}
```

### 常用 API

| API | 说明 |
|-----|------|
| `items(list)` | 渲染列表 |
| `itemsIndexed(list)` | 带索引的渲染 |
| `stickyHeader` | 粘性标题 |

---

## 6. Modifier 修饰符 🔧

**分类**: 修饰符 | **标签**: 修饰符, 样式, 链式调用

### 概念
Modifier 是 Compose 中的修饰符系统，用于调整 Composable 的外观和行为。

### 代码示例

```kotlin
Text(
    text = "你好",
    modifier = Modifier
        .padding(16.dp)
        .background(Color.Blue)
        .fillMaxWidth()
        .clickable { }
)
```

### 常用修饰符

| 修饰符 | 说明 |
|--------|------|
| `padding()` | 内边距 |
| `background()` | 背景色 |
| `fillMaxWidth()` | 宽度填满 |
| `size()` | 指定尺寸 |
| `clickable()` | 点击事件 |

---

## 7. Navigation Compose 3.0 🧭

**分类**: 导航 | **标签**: 导航, 路由, 进阶

### 概念
Navigation Compose 3.0 提供更强大的导航控制，支持类型安全的参数传递。

### 代码示例

```kotlin
@Composable
fun MyNavHost() {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = "home"
    ) {
        composable("home") {
            HomeScreen(onNavigateToDetail = { id ->
                navController.navigate("detail/$id")
            })
        }
        composable("detail/{itemId}") { backStackEntry ->
            val itemId = backStackEntry.arguments?.getString("itemId")
            DetailScreen(itemId = itemId)
        }
    }
}
```

### 3.0 新特性
- 类型安全导航 (Safe Args)
- 导航图嵌套
- 共享元素转场动画
- 深度链接支持

---

## 8. derivedStateOf 性能优化 🎯

**分类**: 性能 | **标签**: 性能, 优化, 重组

### 概念
`derivedStateOf` 用于限制不必要的重组，只有当派生状态真正变化时才触发重组。

### 代码示例

```kotlin
@Composable
fun TodoList(todos: List<Todo>) {
    val completedTodos by remember(todos) {
        derivedStateOf { todos.filter { it.isCompleted } }
    }
}
```

---

## 9. Kotlin 2.0 Strong Skipping ⚡🚀

**分类**: 性能 | **标签**: 性能, Kotlin 2.0, 重组

### 概念
Kotlin 2.0 的 Strong Skipping 技术显著减少不必要的重组，Pausable composition 将滚动卡顿降至 <0.2%。

### 关键改进
- **Strong Skipping**: 编译器智能跳过不会影响 UI 的重组
- **Pausable Composition**: 允许在帧之间暂停重组
- **稳定性推断**: 自动推断数据类的稳定性

---

## 10. Material 3 自适应布局 📱🔳

**分类**: 布局 | **标签**: Material 3, 自适应, 大屏幕

### 概念
Material 3 强调自适应布局，支持手机、平板、折叠屏和大屏幕设备。

### 代码示例

```kotlin
@Composable
fun AdaptiveLayout() {
    WindowSizeClass.calculateFromSize(LocalConfiguration.current.screenSizeDp) {
        when (windowSizeClass) {
            WindowSizeClass.Compact -> SinglePaneContent()
            WindowSizeClass.Medium -> ListDetailPaneScaffold(
                list = { ListPane() },
                detail = { DetailPane() }
            )
            WindowSizeClass.Expanded -> ThreePaneLayout()
        }
    }
}
```

### 新特性
- **WindowSizeClass**: 根据窗口尺寸自动调整布局
- **ListDetailPaneScaffold**: 双栏布局模板
- **预测性返回**: 返回时预览目标页面
- **动态色彩**: 从壁纸提取颜色生成主题

---

## 11. 富文本 & 2D 滚动 📝

**分类**: UI | **标签**: 富文本, 2D滚动, 阴影

### 概念
Compose 原生支持富文本、2D 滚动和高级阴影渲染。

### 代码示例

```kotlin
// 富文本
Text(
    buildAnnotatedString {
        append("这是 ")
        withStyle(SpanStyle(fontWeight = FontWeight.Bold)) {
            append("粗体")
        }
    }
)

// 2D 滚动
LazyVerticalGrid(
    columns = GridCells.Adaptive(minSize = 128.dp)
) {
    items(items) { item -> GridItem(item) }
}
```

---

## 12. Modifier.Node 高性能自定义 🧩

**分类**: 性能 | **标签**: 性能, 自定义, Modifier

### 概念
`Modifier.Node` 是 Compose 1.5+ 引入的高性能自定义修饰符方案。

### 代码示例

```kotlin
class HighPerfModifier(var scale: Float = 1f) : Modifier.Node() {
    override fun onMeasured(...) = layout(...) { ... }
    override fun onPlaced(placed: Placed) {
        update(placed.size)
    }
}

fun Modifier.highPerfModifier(scale: Float) = this then HighPerfModifier(scale)
```

---

## 13. 平台集成 📷

**分类**: 平台 | **标签**: 相机, 媒体, 拖放

### 概念
Compose 与原生平台功能深度集成，CameraX、Media3 和应用间拖放都有原生支持。

### 代码示例

```kotlin
// CameraX
AndroidView(
    factory = { PreviewView(it).apply {
        implementationMode = PreviewView.ImplementationMode.COMPATIBLE
    }},
    modifier = Modifier.fillMaxSize()
)

// 拖放
Box(modifier = Modifier.droppable { } .dragAndDropSource { })
```

---

## 14. 共用元素过渡动画 🎬

**分类**: 动画 | **标签**: 动画, 过渡, 进阶

### 概念
共用元素过渡动画允许在两个页面之间共享的 UI 元素进行平滑过渡。

### 代码示例

```kotlin
SharedBounds(
    sharedContentState = rememberSharedContentState(key = "image-$url"),
    clipInOverlayDuringTransition = OverlayClip(RoundedCornerShape(16.dp))
) {
    AsyncImage(model = url, contentDescription = null)
}
```

---

## 15. @Preview 高级技巧 & AI 辅助 🤖

**分类**: 工具 | **标签**: 工具, 预览, AI, 效率

### 概念
Android Studio 提供强大的 @Preview 功能，支持多预览模板和 AI 辅助生成。

### Multipreview 模板

```kotlin
@PreviewScreenSizes      // 预览不同屏幕尺寸
@PreviewFontScales       // 预览不同字体大小
@PreviewLightDark       // 预览亮色/暗色主题
@PreviewDynamicColors   // 预览动态配色
@Composable
fun MyScreen() { }
```

### AI 辅助
右键点击可组合函数 → **AI > Generate Preview**，AI 自动生成预览代码！

---

## 16. 状态管理最佳实践 💾

**分类**: 状态 | **标签**: 状态管理, 架构

### 核心原则
- 状态提升：状态应保存在需要它的最低层级
- 单向数据流：状态向下传递，事件向上传递
- 不可变性：使用不可变数据类

### 推荐模式

```kotlin
// ViewModel 持有状态
data class UiState(val isLoading: Boolean, val data: List<Item>)

class MyViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(UiState())
    val uiState: StateFlow<UiState> = _uiState
}

// Compose 收集状态
@Composable
fun MyScreen(viewModel: MyViewModel) {
    val state by viewModel.uiState.collectAsState()
}
```

---

## 17. 副作用 API 全攻略 ⚡

**分类**: 进阶 | **标签**: 副作用, 协程

### 常用副作用 API

| API | 用途 |
|-----|------|
| `LaunchedEffect` | 在组合中启动协程 |
| `rememberCoroutineScope` | 获取组合作用域 |
| `rememberUpdatedState` | 更新引用 |
| `DisposableEffect` | 清理副作用 |
| `SideEffect` | 发布组合外部的副作用 |

### 代码示例

```kotlin
// 启动协程
LaunchedEffect(key) {
    dataFlow.collect { updateState(it) }
}

// 清理资源
DisposableEffect(key) {
    onDispose { cleanup() }
}
```

---

## 18. 性能优化指南 🚀

**分类**: 性能 | **标签**: 性能, 优化

### 关键原则
1. **减少重组范围**：使用合适的范围控制
2. **稳定状态**：使用不可变数据类
3. **延迟加载**：使用 Lazy 列表
4. **避免昂贵计算**：使用 derivedStateOf

### 最佳实践

```kotlin
// ✅ 推荐：指定 key
LazyColumn { items(list, key = { it.id }) { Item(it) } }

// ✅ 推荐：使用 derivedStateOf
val filtered by remember(list) {
    derivedStateOf { list.filter { ... } }
}

// ✅ 推荐：稳定类型
data class Item(val id: Int, val name: String) // 所有字段val + 数据类
```

---

## 📋 目录

1. @Composable 函数 ⚡
2. remember / mutableStateOf 🔄
3. StateFlow / collectAsState 🌊
4. Box / Row / Column 📦
5. LazyColumn / LazyRow 📋
6. Modifier 修饰符 🔧
7. Navigation Compose 3.0 🧭
8. derivedStateOf 🎯
9. Kotlin 2.0 Strong Skipping ⚡
10. Material 3 自适应 📱
11. 富文本 & 2D 滚动 📝
12. Modifier.Node 🧩
13. 平台集成 📷
14. 共用元素动画 🎬
15. @Preview & AI 🤖
16. 状态管理 💾
17. 副作用 API ⚡
18. 性能优化 🚀
