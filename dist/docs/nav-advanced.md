# Navigation Compose 进阶技巧 🧭✨

## 使用参数导航

```kotlin
@Serializable data class Profile(val id: String)

navController.navigate(Profile(id = "user1234"))

composable<Profile> { backStackEntry ->
    val profile = backStackEntry.toRoute<Profile>()
    ProfileScreen(userId = profile.id)
}
```

## 深层链接

```kotlin
composable<Profile>(
    deepLinks = listOf(
        navDeepLink<Profile>(basePath = "https://example.com/profile")
    )
) { }
```

## 最佳实践

❌ 不推荐：直接传递 NavController
✅ 推荐：传递导航回调

```kotlin
fun ProfileScreen(
    userId: String,
    navigateToFriendProfile: (String) -> Unit
) { }
```
