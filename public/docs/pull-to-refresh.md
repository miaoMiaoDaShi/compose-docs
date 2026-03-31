# Pull-to-Refresh（拉至刷新）

> **分类**：状态与副作用 / 列表交互
> **平台**：Android · Compose Multiplatform
> **依赖**：`androidx.compose.material3:material3` ≥ 1.3.0

## 摘要

`PullToRefreshBox` 是 Material3 官方提供的拉至刷新组件，基于嵌套滚动（NestedScroll）机制实现，允许用户通过下拉手势触发数据刷新。相比旧版 `SwipeRefresh`（Accompanist），它是 Compose 内置 API，无需额外依赖。

## 核心 API

### 1. PullToRefreshBox（推荐方式）

`PullToRefreshBox` 将目标内容与刷新指示器封装为一体，最简用法：

```kotlin
import androidx.compose.material3.PullToRefreshBox

@Composable
fun RefreshableList(
    isRefreshing: Boolean,
    onRefresh: suspend () -> Unit,
    content: @Composable () -> Unit
) {
    PullToRefreshBox(
        isRefreshing = isRefreshing,
        onRefresh = onRefresh,
        state = rememberPullToRefreshState()
    ) {
        // 这里放 LazyColumn / LazyRow / Column 等可滚动内容
        LazyColumn {
            items(100) { index ->
                Text("Item $index")
            }
        }
    }
}
```

### 2. PullToRefreshState

状态对象负责追踪下拉进度和触发状态：

```kotlin
val state = rememberPullToRefreshState()

// 监听下拉进度（0.0 ~ 1.0，超过 threshold 后恒为 1.0）
val progress by state.progress.collectAsState()

// 判断是否正在刷新
val isRefreshing by state.isRefreshing.collectAsState()

// 手动触发刷新（ programmatic trigger）
state.startRefresh()

// 结束刷新
state.endRefresh()
```

### 3. Modifier.pullToRefresh（底层修饰符）

如果需要更灵活地组合指示器位置，使用底层 `Modifier`：

```kotlin
PullToRefreshContainer(
    state = state,
    modifier = Modifier.align(Alignment.TopCenter)
)

Box(
    modifier = Modifier
        .pullToRefresh(
            state = state,
            enabled = !isRefreshing  // 刷新中禁止再次拉取
        )
) {
    // 内容...
}
```

### 4. 自定义指示器

内置指示器使用 `CircularProgressIndicator`，可通过 `PullToRefreshContainer` 的 modifier 自定义样式：

```kotlin
PullToRefreshContainer(
    state = state,
    modifier = Modifier
        .scale(1.2f),
    containerColor = MaterialTheme.colorScheme.surfaceContainerHighest,
    contentColor = MaterialTheme.colorScheme.primary
)
```

如需完全自定义指示器，可用 `PullToRefreshBox` + 自定义 Composable 组合实现。

## 完整示例

```kotlin
@Composable
fun ArticleListScreen(viewModel: ArticleViewModel) {
    val articles by viewModel.articles.collectAsState()
    val isRefreshing by viewModel.isRefreshing.collectAsState()
    val state = rememberPullToRefreshState()

    LaunchedEffect(isRefreshing) {
        if (!isRefreshing) {
            state.endRefresh()
        }
    }

    PullToRefreshBox(
        isRefreshing = isRefreshing,
        onRefresh = { viewModel.refresh() },
        state = state
    ) {
        LazyColumn(
            modifier = Modifier.fillMaxSize()
        ) {
            items(
                items = articles,
                key = { it.id }
            ) { article ->
                ArticleItem(article = article)
            }
        }
    }
}
```

## 与 Accompanist SwipeRefresh 的区别

| 特性 | PullToRefreshBox | Accompanist SwipeRefresh |
|------|-----------------|--------------------------|
| 来源 | Material3 内置 | 独立库（已废弃维护） |
| 嵌套滚动 | 原生支持 | 模拟实现 |
| 指示器位置 | 固定在顶部 | 可配置 |
| Compose Multiplatform | 支持 | 仅 Android |
| 触发阈值 | 固定值（≈ 80dp） | 可自定义 |
| 刷新状态回调 | Coroutine suspend | Lambda |

> ⚠️ **注意**：Accompanist 的 `SwipeRefresh` 已不再积极维护，新项目请优先使用 `PullToRefreshBox`。

## 最佳实践

1. **配合 ViewModel 使用**：`isRefreshing` 应由 ViewModel 管理，确保配置变更后状态正确恢复。
2. **不要在刷新中再次触发**：`onRefresh` 执行期间 `isRefreshing = true`，此时应禁止再次拉取（`enabled = !isRefreshing`）。
3. **与 `rememberPullToRefreshState()` 的生命周期同步**：状态对象应在 Composable 作用域内通过 `remember` 创建。
4. **搭配 `LaunchedEffect` 结束刷新**：网络请求完成后通过 `state.endRefresh()` 收起指示器。
5. **键值优化**：LazyList 中使用稳定的 `key` 减少不必要的重组。

## 相关文档

- [LazyColumn / LazyRow](./lazy-list.md) — 拉至刷新的常见搭配
- [rememberCoroutineScope & LaunchedEffect](./coroutine-scope.md) — 刷新协程管理
- [状态与副作用](./state.md) — Compose 状态基础
