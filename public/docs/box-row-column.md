# 布局组件 Box / Row / Column 📦

## 概念

Compose 提供了三个最常用的基础布局组件：
- **Box**: 叠加布局
- **Row**: 水平排列
- **Column**: 垂直排列

## 代码示例

```kotlin
// Column: 垂直排列
Column(
    modifier = Modifier.fillMaxSize(),
    horizontalAlignment = Alignment.CenterHorizontally
) {
    Text("第一行")
    Text("第二行")
}

// Row: 水平排列
Row(
    modifier = Modifier.fillMaxWidth(),
    verticalAlignment = Alignment.CenterVertically
) {
    Text("左边")
    Text("右边")
}

// Box: 叠加布局
Box(
    modifier = Modifier.fillMaxSize(),
    contentAlignment = Alignment.Center
) {
    Text("居中")
}
```

## 对齐方式

| 组件 | 对齐参数 |
|------|----------|
| Column | `horizontalAlignment`, `verticalArrangement` |
| Row | `verticalAlignment`, `horizontalArrangement` |
| Box | `contentAlignment` |

## 常用 Modifier

- `fillMaxSize()` - 填满父容器
- `fillMaxWidth()` - 宽度填满
- `fillMaxHeight()` - 高度填满
- `padding()` - 内边距
- `size()` - 指定尺寸
