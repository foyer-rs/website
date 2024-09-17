# Setup Hybrid Cache

This article will guide you through the process of setting up a hybrid cache.

Setting up a hybrid is a little bit complex than setting up an in-memory cache, but not much.

Let get through it!

## 1. Add foyer as a dependency

Add this line to the `[dependencies]` section of your project's `Cargo.toml`.

```toml
foyer = "0.11"
```

If you are using a nightly version of the rust toolchain, the `nightly` feature is needed.

```toml
foyer = { version = "0.11", features = ["nightly"] }
```

## 2. Build a `HybridCache`

### 2.1 Build with a builder

`HybridCache`[^hybrid-cache] can be built via `HybridCacheBuilder`[^hybrid-cache-builder].

```rust
let mut builder = HybridCacheBuilder::new();
```

Building `HybridCache` requires a two-phase build. The first step is building the in-memory cache via `memory()`[^memory], and the second step is to build the disk cache via `storage()`[^storage].

Before building the in-memory cache and the disk cache, you can configure some basic arguments of the hybrid cache. Such setting the name and the tracing config.

```rust
let mut builder = HybridCacheBuilder::new().with_name("foyer");
```

For more details, please refer to the API document.[^hybrid-cache-builder].

:::tip dynamic tail-based tracing config

The tracing config is used for configure the dynamic tail-based tracing. It can also be modified later. To learn more, see [Tutorial - Tail-based Tracing](/docs/tutorial/tail-based-tracing).

:::

### 2.2 Build in-memory cache

Setting up the in-memory cache is the same with using `CacheBuilder`[^cache-builder] to setup `Cache`.[^cache] The only differences you don't to create a new `CacheBuilder`, just call `memory()` with the capacity on `HybridCacheBuilder`.

```rust
let mut builder = HybridCacheBuilder::new().memory(1024);
```

The default configuration count the usage by entry count. If you needs to change it or change other configurations, please refer to [Tutorial - Setup In-memory Cache - 2. Build a `Cache`](/docs/tutorial/in-memory-cache#2-build-a-cache).

### 2.3 Build disk cache

#### 2.3.1 Run on in-memory cache compatible mode

After setting up the in-memory cache, you can call `storage()` to move on to setup the disk cache.

```rust
let mut builder = HybridCacheBuilder::new().memory(1024).storage();
```

By default, the hybrid cache will **NOT** include a disk cache unless you specify a device. The hybrid cache will run on a in-memory cache compatible mode with the default configuration. All lookups to the disk will return a miss. It is useful if you want to support both in-memory cache or the hybrid cache based on your project's configuration or for debugging.

:::tip 

RisingWave[^risingwave] supports caching the LSM-tree meta and blocks in both hybrid cache mode and in-memory cache mode by whether specifying the device. To learn how RisingWave uses ***foyer***, see [Case Study - RisingWave](/docs/case-study/risingwave).

:::

#### 2.3.2 Run on hybrid cache mode with a device

To specify a device for the hybrid cache, just call `with_device_config()`[^with-device-config] and provide the device config.

***TBC ... ...***

[^hybrid-cache]: https://docs.rs/foyer/latest/foyer/struct.HybridCache.html

[^hybrid-cache-builder]: https://docs.rs/foyer/latest/foyer/struct.HybridCacheBuilder.html

[^memory]: https://docs.rs/foyer/latest/foyer/struct.HybridCacheBuilder.html#method.memory

[^storage]: https://docs.rs/foyer/latest/foyer/struct.HybridCacheBuilderPhaseMemory.html#method.storage


[^cache-builder]: https://docs.rs/foyer/latest/foyer/struct.CacheBuilder.html

[^cache]: https://docs.rs/foyer/latest/foyer/enum.Cache.html

[^risingwave]: https://github.com/risingwavelabs/risingwave

[^with-device-config]: https://docs.rs/foyer/latest/foyer/struct.HybridCacheBuilderPhaseStorage.html#method.with_device_config