# 共用元素过渡动画 ✨

## 概念

共用元素过渡动画允许在两个页面之间共享的 UI 元素进行平滑过渡。

## 代码示例

```kotlin
// 列表项
SharedBounds(
    sharedContentState = rememberSharedContentState(key = "image-$imageUrl")
) {
    AsyncImage(model = imageUrl, contentDescription = null)
}

// 详情页
SharedBounds(
    sharedContentState = rememberSharedContentState(key = "image-$imageUrl")
) {
    AsyncImage(model = imageUrl, contentDescription = null)
}
```

## 使用场景

- 图片从列表过渡到详情页
- 卡片展开为全屏内容
- 列表项到详情页的平滑过渡
