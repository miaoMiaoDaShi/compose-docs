# StateFlow / collectAsState 🌊

> 摘要：`StateFlow` 适合承载界面状态，`collectAsState` 负责把 Flow 桥接到 Compose。
>
> 适用版本：Jetpack Compose 常见版本，具体以官方 API 为准
>
> 更新时间：2026-03-13
>
> 标签：状态，StateFlow，ViewModel，Flow

## 核心概念

当状态已经提升到 ViewModel 层时，`StateFlow` 是很常见的状态容器。Compose 侧通过 `collectAsState()` 或 `collectAsStateWithLifecycle()` 订阅它，把流式数据转换成可驱动界面的 State。

## 关键 API / 机制

- `MutableStateFlow`：在 ViewModel 中维护可变状态源。
- `StateFlow`：对外暴露只读状态，避免外部直接修改。
- `collectAsState()`：把 Flow 收集成 Compose 的 `State<T>`。
- `collectAsStateWithLifecycle()`：在界面层更适合的生命周期感知收集方式。

## 示例代码

```kotlin
// ViewModel
class MyViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(UiState())
    val uiState: StateFlow<UiState> = _uiState

    fun updateData() {
        _uiState.value = _uiState.value.copy(loading = true)
    }
}

// Compose
@Composable
fun MyScreen(viewModel: MyViewModel = viewModel()) {
    val state by viewModel.uiState.collectAsState()
    Text("Loading: ${state.loading}")
}
```

## 常见误区

- 在 Composable 内部直接创建新的 `MutableStateFlow`：这会让状态生命周期混乱。
- 暴露可变流给 UI 层：容易导致状态被随意修改。
- 在界面层长期使用普通 `collectAsState()` 却忽略生命周期：后台页面可能继续无谓收集。

## 最佳实践

- 在 ViewModel 中使用 `MutableStateFlow` 持有内部状态，对外暴露 `StateFlow`。
- 优先在界面层使用 `collectAsStateWithLifecycle()`。
- 把 UI 状态建模成单一 `UiState`，避免界面同时订阅过多零散流。

## 关联主题

- [remember / mutableStateOf](./state.md)
- [derivedStateOf 性能优化](./derived-state.md)
- [rememberCoroutineScope & LaunchedEffect](./coroutine-scope.md)
