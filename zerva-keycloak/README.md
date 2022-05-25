# 🌱 Zerva useKeycloak

**This is a side project of [Zerva](https://github.com/holtwick/zerva)**

> Protect routes using Keycloak.

Put a `keycloak.json` file in your launch folder. You can generate it from inside Keycloak admin interface.


```js
useKeycloak({
  routes: ["/admin"]
})
```

The route `/logout` is predefined.

