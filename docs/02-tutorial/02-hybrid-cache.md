# Setup Hybrid Cache

This article will guide you through the process of setting up a hybrid cache.

Setting up a hybrid is a little bit complex than setting up an in-memory cache, but not much.

Let get through it!

## 1. Add foyer as a dependency

Add this line to the `[dependencies]` section of your project's `Cargo.toml`.

```toml
foyer = "0.17"
```

If you are using a nightly version of the rust toolchain, the `nightly` feature is needed.

```toml
foyer = { version = "0.17", features = ["nightly"] }
```

## 2. Build a `HybridCache`

### 2.1 Create a builder.

`HybridCache`[^hybrid-cache] can be built via `HybridCacheBuilder`[^hybrid-cache-builder]. You can create a new `HybridCacheBuilder` with `HybridCache::builder()` API.

```rust
use foyer::HybridCache;

// ... ...

let mut builder = HybridCache::<String, String>::builder();
```

The `HybridCache` can be built in 3 phases:

1. Setup common configurations, such as the foyer instance name, metrics registry, etc.
2. Setup in-memory cache configurations via `memory()`[^memory] API.
3. Setup disk cache configurations via `storage()`[^storage] API.

### 2.2 Setup common configurations

The common configurations can be setup with `HybridCacheBuilder`.

For example, to setup the foyer instance name as `"foyer"`:

```rust
let mut builder = HybridCache::<String, String>::builder().with_name("foyer");
```

For more details, please refer to the API document.[^hybrid-cache-builder].

### 2.3 Setup in-memory cache configurations

Setting up the in-memory cache is the same with using `CacheBuilder`[^cache-builder] to setup `Cache`.[^cache] The only differences you don't to create a new `CacheBuilder`, just call `memory()` with the capacity on `HybridCacheBuilder`.

```rust
let mut builder = HybridCache::<String, String>::builder().memory(1024);
```

