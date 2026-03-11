# remember / mutableStateOf 🔄

## 概念

`remember` 用于在重组后保留计算结果，`mutableStateOf` 创建可观察的 Compose 状态。当状态变化时，相关 Composable 会自动重组。

## 代码示例

```kotlin
@Composable
fun Counter() {
    var count by remember { mutableStateOf(0) }
    
    Button(onClick = { count++ }) {
        Text("Count: $count")
    }
}
```

## 关键点

- `remember` 保存的值在重组时会保持不变
- `mutableStateOf<T>` 创建 `State<T>`，通过 `.value` 读写
- 当 `.value` 变化时，使用该状态的 Composable 会自动重组
- `by remember { mutableStateOf() }` 配合 `by` 委托可省略 `.value`

## 进阶写法

```kotlin
// 使用委托简化
@Composable
fun Counter() {
    var count by remember { mutableStateOf(0) }
    
    Button(onClick = { count++ }) {
        Text("Count: $count")
    }
}
```
