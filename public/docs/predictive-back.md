# Predictive Back Gesture 与 Compose 集成 📱

> 摘要：Predictive Back（预测性返回）是 Android 13+ 引入的系统级手势，让用户在手势执行前就能预览返回目标。Compose 对 Predictive Back 提供了完整支持，包括 Navigation Compose 集成、共享元素过渡和 Material 3 组件联动。
>
> 适用版本：Android 13+ / Navigation Compose 2.8+ / Material 3 Compose 1.3.0+ / Compose 1.6+
>
> 更新时间：2026-04-04
>
> 标签：手势导航，PredictiveBackHandler，Navigation，SharedElement，Android13

## 核心概念

Predictive Back 的核心价值是**消除"返回后才知道去哪"的认知断层**。用户从详情页左滑返回时，在手势执行过程中就能预览到列表页，而不是等返回完成才看到结果。

**三阶段模型：**

| 阶段 | 触发条件 | 开发者职责 |
|------|---------|-----------|
| `handleOnBackPressed` | 手势完成（progress = 1.0） | 执行实际的返回操作 |
| `handleOnBackProgressed` | 手势进行中（0.0 < progress < 1.0） | 播放预览动画（scale / crossfade / shared element） |
| `handleOnBackCancelled` | 用户取消手势 | 重置所有预览状态 |

**平台要求：**
- Android 13（API 33）开始支持 Predictive Back
- Android 15+ 期望所有应用正确处理 Predictive Back
- `onBackPressed()` 已弃用，必须迁移到 `OnBackPressedDispatcher`

## PredictiveBackHandler — 手动进度访问

当 Compose 组件（非 Navigation 场景）需要监听 Predictive Back 进度时，使用 `PredictiveBackHandler`：

```kotlin
import androidx.compose.system彭PredictiveBackHandler

@Composable
fun DraggableCard(
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    var offsetX by remember { mutableFloatStateOf(0f) }

    PredictiveBackHandler(
        onBack = onBack,
        onProgress = { progress: Float ->
            // progress: 0.0 (开始) → 1.0 (完成)
            // 拖拽预览效果
            offsetX = -progress * 300f
        },
        onCancel = {
            // 重置到初始状态
            offsetX = 0f
        }
    ) { backEvent ->
        // 可选的 BackEvent 详细信息
        // backEvent.swipeEdge: 滑动的屏幕边缘
        // backEvent.progress: 当前进度（与 onProgress 相同）
    }

    Card(
        modifier = Modifier.offset { IntOffset(offsetX.roundToInt(), 0) }
    ) {
        Text("Swipe to dismiss")
    }
}
```

**与手势驱动的共享元素动画联动：**

```kotlin
@Composable
fun ImageCard(
    imageUrl: String,
    onDismiss: () -> Unit
) {
    var progress by remember { mutableFloatStateOf(0f) }
    val animatedProgress by animateFloatAsState(
        targetValue = progress,
        animationSpec = spring(stiffness = Spring.StiffnessMedium)
    )

    PredictiveBackHandler(
        onBack = onDismiss,
        onProgress = { progress = it },
        onCancel = { progress = 0f }
    ) { backEvent ->
        // 拖拽方向决定动画曲线
        val direction = if (backEvent.swipeEdge == SwipeEdge.Left) 1f else -1f
    }

    Card(
        modifier = Modifier
            .graphicsLayer {
                scaleX = 1f - (animatedProgress * 0.15f)
                scaleY = 1f - (animatedProgress * 0.15f)
                alpha = 1f - animatedProgress
            }
    ) {
        AsyncImage(model = imageUrl, contentDescription = null)
    }
}
```

**适用场景：**
- 自定义卡片/列表项的滑动删除预览
- 全屏图片查看器的手势返回
- 非 Navigation 场景的 Predictive Back 动画

## Navigation Compose 集成

Navigation Compose 2.8+ 对 Predictive Back 提供了内置支持，大多数情况下**无需手动处理进度**：

### 默认行为（自动跨淡）

> 需要：`navigation-compose` 2.8.0+

