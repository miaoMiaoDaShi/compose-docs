# @Composable 函数 ⚡

## 概念

Composable 函数是 Jetpack Compose 的核心构建块。任何带有 `@Composable` 注解的函数都可以描述 UI。

## 代码示例

```kotlin
@Composable
fun Greeting(name: String) {
    Text(
        text = "Hello, $name!",
        style = MaterialTheme.typography.h1
    )
}
```

## 关键点

- `@Composable` 注解告诉编译器这个函数会调用 Compose runtime
- Composable 函数可以是 suspending 函数
- 重组(Recomposition)会在状态变化时自动发生
- Composable 函数可以嵌套调用其他 Composable
