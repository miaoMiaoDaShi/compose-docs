# Canvas 绘图与自定义图形 ✏️

## Canvas 基础

```kotlin
@Composable
fun MyCanvas() {
    Canvas(modifier = Modifier.size(200.dp)) {
        val canvasWidth = size.width
        val canvasHeight = size.height
    }
}
```

## 基本图形

- `drawLine()` - 画线
- `drawRect()` - 画矩形
- `drawCircle()` - 画圆形
- `drawArc()` - 画弧形

## 常用场景

- 自定义图表（折线图、饼图）
- 进度指示器
- 手绘效果
- 特殊形状组件