```kotlin
// 确保使用 navigation-compose 2.8.0+
NavHost(
    navController = navController,
    startDestination = HomeRoute
) {
    composable<HomeRoute>(
        enterTransition = { fadeIn(300.ms) },
        exitTransition = { fadeOut(200.ms) }
    ) {
        HomeScreen()
    }

    composable<DetailRoute>(
        enterTransition = { fadeIn(300.ms) },
        exitTransition = { fadeOut(200.ms) },
        // Predictive Back 使用 popEnterTransition / popExitTransition
        popEnterTransition = { fadeIn(300.ms) },
        popExitTransition = { fadeOut(200.ms) }
    ) {
        DetailScreen()
    }
}
```

Navigation Compose 在 Predictive Back 场景下会自动使用 `popEnterTransition` 和 `popExitTransition` 定义返回动画，无需额外配置。

### Predictive Back + 共享元素过渡

将 Predictive Back 与 `SharedBounds` 结合，实现从详情页"拖回"列表页的视觉连续性：

```kotlin
NavHost(navController, startDestination = HomeRoute) {

    composable<HomeRoute>(
        enterTransition = { fadeIn(300.ms) },
        exitTransition = { fadeOut(200.ms) }
    ) {
        HomeScreen(
            onItemClick = { item ->
                navController.navigate(DetailRoute(itemId = item.id))
            }
        )
    }

    composable<DetailRoute>(
        enterTransition = { fadeIn(300.ms) },
        exitTransition = { fadeOut(200.ms) },
        popEnterTransition = { fadeIn(300.ms) },
        popExitTransition = { fadeOut(200.ms) }
    ) { backStackEntry ->
        val itemId = backStackEntry.toRoute<DetailRoute>().itemId
        val item = remember(itemId) { getItemById(itemId) }

        DetailScreen(
            item = item,
            // 提供共享内容状态，供 Predictive Back 动画使用
            sharedContentState = rememberSharedContentState(key = "item-image-${item.id}")
        )
    }
}
```

```kotlin
@Composable
fun DetailScreen(
    item: Item,
    sharedContentState: SharedContentState
) {
    Box {
        // 共享元素：详情页大图与列表缩略图连贯过渡
        SharedBounds(
            sharedContentState = sharedContentState,
            modifier = Modifier.fillMaxWidth().height(300.dp)
        ) {
            AsyncImage(
                model = item.imageUrl,
                contentDescription = item.title,
                contentScale = ContentScale.Crop
            )
        }

        Text(
            text = item.title,
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.align(Alignment.BottomStart).padding(16.dp)
        )
    }
}
```

** Predictive Back 时 SharedBounds 的工作流程：**

```
用户从详情页左滑返回
         ↓
Navigation Compose 捕获 Predictive Back 事件
         ↓
SharedBounds 检测到"返回"导航，播放反向共享元素动画
         ↓
progress 从 0.0 → 1.0，图片从大→小、从详情位置→列表位置
         ↓
progress = 1.0 时，执行真正的 popBackStack()
         ↓
列表页已显示，动画与页面切换无缝衔接
```

### 自定义 Predictive Back 动画（高级）

如果默认的 `popEnterTransition` / `popExitTransition` 不满足需求，可以用 `PredictiveBackHandler` 手动处理：

```kotlin
composable<DetailRoute>(
    enterTransition = { slideInHorizontally { it } + fadeIn() },
    exitTransition = { slideOutHorizontally { -it / 3 } + fadeOut() },
    popEnterTransition = {
        slideInHorizontally { -it / 3 } + fadeIn()
    },
    popExitTransition = {
        slideOutHorizontally { it } + fadeOut()
    }
) { backStackEntry ->
    // 通过 LocalBackHandlerEntry 获取 Predictive Back 状态
    val backDispatcher = LocalBackDispatcher.current

    DetailScreen(
        onBack = { backDispatcher.navigateUp() },
        onBackProgress = { progress ->
            // 实时预览动画
        }
    )
}
```

## Material 3 组件 Predictive Back 支持

Material 3 Compose 1.3.0+ 对以下组件提供了 Predictive Back 内置动画支持：

