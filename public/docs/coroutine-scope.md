# rememberCoroutineScope & LaunchedEffect ⚡

## 概念

Compose 提供了多个副作用 API 来安全地处理协程和生命周期。

## LaunchedEffect

在可组合项生命周期内执行协程：

```kotlin
LaunchedEffect(key) {
    delay(1000)
    // 自动在协程中执行
}
// key 变化时会重启
```

## rememberCoroutineScope

在可组合项外启动协程，作用域绑定到组合点：

```kotlin
@Composable
fun MyScreen() {
    val scope = rememberCoroutineScope()
    
    Button(onClick = {
        scope.launch {
            // 在这里执行协程
        }
    }) { Text("Click") }
}
```

## rememberUpdatedState

在效应中引用值，但不因值变化而重启效应：

```kotlin
@Composable
fun LandingScreen(onTimeout: () -> Unit) {
    val currentOnTimeout by rememberUpdatedState(onTimeout)
    
    LaunchedEffect(true) {
        delay(2000)
        currentOnTimeout()
    }
}
```

## DisposableEffect

处理需要清理的副作用：

```kotlin
DisposableEffect(lifecycleOwner) {
    val observer = LifecycleEventObserver { _, event -> }
    lifecycleOwner.lifecycle.addObserver(observer)
    
    onDispose {
        lifecycleOwner.lifecycle.removeObserver(observer)
    }
}
```

## 效应重启规则

- 效应中使用的变量应作为参数传递
- 使用 `rememberUpdatedState` 封装不应触发重启的变量
