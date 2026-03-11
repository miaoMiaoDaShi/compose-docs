# 富文本 & 2D 滚动 📝

## 富文本

```kotlin
Text(
    buildAnnotatedString {
        append("这是 ")
        withStyle(SpanStyle(fontWeight = FontWeight.Bold)) { append("粗体") }
        append(" 和 ")
        withStyle(SpanStyle(color = Color.Red)) { append("红色") }
    }
)
```

## 2D 滚动

```kotlin
LazyVerticalGrid(
    columns = GridCells.Adaptive(minSize = 128.dp),
    contentPadding = PaddingValues(16.dp)
) {
    items(items) { item -> GridItem(item) }
}
```
