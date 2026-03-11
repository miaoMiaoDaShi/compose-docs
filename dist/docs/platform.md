# 平台集成 - CameraX / Media3 / 拖放 📷

## CameraX 集成

```kotlin
@Composable
fun CameraPreview() {
    AndroidView(
        factory = { context ->
            PreviewView(context).apply {
                implementationMode = PreviewView.ImplementationMode.COMPATIBLE
            }
        },
        modifier = Modifier.fillMaxSize()
    )
}
```

## 拖放支持

```kotlin
Box(modifier = Modifier
    .droppable { state -> }
    .dragAndDropSource { })
```

## Media3 播放器

```kotlin
@Composable
fun VideoPlayer() {
    AndroidView(
        factory = { context -> PlayerView(context) },
        modifier = Modifier.fillMaxSize()
    )
}
```
