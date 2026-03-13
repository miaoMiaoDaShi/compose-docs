# rememberCoroutineScope & LaunchedEffect ⚡

> 摘要：副作用 API 帮助 Compose 在声明式 UI 中安全处理协程、监听和资源清理。
>
> 适用版本：Jetpack Compose 常见版本，具体以官方 API 为准
>
> 更新时间：2026-03-13
>
> 标签：副作用，协程，LaunchedEffect，rememberCoroutineScope

## 核心概念

Composable 函数本身应尽量保持无副作用，但实际项目经常需要发起协程、监听生命周期、处理回调和释放资源。Compose 提供了一组副作用 API，让这些操作绑定到组合生命周期，而不是散落在普通函数体里。

## 关键 API / 机制

- `LaunchedEffect`：在组合生命周期内启动协程。
- `rememberCoroutineScope()`：获得与当前组合点绑定的协程作用域。
- `rememberUpdatedState()`：在不重启效应的前提下读取最新值。
- `DisposableEffect()`：处理需要注册和清理的副作用。

## 示例代码

```kotlin
LaunchedEffect(key) {
    delay(1000)
}

@Composable
fun MyScreen() {
    val scope = rememberCoroutineScope()

    Button(onClick = {
        scope.launch {
            // 在这里执行协程
        }
    }) { Text("Click") }
}

@Composable
fun LandingScreen(onTimeout: () -> Unit) {
    val currentOnTimeout by rememberUpdatedState(onTimeout)

    LaunchedEffect(true) {
        delay(2000)
        currentOnTimeout()
    }
}
```

## 常见误区

- 在 Composable 主体里直接启动协程：重组时可能重复执行。
- `LaunchedEffect(Unit)` 和 `LaunchedEffect(true)` 乱用却不理解重启条件。
- 忽略需要释放的监听和观察者，导致泄漏或重复回调。

## 最佳实践

- 把“随组合进入而开始”的工作交给 `LaunchedEffect`。
- 把“由点击等事件触发”的工作交给 `rememberCoroutineScope`。
- 当效应内部只需要读取最新回调或值时，优先考虑 `rememberUpdatedState`。

## 关联主题

- [@Composable 函数](./composable.md)
- [可组合项生命周期与重组](./lifecycle.md)
- [StateFlow / collectAsState](./stateflow.md)
