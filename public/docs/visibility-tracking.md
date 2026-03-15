# Visibility Tracking - 可见性跟踪

> 摘要：Compose 1.8 引入的可见性跟踪 API，让开发者能够监听元素在视口中的可见状态变化，适用于分析、懒加载和性能优化场景。
>
> 适用版本：Compose 1.8+ / Kotlin 1.9+
>
> 更新时间：2026-03-14
>
> 标签：性能优化，LazyColumn，可见性，Compose 1.8

## 核心概念

可见性跟踪 API 解决了长期以来的需求：监听 Composable 在屏幕上的可见性变化。这对于以下场景特别有用：

- **Analytics（分析）**：跟踪用户实际看到了哪些内容
- **Lazy Loading（懒加载）**：仅在内容可见时加载数据
- **Performance（性能）**：暂停不在屏幕上的媒体播放

## 关键 API

- `Modifier.onVisibilityChanged()`：可见性变化回调
- `Visibility`：表示元素当前可见性状态的枚举
- `onFirstVisible`：获取第一个可见元素的回调
- `visibleFraction`：可见比例（0.0 到 1.0）

## 示例代码

### 基本用法

```kotlin
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.unit.dp
import androidx.compose.ui.layout.onVisibilityChanged

enum class Visibility {
    Visible,
    NotVisible
}

@Composable
fun VisibilityTracker(
    itemId: String,
    onVisibilityChanged: (Visibility) -> Unit
) {
    var currentVisibility by remember { mutableStateOf(Visibility.NotVisible) }
    
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(200.dp)
            .onVisibilityChanged { visibility ->
                currentVisibility = visibility
                onVisibilityChanged(visibility)
            },
        contentAlignment = Alignment.Center
    ) {
        Text("Item: $itemId, Visibility: ${currentVisibility.name}")
    }
}
```

### 在 LazyColumn 中跟踪可见性

```kotlin
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.layout.positionInRoot
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.layout.onVisibilityChanged
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding

data class ListItem(
    val id: Int,
    val title: String
)

@Composable
fun AnalyticsLazyColumn(
    items: List<ListItem>
) {
    LazyColumn {
        items(
            items = items,
            key = { it.id }
        ) { item ->
            var visibility by remember { mutableStateOf(Visibility.NotVisible) }
            
            LaunchedEffect(item.id) {
                // 可以在这里发送分析事件
            }
            
            Text(
                text = item.title,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
                    .onVisibilityChanged { newVisibility ->
                        visibility = newVisibility
                        when (newVisibility) {
                            Visibility.Visible -> {
                                println("Item ${item.id} is now visible")
                            }
                            Visibility.NotVisible -> {
                                println("Item ${item.id} is not visible")
                            }
                        }
                    }
            )
        }
    }
}
```

### 设置最小可见比例

```kotlin
@Composable
fun MinimumVisibilityDemo() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(300.dp)
            // 只在 50% 可见时触发回调
            .onVisibilityChanged(
                visibleFraction = 0.5f
            ) { visibility ->
                println("Visibility changed: $visibility")
            }
    )
}
```

### 定时可见性检测

```kotlin
@Composable
fun TimedVisibilityDemo() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(200.dp)
            // 元素可见 1 秒后才触发回调
            .onVisibilityChanged(
                1000L
            ) { visibility ->
                if (visibility == Visibility.Visible) {
                    println("Element has been visible for 1 second")
                }
            }
    )
}
```

### onFirstVisible - 获取第一个可见项

```kotlin
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.runtime.LaunchedEffect

@Composable
fun FirstVisibleItemDemo(items: List<String>) {
    val listState = rememberLazyListState()
    var firstVisibleItem by remember { mutableStateOf<Int?>(null) }
    
    LazyColumn(state = listState) {
        items(items.size) { index ->
            Text(
                text = items[index],
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            )
        }
    }
    
    LaunchedEffect(listState) {
        // 检查 firstVisibleItemIndex
        val firstIndex = listState.firstVisibleItemIndex
    }
}
```

## 常见误区

- **误区 1**：在重组中执行重操作 → 可见性回调可能在重组中多次触发，避免执行耗时操作
- **误区 2**：不处理 NotVisible 状态 → 记得在元素不可见时清理资源（如暂停视频）
- **误区 3**：过度使用可见性跟踪 → 仅在必要时使用，频繁的可见性检测会影响性能

## 最佳实践

- 使用 `key` 参数为 LazyColumn/LazyRow 中的项目设置稳定键，确保正确跟踪
- 结合 `visibleFraction` 参数过滤短暂的可见性变化
- 使用时间阈值避免快速滚动时的频繁回调
- 在 NotVisible 时释放资源（如取消网络请求、暂停媒体播放）
- 对于 Analytics 场景，使用抽样或批量发送减少服务器压力

## 关联主题

- [LazyColumn / LazyRow](./lazy-list.md)
- [性能优化指南](./performance-guide.md)
- [StateFlow / collectAsState](./stateflow.md)
