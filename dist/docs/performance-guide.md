# 性能优化指南 💨

## 关键配置

- **使用 R8 发布模式构建**：启用优化和代码缩减
- **使用基准配置文件**：预编译关键代码，提升启动速度

## 最佳实践

### 1. 避免开销大的计算
```kotlin
@Composable
fun MyScreen() {
    val data = remember(key) {
        expensiveCalculation()
    }
}
```

### 2. 帮助延迟布局
```kotlin
LazyColumn {
    items(items, key = { it.id }) { item -> }
}
```

### 3. 限制不必要的重组
```kotlin
val showButton by remember {
    derivedStateOf { listState.firstVisibleItemIndex > 0 }
}
```

### 4. 推迟状态读取
```kotlin
// ✅ 使用 lambda
Text(text = state.collectAsState().value)
```
