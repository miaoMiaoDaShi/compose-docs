# Modifier 修饰符 🔧

## 概念

Modifier 是 Compose 中的修饰符系统，用于调整 Composable 的外观和行为。可以链式调用多个修饰符，有序地应用样式。

## 代码示例

```kotlin
Text(
    text = "你好",
    modifier = Modifier
        .padding(16.dp)           // 外边距
        .background(Color.Blue)   // 背景色
        .fillMaxWidth()           // 宽度填满
        .clickable { }            // 点击事件
)
```

## 常用修饰符

| 修饰符 | 说明 |
|--------|------|
| `padding()` | 内边距 |
| `margin()` | 外边距 (通过 padding 实现) |
| `background()` | 背景色 |
| `fillMaxWidth()` | 宽度填满父容器 |
| `fillMaxHeight()` | 高度填满父容器 |
| `size()` | 指定尺寸 |
| `clickable()` | 点击事件 |
| `clip()` | 裁剪形状 |
| `border()` | 边框 |

## 关键点

- 修饰符有顺序要求，顺序影响最终效果
- 每个 Composable 都有一个 modifier 参数
- 可以自定义修饰符扩展功能
