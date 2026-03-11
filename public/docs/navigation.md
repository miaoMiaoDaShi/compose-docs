# Navigation Compose 3.0 🧭

## 概念

Navigation Compose 3.0 提供了更强大的导航控制，简化了复杂导航流程。支持多航点、深度链接和类型安全的参数传递。

## 代码示例

```kotlin
// 定义导航图
@Composable
fun MyNavHost() {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = "home"
    ) {
        composable("home") {
            HomeScreen(
                onNavigateToDetail = { itemId ->
                    navController.navigate("detail/$itemId")
                }
            )
        }
        composable(
            route = "detail/{itemId}",
            arguments = listOf(
                navArgument("itemId") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val itemId = backStackEntry.arguments?.getString("itemId")
            DetailScreen(itemId = itemId)
        }
    }
}
```

## 3.0 新特性

- **类型安全导航**: 使用 Safe Args 插件自动生成类型安全的导航类
- **导航图嵌套**: 支持模块化导航图
- **动画支持**: 内置共享元素转场动画
- **deeplink**: 更容易处理深度链接
