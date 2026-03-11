# 可组合项生命周期与重组 🔄

## 生命周期三阶段

进入 → 重组(0+次) → 退出

## key() - 稳定的身份标识

```kotlin
@Composable
fun MoviesScreen(movies: List<Movie>) {
    Column {
        for (movie in movies) {
            key(movie.id) { MovieOverview(movie) }
        }
    }
}
```

## 跳过重组的条件

1. 函数有非 Unit 返回类型
2. 函数有 @NonRestartableComposable 注解
3. 参数类型不稳定