The default configuration counts the cache usage by entry count. If you need to count it by actual memory usage or need to change other configurations, please refer to [Tutorial - Setup In-memory Cache - 2. Build a `Cache`](/docs/tutorial/in-memory-cache#2-build-a-cache).

### 2.4 Setup disk cache configurations

After setting up the in-memory cache, you can move on to setup the disk cache.

#### 2.4.1 Setup disk cache engine

***foyer*** supports 2 types of disk cache engines:

- **large object disk cache (RECOMMENDED)**: Suitable for most cache entries. Friendly to HDD/SSD while minimizing memory usage for indexing.
- **small object disk cache**: Optimized for storing a large amount of small cach entries (~2 KiB) with almost no memory overhead because it does not use memory for indexing.

***foyer*** supports 3 combinations of these 2 storage engines:

- `Engine::Large` **(RECOMMENDED)**: Use **large object disk cache** only.
- `Engine::Small`: Use **small object disk cache** only.
- `Engine::Mixed`: Combination of **large object disk cache** and **small object disk cache**. A ratio can be set to decide how much space will be used for **large object disk cache** and **small object disk cache**. And a threshold can be set to decide which engine to use to store a cache entry by size. 



<-------- configuration -------->








#### 2.4.2 Setup device options

By default, the hybrid cache builer is configured with a phantom device that always returns cache miss for 
debugging or for in-memory cache mode compatiblility. To enable the real disk cache, please provide the device options by `with_device_options()`[^with-device-options].

***foyer*** supports disk cache upon a file system directory, or directly on a raw block device:

1. `DirectFsDevice`[^direct-fs-device]: Setup disk cache upon a file system directory. Performs direct I/O.[^direct-io] 
2. `DirectFileDevice`[^direct-file-device]: Setup disk cache on a raw block device. Performs direct I/O.[^direct-io]

Let's take `DirectFsDevice` as an example:

```rust
let hybrid: HybridCache<u64, String> = HybridCacheBuilder::new()
    .with_name("foyer")
    .memory(1024)
    .storage(Engine::Large)
    .with_device_options(DirectFsDeviceOptions::new("/data/foyer"))
    .build()
    .await
    .unwrap();
```

This example uses directory `/data/foyer` to store disk cache data using a device options builder. With the default configuration, ***foyer*** will take 80% of the current free space as the disk cache capacity. You can also specify the disk cache capacity and per file size with the builder.

For more details, please refer to the API document.[^direct-fs-device-options] [^direct-file-device-options]




















#### 2.4.2 Choose a proper engine

To setup the disk cache, you need to choose a proper engine for your workload first. Currently, ***foyer*** support 3 kinds of engines:

- `Engine::Large` **(RECOMMENDED)**: For cache entries larger than 2 KiB. Friendly to HDD/SSD while minimizing memory usage for indexing.
- `Engine::Small`: For cache entries smaller than 2 KiB. A set-associated cache that does not use memory for indexing.
- `Engine::Mixed(ratio)`: For cache entries in all sizes. Mixed `Engine::Large` and `Engine::Small`. Use `ratio` to control the proportion of the capacity of `Engine::Small`. Introducing a little overhead compared to using `Engine::Large` and `Engine::Small` separately.

For more details about the engines, please refer to [Design - Architecture](/docs/design/architecture).

:::warning

`Engine::Small` and `Engine::Mixed` are preview version and have **NOT** undergone sufficient testing in production environments. Please use them with caution in production systems.

If you have such needs, you can contact me via Github. We can work together to improve the system for production and make ***foyer*** better! 🥰

:::





By default, the hybrid cache will **NOT** include a disk cache unless you specify a device. The hybrid cache will run on a in-memory cache compatible mode with the default configuration. All lookups to the disk will return a miss. It is useful if you want to support both in-memory cache or the hybrid cache based on your project's configuration or for debugging.

#### 2.4.2 Setup shared options

Some options are shared between engines, you can setup shared options before setting up engine-specific options.

##### 2.4.2.1 Setup device options

By default, the hybrid cache will **NOT** include a disk cache unless you specify a device. The hybrid cache will run on a in-memory cache compatible mode with the default configuration. All lookups to the disk will return a miss. It is useful if you want to support both in-memory cache or the hybrid cache based on your project's configuration or for debugging.

:::tip 

RisingWave[^risingwave] supports caching the LSM-tree meta and blocks in both hybrid cache mode and in-memory cache mode by whether specifying the device. To learn how RisingWave uses ***foyer***, see [Case Study - RisingWave](/docs/case-study/risingwave).

:::

To enable the hybrid cache mode, a device needs to be specified by calling `with_device_options()`[^with-device-options] and providing the device options.

Currently, the storage of the hybrid cache supports 2 kinds of devices:

1. `DirectFsDevice`[^direct-fs-device]: Setup within a directory of a file system with direct I/O[^direct-io] files. 
2. `DirectFileDevice`[^direct-file-device]: Setup with a raw block device (block file) or a direct I/O[^direct-io] file in a file system. 

Determine which kind of device to use depends on your needs. If you want to utilize the spare space of an existing file system, `DirectFsDevice` is all you need. If you want to overcome the overhead of the file system, use `DirectFileDevice` on a raw block device. And **NEVER** use a `DirectFileDevice` within a file system. The `inode` latch will make the overhead of the file system layer worse.

:::tip

For more details about the overhead of the file system layer, see [Topic - Overhead of the File System Layer](/docs/topic/overhead-of-the-file-system-layer)

:::

Let's take `DirectFsDevice` as an example:

```rust
let hybrid: HybridCache<u64, String> = HybridCacheBuilder::new()
    .with_name("foyer")
    .memory(1024)
    .storage(Engine::Large)
    .with_device_options(DirectFsDeviceOptions::new("/data/foyer"))
    .build()
    .await
    .unwrap();
```

This example uses directory `/data/foyer` to store disk cache data using a device options builder. With the default configuration, ***foyer*** will take 80% of the current free space as the disk cache capacity. You can also specify the disk cache capacity and per file size with the builder.

For more details, please refer to the API document.[^direct-fs-device-options] [^direct-file-device-options]

##### 2.4.2.2 Restrict the throughput

The bandwidth of the disk is much lower than the bandwidth of the memory. To avoid excessive use of the disk bandwidth, it is **HIGHLY RECOMMENDED** to setup the admission picker with a rate limiter.

```rust
let hybrid: HybridCache<u64, String> = HybridCacheBuilder::new()
    .with_name("foyer")
    .memory(1024)
    .storage(Engine::Large)
    .with_device_options(DirectFsDeviceOptions::new("/data/foyer"))
    .build()
    .await
    .unwrap();
```

You can also customize the admission picker with your own admission policy. For more details, please refer to the API document.[^admission-picker]

:::tip admission picker

Admission means allowing an entry to be inserted into the disk cache. And a admission picker can be used to customize the admission policy.

For more details, please refer to [Design - Architecture](/docs/design/architecture).

:::

##### 2.4.2.3 Other shared options

There are also other shared options for tuning or other purposes.

- `with_runtime_options()`: Set the runtime options to enable and setup the dedicated runtime.
- `with_compression()`: Set the compression algorithm for serialization and deserialization.
- `with_recover_mode()`: Set the recover mode.
- `with_flush()`: Set if trigger a flush operation after writing the disk.
- ...

For more details, please refer to the API document.[^hybrid-cache-builder]

:::tip

Tuning the optimized parameters requires an understanding of ***foyer*** interior design and benchmarking with the real workload. For more details, please refer to [Topic - Tuning](/docs/topic/tuning) and [Design - Architecture](/docs/design/architecture).

:::

#### 2.4.3 Setup engine-specific options

Each engine also has its specific options for tuning or other purposes.

- `with_large_object_disk_cache_options()`[^with-large-object-disk-cache-options]: Set the options for the large object disk cache.
- `with_small_object_disk_cache_options()`[^with-small-object-disk-cache-options]: Set the options for the small object disk cache.

For more details, please refer to the API document [^large-engine-options] [^small-engine-options].

## 3. `HybridCache` Usage

`HybridCache` provides similar interfaces to `Cache` and caches from any other cache library. The difference is that `HybridCache` uses `async` for methods if necessary, while also introducing some advanced methods. There is a brief:

- `fn insert()`: Insert cache entry to the hybrid cache.
- `fn remove()`: Remove a cached entry with the given key from the hybrid cache.
- `fn contains()`: Check if the hybrid cache contains a cached entry that has the given key with false-positive results.
- `async fn get()`: Get cached entry with the given key from the hybrid cache.
- `async fn obtain()`: Get cached entry with the given key from the hybrid cache with requests deduplication on the same key.
- `async fn fetch()`: Fetch and insert a cache entry with the given key and method if there is a cache miss with requests deduplication on the same key.

:::tip

The full method list and detailed document can be found in the API document.[^hybrid-cache]

:::

The insertion part looks no difference from an in-memory cache. The lookup part, however, are all asynchronous.

For most cases, `fetch()` is always recommended for it performs request deduplication and auto cache filling on cache miss. `fetch()` receives a key and the asynchronous fetch method to get the value from a remote storage on cache miss.

```rust
let entry = hybrid
    .fetch(42, || async move {
        tokio::time::sleep(std::time::Duration::from_secs(1)).await;
        Ok("The answer to life universe and everything.".to_string())
    })
    .await
    .unwrap();
```

The hybrid cache also provides a `writer()` interface for advanced usage, such as insert disk cache only, force insertion, etc. For details, please refer to the API document.[^hybrid-cache-writer]

[^hybrid-cache]: https://docs.rs/foyer/latest/foyer/struct.HybridCache.html

[^hybrid-cache-builder]: https://docs.rs/foyer/latest/foyer/struct.HybridCacheBuilder.html

[^memory]: https://docs.rs/foyer/latest/foyer/struct.HybridCacheBuilder.html#method.memory

[^storage]: https://docs.rs/foyer/latest/foyer/struct.HybridCacheBuilderPhaseMemory.html#method.storage

[^cache-builder]: https://docs.rs/foyer/latest/foyer/struct.CacheBuilder.html

[^cache]: https://docs.rs/foyer/latest/foyer/enum.Cache.html

[^risingwave]: https://github.com/risingwavelabs/risingwave

[^with-device-options]: https://docs.rs/foyer/latest/foyer/struct.HybridCacheBuilderPhaseStorage.html#method.with_device_options

[^direct-fs-device]: https://docs.rs/foyer/latest/foyer/struct.DirectFsDevice.html

[^direct-file-device]: https://docs.rs/foyer/latest/foyer/struct.DirectFileDevice.html

[^direct-io]: https://linux.die.net/HOWTO/SCSI-Generic-HOWTO/dio.html

[^direct-fs-device-options-builder]: https://docs.rs/foyer/latest/foyer/struct.DirectFsDeviceOptionsBuilder.html

[^direct-file-device-options]: https://docs.rs/foyer/latest/foyer/struct.DirectFileDeviceOptions.html

[^admission-picker]: https://docs.rs/foyer/latest/foyer/trait.AdmissionPicker.html

[^hybrid-cache-writer]: https://docs.rs/foyer/latest/foyer/struct.HybridCacheWriter.html

[^with-large-object-disk-cache-options]: https://docs.rs/foyer/latest/foyer/struct.HybridCacheBuilderPhaseStorage.html#method.with_large_object_disk_cache_options

[^with-small-object-disk-cache-options]: https://docs.rs/foyer/latest/foyer/struct.HybridCacheBuilderPhaseStorage.html#method.with_small_object_disk_cache_options

[^large-engine-options]: https://docs.rs/foyer/latest/foyer/struct.LargeEngineOptions.html

[^small-engine-options]: https://docs.rs/foyer/latest/foyer/struct.SmallEngineOptions.html