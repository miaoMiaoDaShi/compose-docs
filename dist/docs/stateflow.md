# StateFlow / collectAsState 🌊

## 概念

StateFlow 是 Kotlin Flow 的一种，适合在 ViewModel 中管理状态。`collectAsState` 将 Flow 转为 Compose 可观察的状态。

## 代码示例

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

## 状态管理对比

| API | 作用域 | 持久化 |
|-----|--------|--------|
| remember | 重组期间 | 重组期间 |
| rememberSaveable | 配置变更 + 进程死亡 | 跨进程 |
| StateFlow | ViewModel | 配置变更 |

## 最佳实践

- 在 ViewModel 中使用 StateFlow 管理状态
- 使用 `by` 委托简化代码
- 配合 `collectAsStateWithLifecycle` 感知生命周期