| 组件 | 动画效果 |
|------|---------|
| `NavigationBar` | 返回时项目图标/标签自动过渡 |
| `NavigationRail` | 同上，方向改为垂直 |
| `BottomSheetScaffold` | 下滑手势 Predictive Back 预览 |
| `Dialog` | Predictive Back 时自动 crossfade |
| `ModalBottomSheet` | Predictive Back 时 sheet 下滑预览 |

**确保启用 Predictive Back：**

```kotlin
// build.gradle.kts
dependencies {
    implementation("androidx.compose.material3:material3:1.3.0")
    implementation("androidx.navigation:navigation-compose:2.8.0")
}

// AndroidManifest.xml
// 无需额外配置， Predictive Back 默认在 Android 13+ 启用
```

**ModalBottomSheet 配合 Predictive Back：**

```kotlin
val sheetState = rememberModalBottomSheetState()

ModalBottomSheet(
    onDismissRequest = { /* sheet 关闭 */ },
    sheetState = sheetState,
    // Predictive Back 下滑时自动播放 sheet 下降动画
    // 用户取消手势时 sheet 恢复原位
) {
    SheetContent()
}
```

## 从 onBackPressed 迁移

**弃用背景：** `onBackPressed()` 在 Android 13+ 与 Predictive Back 不兼容，必须迁移。

**迁移步骤：**

```kotlin
// ❌ 旧写法（已弃用，不支持 Predictive Back）
// Activity / Fragment 中
onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
    override fun handleOnBackPressed() {
        supportFragmentManager.popBackStack()
    }
})

// ✅ 新写法（Compose 中）
@Composable
fun BackHandlerDemo(
    onBack: () -> Unit
) {
    val backCallback = remember {
        object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                onBack()
            }

            override fun handleOnBackProgressed(backEvent: BackEventCompat) {
                // 预览动画（0.0 → 1.0）
            }

            override fun handleOnBackCancelled() {
                // 重置预览
            }
        }
    }

    DisposableEffect(Unit) {
        onBackPressedDispatcher.addCallback(backCallback)
        onDispose { backCallback.remove() }
    }
}
```

**Android 15+ 行为差异：**
- Android 15 强制要求所有应用支持 Predictive Back
- 如果你的应用没有注册 Predictive Back 回调，系统会显示"灰度预览"而不是你的自定义动画
- 为保证最佳体验，**必须**迁移到新的回调 API

## 常见误区

- **混淆 onBack 和 onProgress 时机**：onProgress 在手势拖拽过程中实时触发，onBack 在手势完成后调用一次
- **忘记处理 onCancel**：手势取消时 UI 必须重置到初始状态，否则会出现"悬空"状态
- **在 LazyColumn 项目中使用 PredictiveBackHandler**：列表项的 Predictive Back 应与 NavController 联动，而不是在 item 层级处理
- **过度自定义 Navigation 动画**：Navigation Compose 2.8+ 的默认 Predictive Back 行为已经很好，过度自定义可能与系统预期冲突

## 最佳实践

1. **优先使用 Navigation Compose 内置支持**：只有在非导航场景（如自定义手势）才使用 `PredictiveBackHandler`
2. **预览动画保持轻量**：`handleOnBackProgressed` 在手势过程中高频回调，动画计算必须高效
3. **与 SharedBounds 联动**：列表→详情页面优先使用共享元素 + Predictive Back，用户体验提升显著
4. **测试多种滑动速度**： Predictive Back 可能在快速滑动时跳过 progress 中间值，直接触发完成
5. **兼容低端设备**： Predictive Back 动画需要设备支持 Android 13+，旧版本仍需兼容路径

## 关联主题

- [Navigation Compose 3.0](./navigation.md) — 基础导航概念
- [Navigation Compose 进阶技巧](./nav-advanced.md) — NavKey 和返回栈管理
- [共用元素过渡动画](./shared-element.md) — SharedBounds 与过渡动画
- [Compose 动画 API 进阶](./animation.md) — AnimatedVisibility 与 Veil Transitions
- [性能优化指南](./performance-guide.md) — 动画性能注意事项
