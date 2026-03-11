# derivedStateOf 性能优化 🎯

## 概念

`derivedStateOf` 用于当某个状态派生自其他状态，但计算成本较高或更新频率不同时。通过限制不必要的重组来优化性能。

## 代码示例

```kotlin
@Composable
fun TodoList(todos: List<Todo>) {
    val completedTodos by remember(todos) {
        derivedStateOf { todos.filter { it.isCompleted } }
    }

    val isAllCompleted by remember(todos) {
        derivedStateOf {
            todos.isNotEmpty() && todos.all { it.isCompleted }
        }
    }

    LazyColumn {
        items(todos) { todo ->
            TodoItem(todo = todo)
        }
    }
}
```

## 使用场景

- 过滤/排序大量数据
- 计算派生状态（总数、平均值等）
- 基于多个状态的条件判断
